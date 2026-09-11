import {
  CITY_MARKET_CONTEXT, CITY_SURVEY_AGGREGATES, DATA_QUALITY, MARKET_CONTEXT,
  QUALITATIVE_EVIDENCE, SEGMENT_EVIDENCE,
} from './germanMarketData.mjs';

const SCORE_MAX = {
  marketSize: 20,
  marketGrowth: 10,
  purchaseIntent: 20,
  spending: 10,
  purchaseFrequency: 10,
  priceResilience: 5,
  launchChannelPreference: 10,
  segmentFit: 10,
  competitiveAwareness: 5,
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));

function scoreComponents(market, survey) {
  return {
    marketSize: round(clamp(market.marketSharePct / 18, 0, 1) * SCORE_MAX.marketSize),
    marketGrowth: round(clamp((market.regionalGrowthPct - 7) / 2, 0, 1) * SCORE_MAX.marketGrowth),
    purchaseIntent: round(clamp(survey.purchaseIntent / 10, 0, 1) * SCORE_MAX.purchaseIntent),
    spending: round(clamp(survey.monthlySpendEur / 25, 0, 1) * SCORE_MAX.spending),
    purchaseFrequency: round(clamp(survey.purchaseFrequencyPerMonth / 10, 0, 1) * SCORE_MAX.purchaseFrequency),
    priceResilience: round(clamp((10 - survey.priceSensitivity) / 9, 0, 1) * SCORE_MAX.priceResilience),
    launchChannelPreference: round(clamp(survey.launchChannelPreferencePct / 100, 0, 1) * SCORE_MAX.launchChannelPreference),
    segmentFit: round(clamp(survey.highIntentSegmentPct / 100, 0, 1) * SCORE_MAX.segmentFit),
    competitiveAwareness: round(clamp((100 - survey.competitorAwarenessPct) / 100, 0, 1) * SCORE_MAX.competitiveAwareness),
  };
}

function componentDetails(market, survey, components) {
  return [
    { key: 'marketSize', label: 'Market size proxy', score: components.marketSize, max: 20, value: `${market.marketSharePct.toFixed(1)}% illustrative regional share` },
    { key: 'marketGrowth', label: 'Regional growth', score: components.marketGrowth, max: 10, value: `${market.regionalGrowthPct.toFixed(1)}% regional CAGR` },
    { key: 'purchaseIntent', label: 'Purchase intent', score: components.purchaseIntent, max: 20, value: `${survey.purchaseIntent.toFixed(1)}/10` },
    { key: 'spending', label: 'Monthly beverage spending', score: components.spending, max: 10, value: `€${survey.monthlySpendEur.toFixed(2)}/month` },
    { key: 'purchaseFrequency', label: 'Purchase frequency', score: components.purchaseFrequency, max: 10, value: `${survey.purchaseFrequencyPerMonth.toFixed(1)}/month` },
    { key: 'priceResilience', label: 'Price resilience', score: components.priceResilience, max: 5, value: `${survey.priceSensitivity.toFixed(1)}/10 price sensitivity (lower is stronger)` },
    { key: 'launchChannelPreference', label: 'DTC + Gym & Office preference', score: components.launchChannelPreference, max: 10, value: `${survey.launchChannelPreferencePct.toFixed(1)}% of respondents` },
    { key: 'segmentFit', label: 'High-intent segment mix', score: components.segmentFit, max: 10, value: `${survey.highIntentSegmentPct.toFixed(1)}% Urban Wellness Professionals + Fitness & Gym-Goers` },
    { key: 'competitiveAwareness', label: 'Competitor awareness context', score: components.competitiveAwareness, max: 5, value: `${survey.competitorAwarenessPct.toFixed(1)}% mean awareness across four competitors (lower scores as less established competitive attention)` },
  ];
}

function cityUncertainties(market, survey) {
  const notes = [
    'No German LUMEN sales, repeat rate, conversion rate or city-level distribution data exists in the supplied data.',
    'Survey measures stated intent and preference, not observed purchase behaviour.',
    'Market potential is a sizing proxy: national 2026 category value × illustrative regional share, not a LUMEN revenue forecast.',
  ];
  if (survey.sampleSize < 50) notes.push(`Survey base is ${survey.sampleSize}; treat city differences as directional rather than precise.`);
  if (!market.eligibleForCityLaunch) notes.push(market.aggregateNote);
  return notes;
}

function buildResult(market, survey) {
  const components = scoreComponents(market, survey);
  const score = round(Object.values(components).reduce((total, value) => total + value, 0));
  const drivers = componentDetails(market, survey, components).sort((a, b) => b.score / b.max - a.score / a.max);
  return {
    cityOrRegion: market.city,
    eligibleForCityLaunch: market.eligibleForCityLaunch,
    score,
    scoreComponents: components,
    scoreComponentDetails: drivers,
    mainDrivers: drivers.slice(0, 3).map(({ label, value, score, max }) => `${label}: ${value} (${score}/${max})`),
    customerEvidence: {
      source: 'German survey evidence — data/customer_survey.csv (Exhibit 4), aggregated and non-identifying',
      sampleSize: survey.sampleSize,
      purchaseIntentOutOf10: survey.purchaseIntent,
      monthlyBeverageSpendEur: survey.monthlySpendEur,
      purchaseFrequencyPerMonth: survey.purchaseFrequencyPerMonth,
      priceSensitivityOutOf10: survey.priceSensitivity,
      dtcAndGymOfficePreferencePct: survey.launchChannelPreferencePct,
      highIntentSegmentPct: survey.highIntentSegmentPct,
      meanCompetitorAwarenessPct: survey.competitorAwarenessPct,
      privacy: 'Only city-level aggregates are retained. No names, emails, respondent IDs or raw respondent rows are exposed.',
    },
    marketEvidence: {
      source: 'German market context — data/market_context.csv (Exhibit 1)',
      nationalFunctionalBeverageMarket2026Eur: MARKET_CONTEXT.germanyFunctionalBeverageMarket2026Eur,
      nationalCategoryCagrPct: MARKET_CONTEXT.categoryCagrPct,
      illustrativeRegionalSharePct: market.marketSharePct,
      regionalGrowthPct: market.regionalGrowthPct,
      marketPotentialProxyEur: round(MARKET_CONTEXT.germanyFunctionalBeverageMarket2026Eur * market.marketSharePct / 100, 0),
      caveat: MARKET_CONTEXT.note,
    },
    qualitativeEvidence: QUALITATIVE_EVIDENCE,
    uncertainties: cityUncertainties(market, survey),
    assumptions: [
      'Urban Wellness Professionals and Fitness & Gym-Goers are treated as high-intent segments because their aggregate purchase intent is the two highest segment averages in the German survey.',
      'DTC Online and Gym & Office are treated as launch-learning channels for the preference component only; this module makes no channel recommendation.',
      'Lower competitor awareness receives a small context score. It is not a measure of LUMEN awareness, which is not supplied.',
    ],
  };
}

export function scoringMethodology() {
  return {
    totalScore: 100,
    components: [
      { key: 'marketSize', weight: 20, rule: 'Illustrative regional market share ÷ 18% (the largest named-city share), capped at 20.' },
      { key: 'marketGrowth', weight: 10, rule: 'Regional CAGR scaled from 7% = 0 to 9% = 10.' },
      { key: 'purchaseIntent', weight: 20, rule: 'Mean stated LUMEN purchase intent ÷ 10.' },
      { key: 'spending', weight: 10, rule: 'Mean monthly beverage spend ÷ €25, capped at 10.' },
      { key: 'purchaseFrequency', weight: 10, rule: 'Mean monthly purchase frequency ÷ 10, capped at 10.' },
      { key: 'priceResilience', weight: 5, rule: 'Inverse of mean 1–10 price sensitivity: (10 − sensitivity) ÷ 9.' },
      { key: 'launchChannelPreference', weight: 10, rule: 'Share selecting DTC Online or Gym & Office as preferred channel.' },
      { key: 'segmentFit', weight: 10, rule: 'Share of Urban Wellness Professionals plus Fitness & Gym-Goers.' },
      { key: 'competitiveAwareness', weight: 5, rule: 'Inverse mean awareness of the four supplied competitors; context only, not LUMEN awareness.' },
    ],
    interpretation: 'The score is a transparent prioritisation heuristic, not a revenue forecast or a causal model. Each raw input and contribution is returned with every location.',
  };
}

export function buildGermanMarketPrioritisation({ marketContext = CITY_MARKET_CONTEXT, surveyAggregates = CITY_SURVEY_AGGREGATES } = {}) {
  const surveyByCity = new Map(surveyAggregates.map((row) => [row.city, row]));
  const missingSurveyCities = marketContext.filter((row) => !surveyByCity.has(row.city)).map((row) => row.city);
  const results = marketContext
    .filter((market) => surveyByCity.has(market.city))
    .map((market) => buildResult(market, surveyByCity.get(market.city)))
    .sort((a, b) => b.score - a.score || a.cityOrRegion.localeCompare(b.cityOrRegion));
  const rankedLaunchCities = results.filter((result) => result.eligibleForCityLaunch);

  return {
    methodology: scoringMethodology(),
    evidenceBoundary: {
      germanSurveyEvidence: 'Used for stated intent, spend, frequency, price sensitivity, channel preference, segment mix and competitor awareness context.',
      germanMarketContext: 'Used for national functional-beverage market context, illustrative regional share and regional growth.',
      historicalLumenEvidence: 'Not used. Historical LUMEN sales are from Netherlands, Denmark and Sweden only and cannot be represented as German sales.',
      assumptions: 'Scoring caps, component weights and the high-intent segment definition are disclosed in methodology and each result.',
    },
    dataQuality: [...DATA_QUALITY, ...(missingSurveyCities.length ? [`Missing survey aggregate for: ${missingSurveyCities.join(', ')}.`] : [])],
    segmentEvidence: SEGMENT_EVIDENCE,
    qualitativeEvidence: QUALITATIVE_EVIDENCE,
    results,
    executiveRecommendationInput: {
      recommendedInitialCities: rankedLaunchCities.slice(0, 2).map((result) => result.cityOrRegion),
      rankedEligibleCities: rankedLaunchCities.map(({ cityOrRegion, score }) => ({ cityOrRegion, score })),
      decisionUse: 'Use as a transparent market-priority input. A future executive layer must combine it with pricing, channel feasibility and timing evidence before making a launch decision.',
    },
  };
}
