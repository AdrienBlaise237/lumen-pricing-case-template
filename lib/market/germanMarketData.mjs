/**
 * Privacy-safe German market inputs for the market prioritisation module.
 *
 * The survey source was aggregated offline by city using only non-identifying
 * fields. This module deliberately contains no respondent IDs, names, emails,
 * or raw respondent rows.
 */

export const MARKET_CONTEXT = {
  germanyFunctionalBeverageMarket2026Eur: 9_100_000_000,
  categoryCagrPct: 7,
  source: 'data/market_context.csv (Exhibit 1)',
  note: 'Regional shares are illustrative inputs supplied for phased city-by-city launch sizing.',
};

export const CITY_MARKET_CONTEXT = [
  { city: 'Berlin', marketSharePct: 18, regionalGrowthPct: 9, eligibleForCityLaunch: true },
  { city: 'Munich', marketSharePct: 15, regionalGrowthPct: 9, eligibleForCityLaunch: true },
  { city: 'Hamburg', marketSharePct: 10, regionalGrowthPct: 7, eligibleForCityLaunch: true },
  { city: 'Cologne', marketSharePct: 9, regionalGrowthPct: 7, eligibleForCityLaunch: true },
  { city: 'Frankfurt', marketSharePct: 8, regionalGrowthPct: 7, eligibleForCityLaunch: true },
  {
    city: 'Other Germany', marketSharePct: 40, regionalGrowthPct: 7, eligibleForCityLaunch: false,
    aggregateNote: 'Aggregate of non-named locations. It is retained for market coverage, but cannot be a city-launch recommendation.',
  },
];

export const CITY_SURVEY_AGGREGATES = [
  {
    city: 'Berlin', sampleSize: 81, purchaseIntent: 7.3951, monthlySpendEur: 19.9811,
    purchaseFrequencyPerMonth: 6.158, priceSensitivity: 5.5765,
    launchChannelPreferencePct: 51.85, competitorAwarenessPct: 48.15,
    highIntentSegmentPct: 50.62,
  },
  {
    city: 'Munich', sampleSize: 57, purchaseIntent: 7.2982, monthlySpendEur: 19.8946,
    purchaseFrequencyPerMonth: 6.3825, priceSensitivity: 5.8298,
    launchChannelPreferencePct: 56.14, competitorAwarenessPct: 48.25,
    highIntentSegmentPct: 42.11,
  },
  {
    city: 'Hamburg', sampleSize: 48, purchaseIntent: 7.5188, monthlySpendEur: 20.2704,
    purchaseFrequencyPerMonth: 6.3229, priceSensitivity: 5.7208,
    launchChannelPreferencePct: 45.83, competitorAwarenessPct: 47.40,
    highIntentSegmentPct: 50,
  },
  {
    city: 'Cologne', sampleSize: 45, purchaseIntent: 7.0356, monthlySpendEur: 18.1024,
    purchaseFrequencyPerMonth: 6.0333, priceSensitivity: 5.9711,
    launchChannelPreferencePct: 55.56, competitorAwarenessPct: 44.44,
    highIntentSegmentPct: 48.89,
  },
  {
    city: 'Frankfurt', sampleSize: 32, purchaseIntent: 7.1781, monthlySpendEur: 20.9256,
    purchaseFrequencyPerMonth: 5.9469, priceSensitivity: 6.1156,
    launchChannelPreferencePct: 46.88, competitorAwarenessPct: 50,
    highIntentSegmentPct: 46.88,
  },
  {
    city: 'Other Germany', sampleSize: 157, purchaseIntent: 7.049, monthlySpendEur: 19.2264,
    purchaseFrequencyPerMonth: 6.0682, priceSensitivity: 6.014,
    launchChannelPreferencePct: 56.69, competitorAwarenessPct: 43.95,
    highIntentSegmentPct: 43.95,
  },
];

export const SEGMENT_EVIDENCE = [
  {
    segment: 'Urban Wellness Professionals', sampleSize: 112, purchaseIntent: 9.1214,
    monthlySpendEur: 21.7289, purchaseFrequencyPerMonth: 7.558, priceSensitivity: 3.6313,
    primaryChannel: 'DTC Online', primaryChannelSharePct: 53.57,
  },
  {
    segment: 'Fitness & Gym-Goers', sampleSize: 83, purchaseIntent: 7.9675,
    monthlySpendEur: 20.1147, purchaseFrequencyPerMonth: 6.2349, priceSensitivity: 5.4446,
    primaryChannel: 'Gym & Office', primaryChannelSharePct: 44.58,
  },
  {
    segment: 'On-the-go Commuters', sampleSize: 90, purchaseIntent: 6.7111,
    monthlySpendEur: 19.9681, purchaseFrequencyPerMonth: 5.8667, priceSensitivity: 5.9822,
    primaryChannel: 'Retail/Grocery', primaryChannelSharePct: 60,
  },
  {
    segment: 'Students & Budget-Conscious', sampleSize: 135, purchaseIntent: 5.4963,
    monthlySpendEur: 17.2439, purchaseFrequencyPerMonth: 5.1007, priceSensitivity: 7.9274,
    primaryChannel: 'Retail/Grocery', primaryChannelSharePct: 54.07,
  },
];

export const QUALITATIVE_EVIDENCE = [
  {
    segment: 'Urban Wellness Professionals',
    quantitativeSignal: 'Highest survey intent (9.1/10), spend (€21.73/month) and purchase frequency (7.6/month).',
    qualitativeTension: 'One positive clean-ingredient/adaptogen signal is offset by a taste/“medicine” concern. Intent does not validate product experience.',
  },
  {
    segment: 'Fitness & Gym-Goers',
    quantitativeSignal: 'Strong survey intent (8.0/10) and Gym & Office is the most selected channel (44.6%).',
    qualitativeTension: 'A gym-shelf-space objection remains. Channel preference does not prove distribution access or a differentiated reason to list.',
  },
  {
    segment: 'Students & Budget-Conscious',
    quantitativeSignal: 'Lowest intent (5.5/10), lowest spend (€17.24/month), and highest price sensitivity (7.9/10).',
    qualitativeTension: 'Price and promotion concerns agree with the quantitative evidence; this is not a premium-launch anchor segment.',
  },
  {
    segment: 'On-the-go Commuters',
    quantitativeSignal: 'Retail/Grocery is the most selected channel (60.0%), while intent is moderate (6.7/10).',
    qualitativeTension: 'Quotes emphasise station/kiosk availability and habit. A channel preference does not establish repeat purchase.',
  },
];

export const DATA_QUALITY = [
  'Survey: 420 rows; no missing values, duplicate respondent IDs, or exact duplicate rows detected during aggregation.',
  'Survey privacy: first_name, last_name, email and respondent_id were excluded before the aggregate inputs were written.',
  'Market context: 36 rows; no missing values or exact duplicate rows detected.',
  'Regional market shares are illustrative source inputs, not observed city sales or population estimates.',
  'Other Germany combines many locations and must not be interpreted as one launch city.',
  'Quotes: 12 verbatims (three per segment), not geographically tagged and not representative prevalence estimates.',
];
