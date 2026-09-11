import { buildGermanMarketPrioritisation } from '../../lib/market/germanMarketPrioritisation.mjs';

const eur = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function row(result) {
  const scoreDetails = result.scoreComponentDetails
    .map((component) => `<li><span>${component.label}</span><strong>${component.score}/${component.max}</strong><small>${component.value}</small></li>`)
    .join('');
  return `<article class="market-priority-card">
    <header><div><p class="market-kicker">${result.eligibleForCityLaunch ? 'City launch candidate' : 'Aggregate context only'}</p><h3>${result.cityOrRegion}</h3></div><strong class="market-score">${result.score}<small>/100</small></strong></header>
    <p class="market-drivers"><b>Main drivers:</b> ${result.mainDrivers.join(' · ')}</p>
    <dl class="market-evidence">
      <div><dt>Survey base</dt><dd>${result.customerEvidence.sampleSize}</dd></div>
      <div><dt>Intent</dt><dd>${result.customerEvidence.purchaseIntentOutOf10.toFixed(1)}/10</dd></div>
      <div><dt>Market proxy</dt><dd>${eur.format(result.marketEvidence.marketPotentialProxyEur)}</dd></div>
      <div><dt>Growth</dt><dd>${result.marketEvidence.regionalGrowthPct.toFixed(1)}%</dd></div>
    </dl>
    <details><summary>Score inputs, evidence and uncertainties</summary>
      <ul class="market-component-list">${scoreDetails}</ul>
      <p><b>Customer evidence:</b> German survey aggregate only; DTC + Gym & Office preference ${result.customerEvidence.dtcAndGymOfficePreferencePct.toFixed(1)}%, high-intent segment mix ${result.customerEvidence.highIntentSegmentPct.toFixed(1)}%.</p>
      <p><b>Market evidence:</b> ${result.marketEvidence.illustrativeRegionalSharePct.toFixed(1)}% illustrative regional share. This is not LUMEN revenue.</p>
      <p><b>Uncertainties:</b> ${result.uncertainties.join(' ')}</p>
    </details>
  </article>`;
}

export function renderGermanMarketModule(container, input) {
  const analysis = buildGermanMarketPrioritisation(input);
  const recommended = analysis.executiveRecommendationInput.recommendedInitialCities.join(' and ');
  container.innerHTML = `<section class="german-market-module" aria-labelledby="market-module-title">
    <header class="market-module-header"><p class="market-kicker">Independent module / German market evidence</p><h2 id="market-module-title">Where should LUMEN test first?</h2><p>${recommended} rank highest among named city candidates in the transparent prioritisation score. This is a decision input, not a German sales forecast.</p></header>
    <section class="market-method"><h3>Scoring method</h3><p>${analysis.methodology.interpretation}</p><ul>${analysis.methodology.components.map((component) => `<li><b>${component.weight} points — ${component.key}:</b> ${component.rule}</li>`).join('')}</ul></section>
    <div class="market-priority-grid">${analysis.results.map(row).join('')}</div>
    <section class="market-quality"><h3>Evidence boundary and data quality</h3><p><b>Historical LUMEN evidence:</b> ${analysis.evidenceBoundary.historicalLumenEvidence}</p><ul>${analysis.dataQuality.map((note) => `<li>${note}</li>`).join('')}</ul></section>
  </section>`;
  return analysis;
}
