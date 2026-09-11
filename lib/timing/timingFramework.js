const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length || !lines[0]) return [];
  const headers = lines.shift().split(',');
  return lines.filter(Boolean).map((line) => {
    const values = line.split(',');
    return headers.reduce((row, header, index) => ({ ...row, [header]: values[index] }), {});
  });
}

function average(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; }
function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
function monthNumber(value) { return Number(String(value).length > 2 ? String(value).slice(5, 7) : value); }
function finiteNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function buildTimingAnalysis(seasonalityRows, competitorRows) {
  const seasonality = seasonalityRows.map((row) => ({
    month: finiteNumber(row.month),
    label: MONTH_NAMES[Number(row.month) - 1],
    demandIndex: finiteNumber(row.seasonality_index_100_avg),
    temperatureC: finiteNumber(row.avg_temp_germany_celsius),
  }));
  const competitorByMonth = new Map();
  competitorRows.forEach((row) => {
    const month = monthNumber(row.month);
    const listPrice = finiteNumber(row.list_price_eur);
    const shelfPrice = finiteNumber(row.shelf_price_eur);
    const item = competitorByMonth.get(month) || { listPrices: [], shelfPrices: [], promotions: [], discounts: [], brands: [] };
    if (listPrice !== null) item.listPrices.push(listPrice);
    if (shelfPrice !== null) item.shelfPrices.push(shelfPrice);
    if (String(row.promo_active).toLowerCase() === 'true') item.promotions.push(row.competitor);
    const discount = finiteNumber(row.promo_discount_pct);
    if (discount !== null && discount > 0) item.discounts.push(discount);
    item.brands.push(row.competitor);
    competitorByMonth.set(month, item);
  });

  const enriched = seasonality.map((month) => {
    const competitor = competitorByMonth.get(month.month) || { listPrices: [], shelfPrices: [], promotions: [], discounts: [], brands: [] };
    const averageListPrice = average(competitor.listPrices);
    const averageShelfPrice = average(competitor.shelfPrices);
    const promoRate = competitor.brands.length ? competitor.promotions.length / competitor.brands.length : 0;
    const averageDiscount = average(competitor.discounts) || 0;
    const demandScore = month.demandIndex === null ? 50 : clamp((month.demandIndex - 78) / (138 - 78) * 100);
    const temperatureScore = month.temperatureC === null ? 50 : clamp(100 - Math.abs(month.temperatureC - 18) * 10);
    const priceStabilityScore = averageListPrice === null ? 50 : clamp(100 - (Math.abs(averageListPrice - averageShelfPrice) / averageListPrice) * 500);
    const promotionScore = clamp(100 - promoRate * 100 - averageDiscount * 1.5);
    // This interaction makes a promotion in a high-demand month more costly:
    // launch friction matters most when the category is attracting shoppers.
    const demandCompetitionPenalty = Math.round((demandScore / 100) * promoRate * 12);
    const score = Math.round(demandScore * 0.45 + temperatureScore * 0.20 + priceStabilityScore * 0.20 + promotionScore * 0.15 - demandCompetitionPenalty);
    return {
      ...month,
      averageListPrice,
      averageShelfPrice,
      promotions: competitor.promotions,
      promoRate,
      averageDiscount,
      demandScore: Math.round(demandScore),
      temperatureScore: Math.round(temperatureScore),
      priceStabilityScore: Math.round(priceStabilityScore),
      promotionScore: Math.round(promotionScore),
      competitorCount: competitor.brands.length,
      promotionCount: competitor.promotions.length,
      demandCompetitionPenalty,
      score,
    };
  });

  const ranked = [...enriched].sort((a, b) => b.score - a.score);
  return {
    months: enriched,
    ranked,
    preferred: ranked[0],
    alternative: ranked[1],
    weights: { demand: 0.45, temperature: 0.20, priceStability: 0.20, promotionAvoidance: 0.15, demandCompetitionInteraction: 'up to 12 points' },
    observations: {
      peakDemandMonths: enriched.filter((row) => row.demandIndex >= 118).map((row) => row.label),
      promotionMonths: enriched.filter((row) => row.promotions.length).map((row) => `${row.label}: ${row.promotions.join(', ')}`),
      competitorPriceRange: [Math.min(...competitorRows.map((row) => finiteNumber(row.shelf_price_eur)).filter((value) => value !== null)), Math.max(...competitorRows.map((row) => finiteNumber(row.shelf_price_eur)).filter((value) => value !== null))],
      unusual: {
        highestDemand: enriched.reduce((best, row) => row.demandIndex > best.demandIndex ? row : best, enriched[0]).label,
        largestDiscount: competitorRows.reduce((best, row) => finiteNumber(row.promo_discount_pct) > finiteNumber(best.promo_discount_pct) ? row : best, competitorRows[0]),
      },
    },
    dataQuality: {
      seasonalityRows: seasonalityRows.length,
      competitorRows: competitorRows.length,
      missingSeasonalityValues: seasonalityRows.reduce((count, row) => count + ['month', 'seasonality_index_100_avg', 'avg_temp_germany_celsius'].filter((key) => row[key] === undefined || row[key] === '').length, 0),
      missingCompetitorValues: competitorRows.reduce((count, row) => count + ['competitor', 'month', 'list_price_eur', 'promo_active', 'promo_discount_pct', 'shelf_price_eur'].filter((key) => row[key] === undefined || row[key] === '').length, 0),
    },
  };
}

export function formatTimingEvidence(result) {
  const { preferred, alternative, observations } = result;
  return {
    preferred: `${preferred.label} (${preferred.score}/100): demand index ${preferred.demandIndex}, ${preferred.temperatureC}°C, ${preferred.promotions.length ? `promotions from ${preferred.promotions.join(', ')}` : 'no recorded competitor promotions'}.`,
    alternative: `${alternative.label} (${alternative.score}/100): demand index ${alternative.demandIndex}, ${alternative.temperatureC}°C, ${alternative.promotions.length ? `promotions from ${alternative.promotions.join(', ')}` : 'no recorded competitor promotions'}.`,
    seasonality: `Observed demand rises from ${observations.peakDemandMonths.join(', ')}; the highest index is ${Math.max(...result.months.map((row) => row.demandIndex).filter((value) => value !== null))}.`,
    competition: `Observed promotions occur in ${observations.promotionMonths.join('; ') || 'no months'}. Shelf prices range from €${observations.competitorPriceRange[0].toFixed(2)} to €${observations.competitorPriceRange[1].toFixed(2)} across the 12-month export.`,
    unusual: `The highest observed demand index is ${observations.unusual.highestDemand}; the largest recorded discount is ${observations.unusual.largestDiscount.promo_discount_pct}% (${observations.unusual.largestDiscount.competitor}).`,
    assumptions: 'The score treats higher demand as beneficial, 18°C as a comfortable reference temperature, and competitor discounts/promotions as launch friction. A demand × promotion interaction subtracts up to 12 points because promotional clutter is more consequential in high-demand months. Weights are a decision aid, not a forecast of German sales.',
    uncertainty: 'Seasonality and competitor history are only 12 monthly observations; competitor activity may change, and no German LUMEN sales history exists to calibrate conversion uplift.',
  };
}

export { MONTH_NAMES };
