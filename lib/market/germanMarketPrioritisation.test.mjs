import assert from 'node:assert/strict';
import { buildGermanMarketPrioritisation, scoringMethodology } from './germanMarketPrioritisation.mjs';

const result = buildGermanMarketPrioritisation();
assert.equal(scoringMethodology().totalScore, 100);
assert.equal(result.results.length, 6);
assert.deepEqual(result.executiveRecommendationInput.recommendedInitialCities, ['Berlin', 'Munich']);
assert.equal(result.results.find((row) => row.cityOrRegion === 'Other Germany').eligibleForCityLaunch, false);
assert.equal(result.results.find((row) => row.cityOrRegion === 'Berlin').customerEvidence.sampleSize, 81);
assert.equal(result.results.find((row) => row.cityOrRegion === 'Berlin').marketEvidence.marketPotentialProxyEur, 1638000000);
assert.ok(result.dataQuality.some((note) => note.includes('first_name, last_name, email and respondent_id were excluded')));
function hasForbiddenKey(value, forbiddenFields) {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => forbiddenFields.has(key) || hasForbiddenKey(child, forbiddenFields));
}
assert.equal(hasForbiddenKey(result, new Set(['first_name', 'last_name', 'email', 'respondent_id'])), false);
assert.equal(result.evidenceBoundary.historicalLumenEvidence.startsWith('Not used.'), true);
console.log('German market prioritisation tests passed');
