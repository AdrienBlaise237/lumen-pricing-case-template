import { buildChannelResults, inspectChannelData, recommendLaunchMix } from '../../lib/channels/channelEconomics.js';

const money = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-DE', { maximumFractionDigits: 0 });

function metric(label, value, detail = '') {
  return `<div class="channel-metric"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</div>`;
}

function formatMoney(value) { return value === null || value === undefined ? 'Not available' : money.format(value); }
function formatRatio(value) { return value === null || value === undefined ? 'Not available' : `${value.toFixed(2)}×`; }

function channelCard(result) {
  const { economics, acquisition, profitability, historical } = result;
  return `<article class="channel-card">
    <header><div><p class="channel-eyebrow">Distribution channel</p><h3>${result.channel}</h3></div><span class="channel-price">€${economics.consumerPriceEur.toFixed(2)}</span></header>
    <div class="channel-metric-grid">
      ${metric('Net retained / can', formatMoney(economics.netRevenueEur), `Contribution ${formatMoney(economics.contributionEur)}`)}
      ${metric('Contribution margin', `${economics.contributionMarginPct.toFixed(1)}%`, economics.source)}
      ${metric('Acquisition CAC', formatMoney(acquisition.cacEur), acquisition.proxyTactics.length ? acquisition.proxyTactics.join(' + ') : acquisition.note)}
      ${metric('Estimated LTV:CAC', formatRatio(acquisition.ltvCac), acquisition.ltvEur ? `Estimated LTV ${formatMoney(acquisition.ltvEur)}` : 'No channel-specific LTV proxy')}
      ${metric('CAC recovery', profitability.cacRecoveryUnits ? `${number.format(Math.ceil(profitability.cacRecoveryUnits))} cans` : 'Not available', profitability.paybackNote)}
      ${metric('Comparable-market volume', historical.averageWeeklyUnits ? `${number.format(Math.round(historical.averageWeeklyUnits))} / week` : 'Not available', 'NL/DK/SE evidence only')}
    </div>
    <details><summary>Evidence, deductions & assumptions</summary>
      <div class="channel-detail"><p><b>Deductions:</b> retailer ${economics.retailerMarginPct === null ? 'not separately supplied' : `${(economics.retailerMarginPct * 100).toFixed(1)}%`}; distributor ${economics.distributorCutPct === null ? 'not separately supplied' : `${(economics.distributorCutPct * 100).toFixed(1)}%`}; payment ${economics.paymentProcessingPct === null ? 'not separately supplied' : `${(economics.paymentProcessingPct * 100).toFixed(1)}%`}; fulfilment ${formatMoney(economics.fulfillmentCostEur)}.</p>
      <p><b>Strengths:</b> ${result.strengths.join(' ') || 'No material strength identified from the supplied data.'}</p>
      <p><b>Watch-outs:</b> ${result.weaknesses.join(' ') || 'No material weakness identified from the supplied data.'}</p>
      <p><b>Assumptions:</b> ${result.keyAssumptions.join(' ')}</p>
    </div></details>
  </article>`;
}

export function renderChannelEconomicsModule(container, data, selectedPrice = 2.19) {
  const results = buildChannelResults({ ...data, selectedPrice });
  const quality = inspectChannelData(data);
  const recommendation = recommendLaunchMix(results);
  container.innerHTML = `<section class="channel-module" aria-labelledby="channel-module-title">
    <header class="channel-header"><div><p class="channel-eyebrow">Independent module / Exhibits 6, 7, 8, 9 & 11</p><h2 id="channel-module-title">Which channels earn the right to launch?</h2><p>Distribution economics, acquisition efficiency and comparable-market evidence are kept distinct so that estimates do not masquerade as German history.</p></div>
      <label class="channel-select-label">Tested price <select class="channel-select" aria-label="Tested price"><option value="1.79">€1.79</option><option value="2.19" selected>€2.19</option><option value="2.59">€2.59</option></select></label></header>
    <div class="channel-recommendation"><p class="channel-eyebrow">Recommended launch mix</p><h3>${recommendation.recommendedChannels.join(' + ')}</h3><p>${recommendation.rationale}</p><span>Hold grocery for phase two</span></div>
    <div class="channel-cards">${results.map(channelCard).join('')}</div>
    <section class="channel-quality"><p class="channel-eyebrow">Data-quality checks</p><ul>${quality.issues.map((issue) => `<li>${issue}</li>`).join('') || '<li>No material data-quality issues found.</li>'}</ul><p>Rows reviewed: ${quality.rows.channelEconomics} channel-economics, ${quality.rows.marketingFunnel} funnel, ${quality.rows.historicalSales} historical-sales.</p></section>
  </section>`;
  const select = container.querySelector('.channel-select');
  select.value = selectedPrice;
  select.addEventListener('change', () => renderChannelEconomicsModule(container, data, Number(select.value)));
  return { results, recommendation, dataQuality: quality };
}
