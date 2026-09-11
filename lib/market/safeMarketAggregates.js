/**
 * Anonymous city-level aggregates derived from German survey and market-context
 * CSVs. Raw survey records and all respondent identifiers are intentionally
 * excluded from the browser bundle.
 */

export const CITY_EVIDENCE = [
  { city: 'Berlin', marketShare: 0.18, regionalCagr: 0.09, respondents: 81, purchaseIntent: 7.4, monthlySpendEur: 19.98, monthlyFrequency: 6.16, targetSegmentShare: 0.506, preferredChannels: [{ channel: 'Retail/Grocery', count: 39 }, { channel: 'DTC Online', count: 29 }, { channel: 'Gym & Office', count: 13 }], competitorAwareness: 0.481 },
  { city: 'Munich', marketShare: 0.15, regionalCagr: 0.09, respondents: 57, purchaseIntent: 7.3, monthlySpendEur: 19.89, monthlyFrequency: 6.38, targetSegmentShare: 0.421, preferredChannels: [{ channel: 'Retail/Grocery', count: 25 }, { channel: 'DTC Online', count: 18 }, { channel: 'Gym & Office', count: 14 }], competitorAwareness: 0.482 },
  { city: 'Hamburg', marketShare: 0.1, regionalCagr: 0.07, respondents: 48, purchaseIntent: 7.52, monthlySpendEur: 20.27, monthlyFrequency: 6.32, targetSegmentShare: 0.5, preferredChannels: [{ channel: 'Retail/Grocery', count: 26 }, { channel: 'Gym & Office', count: 11 }, { channel: 'DTC Online', count: 11 }], competitorAwareness: 0.474 },
  { city: 'Cologne', marketShare: 0.09, regionalCagr: 0.07, respondents: 45, purchaseIntent: 7.04, monthlySpendEur: 18.1, monthlyFrequency: 6.03, targetSegmentShare: 0.489, preferredChannels: [{ channel: 'Retail/Grocery', count: 20 }, { channel: 'DTC Online', count: 13 }, { channel: 'Gym & Office', count: 12 }], competitorAwareness: 0.444 },
  { city: 'Frankfurt', marketShare: 0.08, regionalCagr: 0.07, respondents: 32, purchaseIntent: 7.18, monthlySpendEur: 20.93, monthlyFrequency: 5.95, targetSegmentShare: 0.469, preferredChannels: [{ channel: 'Retail/Grocery', count: 17 }, { channel: 'Gym & Office', count: 8 }, { channel: 'DTC Online', count: 7 }], competitorAwareness: 0.5 },
];

export const MARKET_CONTEXT = {
  energyFocusMarketEur2026: 2548000000,
  scope: 'Germany, 2026 Energy / focus subcategory',
  caveat: 'Regional shares and growth rates are illustrative planning inputs in market_context.csv, not observed city sales.',
};

export const QUALITATIVE_EVIDENCE = [
  { segment: 'Urban Wellness Professionals', implication: 'Clean ingredients can justify a premium, but taste can undermine repeat purchase.', limitation: 'Quotes are segment-level and have no city identifier; they cannot validate one city against another.' },
  { segment: 'Fitness & Gym-Goers', implication: 'Performance and taste need to earn shelf space; packaging alone is not a sufficient reason to pay more.', limitation: 'Quotes are segment-level and have no city identifier; they cannot validate one city against another.' },
  { segment: 'On-the-go Commuters', implication: 'Availability is critical to trial, while taste and habit condition repeat purchase.', limitation: 'Quotes are segment-level and have no city identifier; they cannot validate one city against another.' },
  { segment: 'Students & Budget-Conscious', implication: 'Promotion and price are material barriers to a premium offer.', limitation: 'Quotes are segment-level and have no city identifier; they cannot validate one city against another.' },
];
