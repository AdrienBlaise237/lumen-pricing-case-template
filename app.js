const $ = (selector) => document.querySelector(selector);
const euro = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const state = { price: 2.19, weights: { 'DTC Online': 35, 'Retail/Grocery': 25, 'Gym & Office': 40 }, tests: [], competitors: [] };

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
document.querySelectorAll('input[name="price"]').forEach(el => el.addEventListener('change', e => { state.price = Number(e.target.value); update(); }));
[['dtc','DTC Online'],['retail','Retail/Grocery'],['gym','Gym & Office']].forEach(([id, channel]) => $(`#${id}`).addEventListener('input', e => { state.weights[channel] = Number(e.target.value); update(); }));
init();
