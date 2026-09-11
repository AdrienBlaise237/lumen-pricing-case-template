import { buildGermanMarketPrioritisation, SCORE_WEIGHTS } from '../../lib/market/germanMarketPrioritisation.js';

const euro = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 });
const percent = (value) => `${Math.round(value * 100)}%`;

function scoreDrivers(components) {
  return Object.entries(components).map(([name, value]) => `<li><span>${name.replace(/([A-Z])/g, ' $1')}</span><strong>${value} pts</strong></li>`).join('');
}

export function renderGermanMarketModule(container, data = buildGermanMarketPrioritisation()) {
  const winner = data.ranking[0];
  container.innerHTML = `<section class="market-module" aria-labelledby="market-title">
    <header class="market-hero"><div><p class="market-kicker">Independent module / German evidence only</p><h2 id="market-title">Start in Berlin.<br /><em>Validate, then expand.</em></h2></div><p>Berlin ranks first in this transparent, directional model because it combines the largest illustrated city-market share with high purchase intent and the highest target-segment concentration. This is not a German sales forecast.</p></header>
    <section class="market-callout"><div><p class="market-kicker">Highest score</p><h3>#${winner.rank} ${winner.cityOrRegion} <span>${winner.score}/100</span></h3><p>${euro.format(winner.marketEvidence.marketPotentialEur)} Energy / focus market-potential proxy · ${percent(winner.customerEvidence.targetSegmentShare)} priority-segment share · ${winner.customerEvidence.respondents} German survey respondents</p></div><div><p class="market-kicker">Score formula</p><p>${Object.entries(SCORE_WEIGHTS).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')} ${value}`).join(' · ')}. Each component is normalised to the strongest city.</p></div></section>
    <section class="market-ranking"><p class="market-kicker">Transparent city ranking</p>${data.ranking.map((city) => `<article class="market-city"><header><div><span>#${city.rank}</span><h3>${city.cityOrRegion}</h3></div><b>${city.score}<small>/100</small></b></header><div class="market-city-grid"><div><p class="market-label">German survey evidence</p><p><strong>${city.customerEvidence.purchaseIntent.toFixed(1)}/10</strong> intent · <strong>${euro.format(city.customerEvidence.monthlySpendEur)}</strong> monthly spend · ${percent(city.customerEvidence.targetSegmentShare)} priority segments</p><p class="market-note">Most selected: ${city.customerEvidence.preferredChannels[0].channel}. Shown as evidence, not scored.</p></div><div><p class="market-label">German market context</p><p><strong>${percent(city.marketEvidence.marketShare)}</strong> illustrated market share · <strong>${percent(city.marketEvidence.regionalCagr)}</strong> regional CAGR · ${euro.format(city.marketEvidence.marketPotentialEur)} proxy</p></div><ul class="market-drivers">${scoreDrivers(city.scoreComponents)}</ul></div><p class="market-uncertainty">${city.uncertainties[0]} No German LUMEN sales are used.</p></article>`).join('')}</section>
    <section class="market-grid"><article><p class="market-kicker">Qualitative evidence boundary</p>${data.qualitativeEvidence.map((item) => `<div class="market-qual"><h3>${item.segment}</h3><p>${item.implication}</p><small>${item.limitation}</small></div>`).join('')}</article><article><p class="market-kicker">Data quality & limits</p><ul>${data.dataQuality.map((item) => `<li>${item}</li>`).join('')}</ul></article></section>
  </section>`;
  return data;
}
