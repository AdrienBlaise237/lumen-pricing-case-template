'use strict';
const PRICES = [1.79, 2.19, 2.59];
function parseCsv(text) {
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value); if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = []; value = '';
    } else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers = [], ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])));
}
const number = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
const median = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null; const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
function normaliseInputs(input) {
  input = input || {};
  const toNumbers = (rows, fields) => rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, fields.includes(key) ? number(value) : value])));
  return {
    priceTests: toNumbers(input.priceTests || [], ['price_eur', 'estimated_acceptance_pct_of_survey', 'net_price_to_lumen_eur', 'unit_contribution_eur', 'contribution_margin_pct']),
    sensitivity: toNumbers(input.sensitivity || [], ['too_cheap_eur', 'cheap_eur', 'expensive_eur', 'too_expensive_eur']),
    competitors: toNumbers(input.competitors || [], ['price_eur', 'marketing_spend_index_0_100']),
    history: toNumbers(input.history || [], ['list_price_eur', 'promo_discount_pct', 'shelf_price_eur']),
    costs: toNumbers(input.costs || [], ['cost_per_unit_eur', 'pct_of_total']),
    channelEconomics: toNumbers(input.channelEconomics || [], ['illustrative_retail_price_eur', 'retailer_margin_pct', 'distributor_cut_pct', 'payment_processing_pct', 'fulfillment_cost_eur', 'net_price_to_lumen_eur', 'unit_contribution_eur']),
  };
}
module.exports = { PRICES, parseCsv, number, median, normaliseInputs };
