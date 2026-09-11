const $ = (selector) => document.querySelector(selector);
const euro = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const state = { price: 2.19, weights: { 'DTC Online': 35, 'Retail/Grocery': 25, 'Gym & Office': 40 }, tests: [], competitors: [] };
state.scenario = 'balanced';
const scenarios = {
  conservative: { price: 1.79, weights: { 'DTC Online': 50, 'Retail/Grocery': 0, 'Gym & Office': 50 }, hero: '€1.79 · Gym & Office + DTC · May', name: 'Conservative scenario', headline: 'Maximise trial.<br />Protect the learning budget.', copy: 'Start in <strong>Gym & Office</strong> and <strong>DTC Online</strong> in Berlin. Keep retail out of phase one while LUMEN proves repeat purchase and acquisition efficiency.', tradeoff: '<strong>Deliberate trade-off:</strong> accept thinner contribution per can in exchange for the strongest tested acceptance and a smaller, more controlled launch footprint.', cityHeading: 'Prove the playbook in Berlin first.', cityCopy: 'Berlin has the largest illustrated city-market share and the highest concentration of priority segments. Add other cities only after the initial launch signals are validated.', cityShare: '18%', cityGrowth: '9%', timingHeading: 'Build in April.<br /><em>Launch in May.</em>', timingCopy: 'May begins above-baseline demand and allows a learning runway before the June–August peak.', timingLabel: 'May demand index', timingIndex: '118' },
  balanced: { price: 2.19, weights: { 'DTC Online': 35, 'Retail/Grocery': 25, 'Gym & Office': 40 }, hero: '€2.19 · Gym & Office + DTC · May', name: 'Balanced scenario', headline: 'Premium enough to signal quality.<br />Accessible enough to earn trial.', copy: 'Start in <strong>Gym & Office</strong> and <strong>DTC Online</strong>, then use repeat and CAC evidence before expanding to grocery. Lead with clean energy for active urban routines—not a luxury adaptogen ritual.', tradeoff: '<strong>Deliberate trade-off:</strong> give up some early grocery scale and the €2.59 margin ceiling in exchange for stronger acceptance, faster learning, and credible premium positioning.', cityHeading: 'Prove the playbook in Berlin + Munich.', cityCopy: 'These cities combine the highest illustrative market concentration with the fastest regional growth (9%). Keep Hamburg, Cologne and Frankfurt as the next expansion wave once channel economics hold.', cityShare: '33%', cityGrowth: '9%', timingHeading: 'Build in April.<br /><em>Launch in May.</em>', timingCopy: 'Demand crosses above its annual baseline in May and climbs through July.', timingLabel: 'May demand index', timingIndex: '118' },
  growth: { price: 2.59, weights: { 'DTC Online': 20, 'Retail/Grocery': 55, 'Gym & Office': 25 }, hero: '€2.59 · Retail-led mix · Berlin + Munich + Hamburg · August', name: 'Growth scenario', headline: 'Push premium signal.<br />Trade trial for broader reach.', copy: 'Use a <strong>retail-led mix</strong> with DTC and Gym & Office support across Berlin, Munich and Hamburg. This expands distribution faster but requires strong in-store execution.', tradeoff: '<strong>Deliberate trade-off:</strong> accept the lower tested willingness to try at €2.59 in exchange for a stronger premium signal, wider retail reach and a larger initial market footprint.', cityHeading: 'Scale across Berlin + Munich + Hamburg.', cityCopy: 'Together these cities represent 43% of the illustrated market-share proxy. Hamburg adds high purchase intent, while its growth input is lower than Berlin and Munich.', cityShare: '43%', cityGrowth: '7–9%', timingHeading: 'Launch in August.<br /><em>Capture late-season demand.</em>', timingCopy: 'August retains a high 128 demand index and had no observed competitor promotion, but offers less learning runway than May.', timingLabel: 'August demand index', timingIndex: '128' },
};

function parseCSV(text) {
  const rows = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i], next = text[i + 1];
    if (c === '"' && quoted && next === '"') { value += c; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && next === '\n') i++; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers, ...body] = rows;
  return body.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

function normalisedWeights() {
  const total = Object.values(state.weights).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(state.weights).map(([k, v]) => [k, v / total]));
}

function renderScenarioSummary() {
  const scenario = scenarios[state.scenario] || scenarios.balanced;
  $('#hero-recommendation').textContent = scenario.hero;
  $('#scenario-choice').textContent = scenario.name;
  $('#scenario-price').textContent = `€${scenario.price.toFixed(2)}`;
  $('#scenario-headline').innerHTML = scenario.headline;
  $('#scenario-copy').innerHTML = scenario.copy;
  $('#scenario-tradeoff').innerHTML = scenario.tradeoff;
  $('#city-heading').textContent = scenario.cityHeading;
  $('#city-copy').textContent = scenario.cityCopy;
  $('#city-share').textContent = scenario.cityShare;
  $('#city-growth').textContent = scenario.cityGrowth;
  $('#timing-heading').innerHTML = scenario.timingHeading;
  $('#timing-copy').textContent = scenario.timingCopy;
  $('#timing-label').textContent = scenario.timingLabel;
  $('#may-index').textContent = scenario.timingIndex;
  document.querySelectorAll('[data-scenario]').forEach((button) => button.classList.toggle('active', button.dataset.scenario === state.scenario));
}

function applyScenario(name) {
  const scenario = scenarios[name];
  state.scenario = name;
  state.price = scenario.price;
  state.weights = { ...scenario.weights };
  document.querySelector(`input[name="price"][value="${scenario.price}"]`).checked = true;
  Object.entries({ dtc: 'DTC Online', retail: 'Retail/Grocery', gym: 'Gym & Office' }).forEach(([id, channel]) => { $(`#${id}`).value = scenario.weights[channel]; });
  update();
}

function update() {
  const weights = normalisedWeights();
  const rows = state.tests.filter(r => Number(r.price_eur) === state.price);
  const byChannel = Object.fromEntries(rows.map(r => [r.channel, r]));
  const contribution = Object.entries(weights).reduce((sum, [channel, weight]) => sum + (Number(byChannel[channel]?.unit_contribution_eur || 0) * weight), 0);
  const net = Object.entries(weights).reduce((sum, [channel, weight]) => sum + (Number(byChannel[channel]?.net_price_to_lumen_eur || 0) * weight), 0);
  const acceptance = Number(rows[0]?.estimated_acceptance_pct_of_survey || 0);
  const margin = net ? contribution / net * 100 : 0;
  const consideredUnits = 10000 * acceptance / 100;
  $('#acceptance').textContent = `${acceptance.toFixed(1)}%`;
  $('#contribution').textContent = euro.format(contribution);
  $('#margin').textContent = `${margin.toFixed(1)}%`;
  $('#scenario-value').textContent = euro.format(contribution * consideredUnits);
  const qualities = state.price === 1.79 ? ['Trial maximiser', 'Strongest acceptance, but channel margins have little room for launch learning.', 'VOLUME LED'] : state.price === 2.59 ? ['Premium signal', 'Highest contribution, but the price test shows a sharp drop in willingness to try.', 'MARGIN LED'] : ['Accessible premium', 'Protects willingness to try without becoming a commodity.', 'BEST FIT'];
  $('#outcome-title').textContent = qualities[0]; $('#outcome-subtitle').textContent = qualities[1]; $('#score').textContent = qualities[2];
  const max = Math.max(...rows.map(r => Number(r.unit_contribution_eur)));
  const ids = { 'DTC Online': 'bar-dtc', 'Retail/Grocery': 'bar-retail', 'Gym & Office': 'bar-gym' };
  Object.entries(ids).forEach(([channel, id]) => { const value = Number(byChannel[channel]?.unit_contribution_eur || 0); $(`#${id}`).style.height = `${Math.max(5, value / max * 33)}px`; });
  document.querySelectorAll('.price-options label').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  Object.entries({dtc:'DTC Online',retail:'Retail/Grocery',gym:'Gym & Office'}).forEach(([id, channel]) => $(`#${id}-out`).textContent = `${Math.round(weights[channel] * 100)}%`);
  $('#mix-total').textContent = `${Object.values(state.weights).reduce((a,b) => a+b,0)}%`;
  renderScenarioSummary();
  if (state.competitors.length) renderCompetitors(state.competitors);
}

function renderCompetitors(rows) {
  const singles = rows.filter(r => r.format === 'Single can (330ml)');
  const grouped = {};
  singles.forEach(r => { (grouped[r.competitor] ||= []).push(Number(r.price_eur)); });
  const competitors = Object.entries(grouped).map(([name, prices]) => ({ name, price: prices.reduce((a,b)=>a+b,0)/prices.length }));
  competitors.push({ name: 'LUMEN / selected', price: state.price, lumen: true });
  $('#competitor-chart').innerHTML = competitors.map(x => `<div class="comp-row ${x.lumen ? 'lumen-row' : ''}"><span>${x.name}</span><div class="track"><div class="fill" style="width:${Math.min(100, x.price / 3.2 * 100)}%"></div></div><b>€${x.price.toFixed(2)}</b></div>`).join('');
}

function renderSeasonality(rows) {
  $('#seasonality').innerHTML = rows.map(r => { const index = Number(r.seasonality_index_100_avg); const hot = Number(r.month) >= 5 && Number(r.month) <= 8; return `<div class="month-bar ${hot ? 'hot' : ''}" style="height:${Math.max(18, index / 145 * 100)}%" title="Month ${r.month}: index ${index}"><span>${['J','F','M','A','M','J','J','A','S','O','N','D'][Number(r.month)-1]}</span></div>`; }).join('');
  const may = rows.find(r => Number(r.month) === 5); if (may) $('#may-index').textContent = may.seasonality_index_100_avg;
}

async function init() {
  try {
    const [tests, competitors, seasonality] = await Promise.all(['data/price_test_results.csv','data/competitor_prices_by_channel.csv','data/seasonality_and_weather.csv'].map(p => fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.text(); })));
    state.tests = parseCSV(tests); state.competitors = parseCSV(competitors); renderSeasonality(parseCSV(seasonality)); update();
  } catch (error) { console.error(error); $('#outcome-subtitle').textContent = 'Run this site through a local web server to load the model data.'; }
}
document.querySelectorAll('input[name="price"]').forEach(el => el.addEventListener('change', e => { state.scenario = 'balanced'; state.price = Number(e.target.value); update(); }));
[['dtc','DTC Online'],['retail','Retail/Grocery'],['gym','Gym & Office']].forEach(([id, channel]) => $(`#${id}`).addEventListener('input', e => { state.scenario = 'balanced'; state.weights[channel] = Number(e.target.value); update(); }));
document.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => applyScenario(button.dataset.scenario)));
init();
