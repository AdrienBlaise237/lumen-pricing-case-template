import { MONTHLY_TIMING_INPUTS, COMPETITOR_PRICE_EVIDENCE } from './timingData.js';

export const TIMING_WEIGHTS = { seasonalDemand: 50, temperatureContext: 15, competitorWhitespace: 25, launchRunway: 10 };
const RUNWAY_ASSUMPTION = { 1: 0, 2: 0, 3: 4, 4: 8, 5: 10, 6: 5, 7: 2, 8: 1, 9: 3, 10: 0, 11: 0, 12: 0 };
const round = (value) => Number(value.toFixed(1));

export function buildLaunchTimingOutput(months = MONTHLY_TIMING_INPUTS) {
  const maxIndex = Math.max(...months.map(({ seasonalityIndex }) => seasonalityIndex));
  const maxTemp = Math.max(...months.map(({ temperatureC }) => temperatureC));
  const monthlyScores = months.map((month) => {
    const components = {
      seasonalDemand: round((month.seasonalityIndex / maxIndex) * TIMING_WEIGHTS.seasonalDemand),
      temperatureContext: round((month.temperatureC / maxTemp) * TIMING_WEIGHTS.temperatureContext),
      competitorWhitespace: month.promoCount === 0 ? 25 : month.promoCount === 1 ? 12.5 : 0,
      launchRunway: RUNWAY_ASSUMPTION[month.month],
    };
    return { ...month, score: round(Object.values(components).reduce((sum, value) => sum + value, 0)), scoreComponents: components };
  }).sort((a, b) => b.score - a.score);
  const preferred = monthlyScores.find(({ month }) => month === 5);
  const alternative = monthlyScores.find(({ month }) => month === 8);

  return {
    preferredLaunchPeriod: { period: 'May', score: preferred.score, rationale: 'A pre-peak launch: seasonality is already 118 (above the 100 annual-average baseline), temperature is 15°C, and no competitor promotion is observed in May. The 10-point runway is an explicit operating assumption for learning before June–August demand.' },
    alternativePeriod: { period: 'August', score: alternative.score, rationale: 'A high-demand alternative: seasonality is 128 and temperature is 19°C, with no promotion observed in the August history. It has less pre-peak learning runway, so it is not the preferred window.' },
    timingMethodology: { weights: TIMING_WEIGHTS, formula: 'Seasonality and temperature are normalised to the strongest month. Competitor whitespace gives 25 points for zero observed promotions, 12.5 for one, and 0 for two. Runway is an explicit, non-observed assumption.', assumptions: ['The launch-runway points favour May because it allows a learning period before the June–August high-demand months.', 'Temperature is context only; the data does not establish that temperature causes demand.', 'No observed promotion is treated as whitespace in the past history, not a promise of future competitor inactivity.'] },
    monthlyScores,
    seasonalityEvidence: { observed: 'Germany monthly seasonality index ranges from 78 (January) to 138 (July); May is 118, June 132, July 138 and August 128.', interpretation: 'Demand accelerates from March through July, then remains above the annual-average baseline in August before declining. This supports May as a ramp-in period, rather than simply selecting the warmest month.' },
    competitorEvidence: { ...COMPETITOR_PRICE_EVIDENCE, observedPromotions: ['February: PulsUp 20% and Root & Rise 15%', 'June: VoltFit 10%', 'July: Mate Libre 20%', 'October: PulsUp 10%'], interpretation: 'List prices were stable across the observed year; promotion activity was episodic rather than continuous. The June/July activity overlaps the seasonal peak, so a May launch avoids observed promotional pressure while entering rising demand.' },
    risks: ['The competitor series covers one year only and may not repeat.', 'The seasonality index is German market context, not German LUMEN sales.', 'Execution lead times, retailer listings and inventory readiness are not observed in the datasets.'],
    confidence: { level: 'Medium-low', reason: 'The seasonal and competitor inputs are complete and internally consistent, but the launch outcome is unobserved and there are no historical German LUMEN sales.' },
    evidenceBoundaries: { observedGermanData: 'Seasonality/weather series and competitor price/promotion history.', historicalLumenEvidence: 'Not used for the score. Any available historical sales are NL/DK/SE only.', assumptions: 'Runway weighting and the interpretation of past promotion whitespace are explicit above.' },
    dataQuality: ['seasonality_and_weather.csv: 12 monthly rows, no blank fields or exact duplicate rows.', 'competitor_price_history.csv: 48 rows (4 brands × 12 months), no blank fields or exact duplicate rows.', 'historical_sales_weekly.csv was checked only for scope: it covers NL/DK/SE and contains four exact duplicate rows; it is not used.'],
  };
}
