import { buildPositioningOutput } from '../../lib/positioning/positioningFramework.js';

const euro = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

function segmentCard(segment) {
  const primaryChannel = segment.preferredChannels[0];
  return `<article class="positioning-segment"><header><div><p>Target segment</p><h3>${segment.segment}</h3></div><b>${segment.purchaseIntent.toFixed(1)}<small>/10 intent</small></b></header><div class="positioning-stats"><span>Monthly spend <strong>${euro.format(segment.monthlySpendEur)}</strong></span><span>Price sensitivity <strong>${segment.priceSensitivity.toFixed(1)}/10</strong></span><span>Most selected channel <strong>${primaryChannel.channel}</strong></span></div></article>`;
}

export function renderPositioningModule(container, data) {
  const output = buildPositioningOutput(data);
  container.innerHTML = `<section class="positioning-module" aria-labelledby="positioning-title">
    <header class="positioning-header"><p class="positioning-kicker">Independent module / Exhibits 2, 4, 5 & 10</p><h2 id="positioning-title">Win where clean energy<br /><em>can credibly perform.</em></h2><p>${output.recommendedPositioning}</p></header>
    <section class="positioning-tradeoff"><div><p class="positioning-kicker">Explicit trade-off</p><h3>Accessible premium,<br />not boutique wellness.</h3></div><p>${output.strategicTradeOff}</p></section>
    <section class="positioning-grid"><div><p class="positioning-kicker">Priority audiences</p><div class="positioning-segments">${output.targetSegments.map(segmentCard).join('')}</div></div><aside class="positioning-card"><p class="positioning-kicker">Positioning implications</p><h3>For the CMO</h3><p>${output.cmoImplication}</p><h3>For the CFO</h3><p>${output.cfoImplication}</p></aside></section>
    <section class="positioning-grid"><article class="positioning-card"><p class="positioning-kicker">Competitive price context</p><table><thead><tr><th>Brand</th><th>Position</th><th>Price band</th></tr></thead><tbody>${output.competitiveContext.map((row) => `<tr><td>${row.competitor}</td><td>${row.positioning}</td><td>${euro.format(row.lowPriceEur)}–${euro.format(row.highPriceEur)}</td></tr>`).join('')}</tbody></table><p class="positioning-note">LUMEN should occupy the space above Mate Libre but below Root & Rise: a performance-relevant, clean-label premium—not a luxury ritual.</p></article><article class="positioning-card"><p class="positioning-kicker">Qual + quant reconciliation</p>${output.qualitativeReconciliation.map((item) => `<details><summary>${item.segment}</summary><p>${item.conclusion}</p><ul>${item.quotes.map((quote) => `<li>“${quote}”</li>`).join('')}</ul></details>`).join('')}</article></section>
    <section class="positioning-risks"><p class="positioning-kicker">Risks to manage</p><ul>${output.risks.map((risk) => `<li>${risk}</li>`).join('')}</ul><p>${output.dataProtection}</p></section>
  </section>`;
  return output;
}
