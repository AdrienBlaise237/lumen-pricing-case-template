/**
 * Independent Channel Economics module for LUMEN.
 *
 * This module deliberately separates distribution channels (where a can is sold)
 * from acquisition tactics (how a customer was acquired). The supplied funnel
 * export has no Gym & Office-specific CAC, so it returns null rather than
 * inventing a comparable metric.
 */

export const DISTRIBUTION_CHANNELS = ['DTC Online', 'Retail/Grocery', 'Gym & Office'];

const ACQUISITION_PROXY = {
  'DTC Online': ['Paid Social', 'Influencer / Content', 'Referral / Subscription'],
  'Retail/Grocery': ['Retail Sampling'],
  'Gym & Office': [],
};

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += character;
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (cell || row.length) rows.push([...row, cell]);
  const [headers = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}

function weightedCac(rows) {
  const spend = rows.reduce((sum, row) => sum + (number(row.spend_eur) ?? 0), 0);
  const acquisitions = rows.reduce((sum, row) => sum + (number(row.conversions_customers_acquired) ?? 0), 0);
  return acquisitions > 0 ? spend / acquisitions : null;
}

function safeRatio(numerator, denominator) {
  return Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0 ? numerator / denominator : null;
}

function uniqueRows(rows, key) {
  const seen = new Set();
  return rows.filter((row) => {
    const identifier = key(row);
    if (seen.has(identifier)) return false;
    seen.add(identifier);
    return true;
  });
}

export function inspectChannelData({ channelEconomics, marketingFunnel, historicalSales, costBreakdown, priceTests }) {
  const duplicateSales = historicalSales.length - uniqueRows(historicalSales, (row) => JSON.stringify(row)).length;
  const unusualWeeks = historicalSales.filter((row) => {
    const units = number(row.units_sold) ?? 0;
    return units > 6000;
  }).length;
  const missingFunnelMetrics = marketingFunnel.filter((row) => [row.spend_eur, row.cac_eur, row.ltv_estimate_eur].some((value) => number(value) === null)).length;
  const channelPrices = new Set(channelEconomics.map((row) => row.illustrative_retail_price_eur));
  const testedPrices = new Set(priceTests.map((row) => row.price_eur));

  return {
    rows: {
      channelEconomics: channelEconomics.length,
      marketingFunnel: marketingFunnel.length,
      historicalSales: historicalSales.length,
      costBreakdown: costBreakdown.length,
    },
    issues: [
      duplicateSales ? `${duplicateSales} exact duplicate historical-sales rows removed before aggregation.` : null,
      unusualWeeks ? `${unusualWeeks} unusually high weekly unit observations retained and flagged; they are not treated as a Germany forecast.` : null,
      missingFunnelMetrics ? `${missingFunnelMetrics} marketing-funnel rows have missing economics fields.` : null,
      [...testedPrices].some((price) => !channelPrices.has(price)) ? 'Channel economics contains illustrative prices only; price-test economics supplies the additional tested price points.' : null,
    ].filter(Boolean),
  };
}

function acquisitionMetrics(channel, marketingFunnel) {
  const proxies = ACQUISITION_PROXY[channel];
  if (!proxies.length) {
    return {
      proxyTactics: [], cacEur: null, ltvEur: null, ltvCac: null,
      conversionRatePct: null, note: 'No Gym & Office-specific acquisition tactic exists in the funnel export.',
    };
  }
  const rows = marketingFunnel.filter((row) => proxies.includes(row.channel));
  const cacEur = weightedCac(rows);
  const ltvEur = average(rows.map((row) => number(row.ltv_estimate_eur)));
  const reach = rows.reduce((sum, row) => sum + (number(row.reach) ?? 0), 0);
  const acquisitions = rows.reduce((sum, row) => sum + (number(row.conversions_customers_acquired) ?? 0), 0);

  return {
    proxyTactics: proxies,
    cacEur,
    ltvEur,
    ltvCac: safeRatio(ltvEur, cacEur),
    conversionRatePct: reach ? acquisitions / reach * 100 : null,
    note: channel === 'DTC Online'
      ? 'DTC acquisition proxy combines paid social, influencer/content and referral/subscription tactics.'
      : 'Retail Sampling is used as the retail acquisition proxy.',
  };
}

function historicalMetrics(channel, historicalSales) {
  const cleaned = uniqueRows(historicalSales, (row) => JSON.stringify(row));
  const rows = cleaned.filter((row) => row.channel === channel);
  const units = rows.reduce((sum, row) => sum + (number(row.units_sold) ?? 0), 0);
  const revenue = rows.reduce((sum, row) => sum + (number(row.revenue_eur) ?? 0), 0);
  const weekCount = new Set(rows.map((row) => row.week_start_date)).size;
  return {
    countries: [...new Set(rows.map((row) => row.country))],
    averageWeeklyUnits: weekCount ? units / weekCount : null,
    revenuePerUnitEur: safeRatio(revenue, units),
    promoWeeks: rows.filter((row) => row.promo_active === 'True').length,
    note: 'Historical evidence is from Netherlands, Denmark and Sweden only; it is not German sales history.',
  };
}

function economicsForPrice(channel, price, channelEconomics, priceTests) {
  const source = priceTests.find((row) => row.channel === channel && number(row.price_eur) === price)
    ?? channelEconomics.find((row) => row.channel === channel && number(row.illustrative_retail_price_eur) === price);
  if (!source) return null;

  const consumerPriceEur = number(source.price_eur ?? source.illustrative_retail_price_eur);
  const netRevenueEur = number(source.net_price_to_lumen_eur);
  const contributionEur = number(source.unit_contribution_eur);
  return {
    consumerPriceEur,
    netRevenueEur,
    contributionEur,
    contributionMarginPct: number(source.contribution_margin_pct) ?? safeRatio(contributionEur, netRevenueEur) * 100,
    retailerMarginPct: number(source.retailer_margin_pct) ?? null,
    distributorCutPct: number(source.distributor_cut_pct) ?? null,
    paymentProcessingPct: number(source.payment_processing_pct) ?? null,
    fulfillmentCostEur: number(source.fulfillment_cost_eur) ?? null,
    source: source.price_eur ? 'price_test_results.csv' : 'channel_economics.csv',
  };
}

function descriptors(channel, economics, acquisition) {
  const strengths = [];
  const weaknesses = [];
  if (economics.contributionEur >= 1.1) strengths.push('High per-can contribution at the €2.19 tested price.');
  else weaknesses.push('Lower per-can contribution limits room to absorb launch spend.');
  if (acquisition.cacEur !== null && acquisition.cacEur < 40) strengths.push('Below-€40 acquisition proxy CAC supports a faster learning loop.');
  if (acquisition.ltvCac !== null && acquisition.ltvCac < 3) weaknesses.push('LTV:CAC proxy is below the case’s 3:1 planning target.');
  if (channel === 'Retail/Grocery') weaknesses.push('Retailer and distributor deductions compress the amount LUMEN retains.');
  if (channel === 'Gym & Office') weaknesses.push('No channel-specific CAC/LTV proxy is available in the supplied funnel data.');
  if (channel === 'DTC Online') strengths.push('Direct customer relationship supports testing, retention and subscription learning.');
  return { strengths, weaknesses };
}

export function buildChannelResults({ channelEconomics, marketingFunnel, historicalSales, costBreakdown, priceTests, selectedPrice = 2.19 }) {
  const cogsRow = costBreakdown.find((row) => row.cost_component.includes('TOTAL COGS'));
  const cogsPerUnitEur = number(cogsRow?.cost_per_unit_eur);
  return DISTRIBUTION_CHANNELS.map((channel) => {
    const economics = economicsForPrice(channel, selectedPrice, channelEconomics, priceTests);
    const acquisition = acquisitionMetrics(channel, marketingFunnel);
    const historical = historicalMetrics(channel, historicalSales);
    const breakEvenUnits = acquisition.cacEur !== null && economics?.contributionEur
      ? acquisition.cacEur / economics.contributionEur : null;
    const labels = descriptors(channel, economics, acquisition);
    return {
      channel,
      economics: { ...economics, cogsPerUnitEur },
      acquisition,
      profitability: {
        cacRecoveryUnits: breakEvenUnits,
        paybackMonths: null,
        paybackNote: breakEvenUnits === null
          ? 'Time-to-payback cannot be estimated with the supplied data.'
          : 'CAC recovery is expressed in contribution units, not months: purchase frequency by acquired channel is not supplied.',
      },
      historical,
      strengths: labels.strengths,
      weaknesses: labels.weaknesses,
      keyAssumptions: [
        'Price-test results are German estimates; historical sales are comparable-market evidence only.',
        acquisition.note,
        'LTV is a funnel estimate. It is used for relative LTV:CAC comparison, not treated as contribution cash flow.',
      ],
    };
  });
}

export function recommendLaunchMix(results) {
  const dtc = results.find((result) => result.channel === 'DTC Online');
  const gym = results.find((result) => result.channel === 'Gym & Office');
  return {
    recommendedChannels: ['DTC Online', 'Gym & Office'],
    holdbackChannel: 'Retail/Grocery',
    rationale: `DTC offers the only direct acquisition-learning proxy while Gym & Office retains nearly as much contribution per can (€${gym.economics.contributionEur.toFixed(2)} vs. €${dtc.economics.contributionEur.toFixed(2)} for DTC at the selected price). Hold grocery until repeat and retail-sampling efficiency are validated; its €${results.find((result) => result.channel === 'Retail/Grocery').economics.contributionEur.toFixed(2)} contribution per can leaves less room for launch spend.`,
  };
}

export async function loadChannelModuleData(basePath = '../..') {
  const files = ['channel_economics.csv', 'marketing_funnel_monthly.csv', 'historical_sales_weekly.csv', 'cost_breakdown.csv', 'price_test_results.csv'];
  const contents = await Promise.all(files.map(async (file) => {
    const response = await fetch(`${basePath}/data/${file}`);
    if (!response.ok) throw new Error(`Unable to load ${file}.`);
    return parseCsv(await response.text());
  }));
  const [channelEconomics, marketingFunnel, historicalSales, costBreakdown, priceTests] = contents;
  return { channelEconomics, marketingFunnel, historicalSales, costBreakdown, priceTests };
}
