import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimingAnalysis, parseCsv } from './timingFramework.js';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(`../../data/${name}`, import.meta.url), 'utf8');

test('parses the supplied timing exhibits and returns a ranked launch window', () => {
  const result = buildTimingAnalysis(
    parseCsv(read('seasonality_and_weather.csv')),
    parseCsv(read('competitor_price_history.csv')),
  );
  assert.equal(result.months.length, 12);
  assert.equal(result.preferred.label, 'Aug');
  assert.equal(result.alternative.label, 'Jun');
  assert.equal(result.preferred.demandIndex, 128);
  assert.equal(result.preferred.temperatureC, 19);
  assert.ok(result.observations.promotionMonths.some((month) => month.startsWith('Jun')));
  assert.equal(result.months.find((month) => month.label === 'Jun').demandCompetitionPenalty, 3);
  assert.deepEqual(result.observations.competitorPriceRange, [0.87, 2.97]);
});

test('retains missing values as neutral inputs and reports them', () => {
  const result = buildTimingAnalysis(
    [{ month: '1', seasonality_index_100_avg: '', avg_temp_germany_celsius: '2' }],
    [{ competitor: 'A', month: '2026-01-01', list_price_eur: '', promo_active: 'False', promo_discount_pct: '0', shelf_price_eur: '' }],
  );
  assert.equal(result.months[0].demandScore, 50);
  assert.equal(result.months[0].temperatureScore, 0);
  assert.equal(result.dataQuality.missingSeasonalityValues, 1);
  assert.equal(result.dataQuality.missingCompetitorValues, 2);
});
