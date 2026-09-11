import { CITY_EVIDENCE, MARKET_CONTEXT, QUALITATIVE_EVIDENCE } from './safeMarketAggregates.js';

export const SCORE_WEIGHTS = {
  marketScale: 35,
  regionalGrowth: 15,
  purchaseIntent: 20,
  targetSegmentFit: 15,
  monthlySpend: 15,
};

const max = (rows, field) => Math.max(...rows.map((row) => row[field]));
const score = (value, maximum, weight) => Number(((value / maximum) * weight).toFixed(1));

export function buildGermanMarketPrioritisation(cities = CITY_EVIDENCE) {
  const maxima = {
    marketShare: max(cities, 'marketShare'), regionalCagr: max(cities, 'regionalCagr'),
    purchaseIntent: max(cities, 'purchaseIntent'), targetSegmentShare: max(cities, 'targetSegmentShare'),
    monthlySpendEur: max(cities, 'monthlySpendEur'),
  };

  const ranking = cities.map((city) => {
    const components = {
      marketScale: score(city.marketShare, maxima.marketShare, SCORE_WEIGHTS.marketScale),
      regionalGrowth: score(city.regionalCagr, maxima.regionalCagr, SCORE_WEIGHTS.regionalGrowth),
      purchaseIntent: score(city.purchaseIntent, maxima.purchaseIntent, SCORE_WEIGHTS.purchaseIntent),
      targetSegmentFit: score(city.targetSegmentShare, maxima.targetSegmentShare, SCORE_WEIGHTS.targetSegmentFit),
      monthlySpend: score(city.monthlySpendEur, maxima.monthlySpendEur, SCORE_WEIGHTS.monthlySpend),
    };
    const totalScore = Number(Object.values(components).reduce((total, component) => total + component, 0).toFixed(1));
    const marketPotentialEur = Math.round(MARKET_CONTEXT.energyFocusMarketEur2026 * city.marketShare);
    return {
      cityOrRegion: city.city,
      score: totalScore,
      scoreComponents: components,
      customerEvidence: {
        germanSurvey: true, respondents: city.respondents, purchaseIntent: city.purchaseIntent,
        monthlySpendEur: city.monthlySpendEur, monthlyFrequency: city.monthlyFrequency,
        targetSegmentShare: city.targetSegmentShare, preferredChannels: city.preferredChannels,
        competitorAwareness: city.competitorAwareness,
      },
      marketEvidence: { germanMarketContext: true, marketShare: city.marketShare, regionalCagr: city.regionalCagr, marketPotentialEur, scope: MARKET_CONTEXT.scope },
      uncertainties: [
        MARKET_CONTEXT.caveat,
        `Survey evidence is directional (n=${city.respondents}) and does not measure German LUMEN sales.`,
        'No historical German LUMEN sales data exists; historical LUMEN performance from NL/DK/SE is not used in this city score.',
      ],
      assumptions: [
        'Each component is normalised to the strongest of the five launch cities, then weighted as displayed.',
        'Target-segment fit equals the survey share of Urban Wellness Professionals plus Fitness & Gym-Goers.',
        'Channel preference is shown as evidence, not scored because the launch channel is not an input to this module.',
      ],
    };
  }).sort((a, b) => b.score - a.score).map((city, index) => ({ ...city, rank: index + 1 }));

  return {
    methodology: { weights: SCORE_WEIGHTS, normalisation: 'Each raw measure is divided by the highest launch-city value, then multiplied by its explicit weight. Total possible score: 100.', rankingScope: 'Berlin, Munich, Hamburg, Cologne and Frankfurt. “Other Germany” is a residual survey/market region, not a launch city, so it is excluded.' },
    ranking,
    qualitativeEvidence: QUALITATIVE_EVIDENCE,
    dataQuality: [
      'market_context.csv: 36 rows; no blank fields or exact duplicate rows. City inputs are labelled illustrative in the source.',
      'customer_survey.csv: 420 rows; no blank fields or exact duplicate rows. Names, emails and respondent IDs are excluded.',
      'customer_quotes.csv: 12 rows; no blank fields or exact duplicate rows. Quotes are segment-level, not city-level.',
      'City sample sizes vary from 32 (Frankfurt) to 81 (Berlin); scores are directional and should be validated in-market.',
    ],
    evidenceBoundaries: { germanSurveyEvidence: 'Used in customer metrics above.', germanMarketContext: 'Used in market share, growth and market-potential proxy.', historicalLumenEvidence: 'Not used: it is NL/DK/SE only and cannot be represented as German sales.', assumptions: 'Explicit in each city result and methodology.' },
  };
}
