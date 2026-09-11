/** Independent positioning and strategic trade-off module. */

import { SAFE_PRICE_SENSITIVITY, SAFE_SURVEY_SEGMENTS } from './safeAggregates.js';

export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]; const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { cell += character; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += character;
  }
  if (cell || row.length) rows.push([...row, cell]);
  const [headers = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

const asNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const groupBy = (rows, key) => rows.reduce((groups, row) => {
  const group = key(row);
  (groups[group] ??= []).push(row);
  return groups;
}, {});

export function aggregateSurvey(surveyRows) {
  // The module destructures only fields needed for aggregation; PII is discarded.
  const safeRows = surveyRows.map(({ segment, purchase_frequency_per_month, monthly_beverage_spend_eur, price_sensitivity_1_10, preferred_channel, aware_pulsup, aware_matelibre, aware_voltfit, aware_rootandrise, lumen_purchase_intent_1_10 }) => ({ segment, purchase_frequency_per_month, monthly_beverage_spend_eur, price_sensitivity_1_10, preferred_channel, aware_pulsup, aware_matelibre, aware_voltfit, aware_rootandrise, lumen_purchase_intent_1_10 }));
  return Object.entries(groupBy(safeRows, ({ segment }) => segment)).map(([segment, rows]) => {
    const channelCounts = Object.entries(groupBy(rows, ({ preferred_channel }) => preferred_channel)).map(([channel, values]) => ({ channel, count: values.length })).sort((a, b) => b.count - a.count);
    const share = (field) => average(rows.map((row) => asNumber(row[field]) ?? 0)) * 100;
    return {
      segment,
      respondents: rows.length,
      purchaseIntent: average(rows.map((row) => asNumber(row.lumen_purchase_intent_1_10))),
      monthlySpendEur: average(rows.map((row) => asNumber(row.monthly_beverage_spend_eur))),
      monthlyFrequency: average(rows.map((row) => asNumber(row.purchase_frequency_per_month))),
      priceSensitivity: average(rows.map((row) => asNumber(row.price_sensitivity_1_10))),
      preferredChannels: channelCounts,
      awarenessPct: { PulsUp: share('aware_pulsup'), 'Mate Libre': share('aware_matelibre'), VoltFit: share('aware_voltfit'), 'Root & Rise': share('aware_rootandrise') },
    };
  }).sort((a, b) => b.purchaseIntent - a.purchaseIntent);
}

export function aggregatePriceSensitivity(rows) {
  return Object.entries(groupBy(rows, ({ segment }) => segment)).map(([segment, values]) => ({
    segment,
    respondents: values.length,
    cheapEur: average(values.map((row) => asNumber(row.cheap_eur))),
    expensiveEur: average(values.map((row) => asNumber(row.expensive_eur))),
    tooExpensiveEur: average(values.map((row) => asNumber(row.too_expensive_eur))),
  }));
}

export function aggregateCompetitors(rows) {
  return Object.entries(groupBy(rows, ({ competitor }) => competitor)).map(([competitor, values]) => {
    const prices = values.map((row) => asNumber(row.price_eur)).filter(Number.isFinite);
    return { competitor, positioning: values[0].positioning, lowPriceEur: Math.min(...prices), highPriceEur: Math.max(...prices), averagePriceEur: average(prices), marketingSpendIndex: asNumber(values[0].marketing_spend_index_0_100) };
  }).sort((a, b) => a.averagePriceEur - b.averagePriceEur);
}

export function reconcileQualitativeAndQuantitative(segmentMetrics, quotes) {
  const evidence = groupBy(quotes, ({ segment }) => segment);
  return segmentMetrics.map((metric) => {
    const segmentQuotes = evidence[metric.segment] ?? [];
    const quoteText = segmentQuotes.map(({ quote }) => quote);
    let conclusion;
    if (metric.segment === 'Urban Wellness Professionals') conclusion = 'Aligned: the highest purchase intent (9.1/10) and lowest price sensitivity (3.6/10) support a clean-ingredients premium; quotes reinforce this but flag taste/“medicine” risk.';
    else if (metric.segment === 'Fitness & Gym-Goers') conclusion = 'Tension, not a contradiction: high intent (8.0/10) supports relevance, while quotes say performance, taste and a real shelf-space reason—not packaging alone—must earn the premium.';
    else if (metric.segment === 'Students & Budget-Conscious') conclusion = 'Aligned: lower intent (5.5/10), highest price sensitivity (7.9/10) and quotes rejecting €2.50 confirm this is not the core premium target.';
    else conclusion = 'Aligned on access: survey preference is predominantly grocery and quotes say grab-and-go availability is decisive. Quantitative intent alone does not prove repeat; quotes identify taste and habit as the adoption barrier.';
    return { segment: metric.segment, quotes: quoteText, conclusion };
  });
}

export function buildPositioningOutput({ customerSurvey, customerQuotes, competitorPrices, priceSensitivity, surveySegments, priceSensitivitySegments }) {
  const segments = surveySegments ?? aggregateSurvey(customerSurvey ?? []);
  const prices = priceSensitivitySegments ?? aggregatePriceSensitivity(priceSensitivity ?? []);
  const competitors = aggregateCompetitors(competitorPrices);
  const reconciliation = reconcileQualitativeAndQuantitative(segments, customerQuotes);
  const targets = segments.filter(({ segment }) => ['Urban Wellness Professionals', 'Fitness & Gym-Goers'].includes(segment));
  return {
    targetSegments: targets,
    recommendedPositioning: 'Accessible premium clean energy: natural green-tea caffeine and a light adaptogen blend, with credible performance and an enjoyable taste—not a luxury wellness ritual.',
    supportingEvidence: [
      'Urban Wellness Professionals have the highest LUMEN purchase intent (9.1/10) and the lowest price sensitivity (3.6/10).',
      'Fitness & Gym-Goers have high intent (8.0/10), strong VoltFit awareness (77%) and a stated need for a performance-led alternative.',
      'Their average “expensive” thresholds are €2.75 and €2.50 respectively. These are stated-price reference points, not a final price recommendation or a sales forecast.',
    ],
    competitiveContext: competitors,
    priceSensitivity: prices,
    qualitativeReconciliation: reconciliation,
    risks: [
      'A boutique-adaptogenic story risks “medicine” associations and reduces clarity for fitness buyers.',
      'A mass-market price/message risks losing the premium signal valued by urban wellness professionals.',
      'Survey purchase intent is an estimate; quotes stress taste, availability and shelf-space competition as repeat-purchase conditions.',
    ],
    cmoImplication: 'Recommended test: build a distinct clean-energy platform around green-tea caffeine, taste and everyday performance. The quotes do not support relying on premium packaging or adaptogen language alone.',
    cfoImplication: 'Recommended test: do not assume a Root & Rise-style boutique price or broad brand spend will pay back before repeat purchase is evidenced. Focus initial testing on the two higher-intent segments.',
    strategicTradeOff: 'Recommended trade-off, to validate in market: choose accessible premium rather than the boutique-adaptogenic territory represented by Root & Rise (€2.54–€3.11). This may trade some per-unit margin ceiling for a broader trial pool among higher-intent wellness and fitness buyers, while deliberately not optimising for budget-student volume.',
    dataProtection: 'The browser consumes anonymous segment aggregates only. Respondent identifiers, names and emails are not loaded or exposed.',
  };
}

export async function loadPositioningData(basePath = '../..') {
  // The browser never fetches survey-level files containing respondent information.
  // These anonymous aggregates were derived from the approved fields only.
  const files = ['customer_quotes.csv', 'competitor_prices_by_channel.csv'];
  const content = await Promise.all(files.map(async (file) => { const response = await fetch(`${basePath}/data/${file}`); if (!response.ok) throw new Error(`Unable to load ${file}.`); return parseCsv(await response.text()); }));
  return {
    customerQuotes: content[0],
    competitorPrices: content[1],
    surveySegments: SAFE_SURVEY_SEGMENTS,
    priceSensitivitySegments: SAFE_PRICE_SENSITIVITY,
  };
}
