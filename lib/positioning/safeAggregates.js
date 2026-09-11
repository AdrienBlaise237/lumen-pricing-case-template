/**
 * Anonymous, segment-level extracts derived from customer_survey.csv and
 * price_sensitivity_survey.csv. No respondent IDs, names, emails or raw rows
 * are shipped to the browser.
 */

export const SAFE_SURVEY_SEGMENTS = [
  {
    segment: 'Urban Wellness Professionals', respondents: 112, purchaseIntent: 9.12,
    monthlySpendEur: 21.73, monthlyFrequency: 7.56, priceSensitivity: 3.63,
    preferredChannels: [{ channel: 'DTC', count: 60 }, { channel: 'Retail', count: 36 }, { channel: 'Gym', count: 16 }],
    awarenessPct: { PulsUp: 35, 'Mate Libre': 46, VoltFit: 49, 'Root & Rise': 65 },
  },
  {
    segment: 'Fitness & Gym-Goers', respondents: 83, purchaseIntent: 7.97,
    monthlySpendEur: 20.11, monthlyFrequency: 6.23, priceSensitivity: 5.44,
    preferredChannels: [{ channel: 'Gym', count: 37 }, { channel: 'Retail', count: 32 }, { channel: 'DTC', count: 14 }],
    awarenessPct: { PulsUp: 53, 'Mate Libre': 35, VoltFit: 77, 'Root & Rise': 33 },
  },
  {
    segment: 'On-the-go Commuters', respondents: 90, purchaseIntent: 6.71,
    monthlySpendEur: 19.97, monthlyFrequency: 5.87, priceSensitivity: 5.98,
    preferredChannels: [{ channel: 'Retail', count: 54 }, { channel: 'Gym', count: 21 }, { channel: 'DTC', count: 15 }],
    awarenessPct: { PulsUp: 77, 'Mate Libre': 42, VoltFit: 26, 'Root & Rise': 17 },
  },
  {
    segment: 'Students & Budget-Conscious', respondents: 135, purchaseIntent: 5.5,
    monthlySpendEur: 17.24, monthlyFrequency: 5.1, priceSensitivity: 7.93,
    preferredChannels: [{ channel: 'Retail', count: 73 }, { channel: 'Gym', count: 32 }, { channel: 'DTC', count: 30 }],
    awarenessPct: { PulsUp: 85, 'Mate Libre': 58, VoltFit: 37, 'Root & Rise': 5 },
  },
];

export const SAFE_PRICE_SENSITIVITY = [
  { segment: 'Urban Wellness Professionals', respondents: 74, cheapEur: 1.81, expensiveEur: 2.75, tooExpensiveEur: 3.48 },
  { segment: 'Fitness & Gym-Goers', respondents: 63, cheapEur: 1.59, expensiveEur: 2.5, tooExpensiveEur: 3.11 },
  { segment: 'On-the-go Commuters', respondents: 64, cheapEur: 1.39, expensiveEur: 2.08, tooExpensiveEur: 2.7 },
  { segment: 'Students & Budget-Conscious', respondents: 99, cheapEur: 1.09, expensiveEur: 1.71, tooExpensiveEur: 2.2 },
];
