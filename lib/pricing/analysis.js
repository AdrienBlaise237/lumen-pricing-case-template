'use strict';
const { PRICES, median } = require('./data');
const round = (value, digits = 4) => value == null ? null : Number(value.toFixed(digits));
function analysePriceTests(priceTests) {
  const channels = [...new Set(priceTests.map((row) => row.channel))];
  return PRICES.map((price) => {
    const rows = priceTests.filter((row) => row.price_eur === price);
    return { priceEur: price, acceptancePct: rows[0]?.estimated_acceptance_pct_of_survey ?? null, basis: 'Estimate from Exhibit 11 price-test respondents; acceptance is not blended with a channel mix.', channels: channels.map((channel) => {
      const row = rows.find((candidate) => candidate.channel === channel);
      return row ? { channel, netPriceToLumenEur: row.net_price_to_lumen_eur, contributionPerUnitEur: row.unit_contribution_eur, contributionMarginPct: row.contribution_margin_pct } : { channel, unavailable: true };
    }) };
  });
}
function analyseSensitivity(sensitivity) {
  return {
    respondentCount: sensitivity.length,
    thresholds: { medianTooCheapEur: median(sensitivity.map((row) => row.too_cheap_eur)), medianCheapEur: median(sensitivity.map((row) => row.cheap_eur)), medianExpensiveEur: median(sensitivity.map((row) => row.expensive_eur)), medianTooExpensiveEur: median(sensitivity.map((row) => row.too_expensive_eur)) },
    acceptableRangeByCandidate: PRICES.map((price) => ({ priceEur: price, withinAcceptableRangePct: sensitivity.length ? round(sensitivity.filter((row) => row.cheap_eur <= price && price <= row.expensive_eur).length / sensitivity.length * 100, 1) : null })),
    basis: 'Descriptive Van Westendorp-style interval: cheap ≤ candidate price ≤ expensive. This is an estimate, not observed German sales.',
  };
}
function analyseCompetition(competitors) {
  return [...new Set(competitors.map((row) => row.channel))].map((channel) => {
    const singles = competitors.filter((row) => row.channel === channel && row.format === 'Single can (330ml)');
    const peers = [...new Set(singles.map((row) => row.competitor))];
    const peerMedian = median(singles.map((row) => row.price_eur));
    return { channel, singleCanMedianByCompetitor: Object.fromEntries(peers.map((competitor) => [competitor, median(singles.filter((row) => row.competitor === competitor).map((row) => row.price_eur))])), candidates: PRICES.map((price) => ({ priceEur: price, vsPeerMedianEur: peerMedian == null ? null : round(price - peerMedian, 2), position: peerMedian == null ? 'not available' : price < peerMedian ? 'below peer median' : price > peerMedian ? 'above peer median' : 'at peer median' })) };
  });
}
function analysePromotions(history) {
  return [...new Set(history.map((row) => row.competitor))].map((competitor) => {
    const rows = history.filter((row) => row.competitor === competitor); const promoRows = rows.filter((row) => row.promo_active === 'True' || row.promo_active === true);
    return { competitor, observedMonths: rows.length, promoMonths: promoRows.length, promoRatePct: round(promoRows.length / rows.length * 100, 1), averagePromoDiscountPct: round(promoRows.length ? promoRows.reduce((sum, row) => sum + row.promo_discount_pct, 0) / promoRows.length : 0, 1), averageListPriceEur: round(rows.reduce((sum, row) => sum + row.list_price_eur, 0) / rows.length, 2), averageShelfPriceEur: round(rows.reduce((sum, row) => sum + row.shelf_price_eur, 0) / rows.length, 2) };
  });
}
function analyseEconomics(costs, channelEconomics) {
  const cogsRow = costs.find((row) => row.cost_component?.startsWith('TOTAL COGS'));
  return { cogsPerUnitEur: cogsRow?.cost_per_unit_eur ?? null, channels: [...new Set(channelEconomics.map((row) => row.channel))].map((channel) => ({ channel, referenceEconomics: channelEconomics.filter((row) => row.channel === channel).map((row) => ({ illustrativeRetailPriceEur: row.illustrative_retail_price_eur, netPriceToLumenEur: row.net_price_to_lumen_eur, contributionPerUnitEur: row.unit_contribution_eur })) })), basis: 'Exhibit 11 is the source of candidate-price economics; Exhibit 10 cost data is a reference check only.' };
}
function analysePricing(input) {
  input = input || {};
  input = { priceTests: [], sensitivity: [], competitors: [], history: [], costs: [], channelEconomics: [], ...input };
  const result = { facts: { candidatePricesEur: PRICES, channelSpecificPriceTests: true, noGermanHistoricalSalesUsed: true }, priceTests: analysePriceTests(input.priceTests), priceSensitivity: analyseSensitivity(input.sensitivity), competitivePosition: analyseCompetition(input.competitors), promotionDynamics: analysePromotions(input.history), economics: analyseEconomics(input.costs, input.channelEconomics) };
  result.tradeOff = PRICES.map((price) => { const scenario = result.priceTests.find((item) => item.priceEur === price); return { priceEur: price, acceptancePct: scenario?.acceptancePct ?? null, channelContributions: Object.fromEntries((scenario?.channels || []).map((channel) => [channel.channel, channel.contributionPerUnitEur])), interpretation: price === 1.79 ? 'Highest tested acceptance; thinnest contribution.' : price === 2.59 ? 'Lowest tested acceptance; highest channel contributions.' : 'Intermediate acceptance and contribution trade-off.' }; });
  return result;
}
module.exports = { analysePricing, analysePriceTests, analyseSensitivity, analyseCompetition, analysePromotions, analyseEconomics };
