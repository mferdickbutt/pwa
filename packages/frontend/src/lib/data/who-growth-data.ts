/**
 * WHO Child Growth Standards Data
 *
 * Complete dataset for boys and girls 0-36 months.
 * Includes weight-for-age, length/height-for-age, and head circumference-for-age.
 *
 * Data source: WHO Child Growth Standards
 * Percentiles: 3rd, 15th, 50th, 85th, 97th
 */

/**
 * WHO data point for a specific age
 */
export interface WHODataPoint {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

/**
 * WHO growth data for a gender
 */
export interface WHOGrowthData {
  weight: WHODataPoint[];
  height: WHODataPoint[];
  headCircumference: WHODataPoint[];
}

// ============================================================================
// WEIGHT FOR AGE - BOYS (kg)
// ============================================================================

export const whoWeightBoys: WHODataPoint[] = [
  { ageMonths: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
  { ageMonths: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.7 },
  { ageMonths: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.0 },
  { ageMonths: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
  { ageMonths: 4, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.8, p97: 8.7 },
  { ageMonths: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3 },
  { ageMonths: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
  { ageMonths: 7, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.2, p97: 10.2 },
  { ageMonths: 8, p3: 6.9, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.7 },
  { ageMonths: 9, p3: 7.1, p15: 8.0, p50: 8.9, p85: 9.9, p97: 11.0 },
  { ageMonths: 10, p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.4 },
  { ageMonths: 11, p3: 7.6, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.7 },
  { ageMonths: 12, p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
  { ageMonths: 15, p3: 8.2, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8 },
  { ageMonths: 18, p3: 8.6, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.7 },
  { ageMonths: 21, p3: 9.0, p15: 10.1, p50: 11.4, p85: 12.8, p97: 14.4 },
  { ageMonths: 24, p3: 9.3, p15: 10.5, p50: 11.8, p85: 13.3, p97: 15.0 },
  { ageMonths: 27, p3: 9.6, p15: 10.9, p50: 12.3, p85: 13.8, p97: 15.6 },
  { ageMonths: 30, p3: 9.9, p15: 11.2, p50: 12.7, p85: 14.3, p97: 16.2 },
  { ageMonths: 33, p3: 10.2, p15: 11.5, p50: 13.1, p85: 14.8, p97: 16.8 },
  { ageMonths: 36, p3: 10.4, p15: 11.8, p50: 13.4, p85: 15.2, p97: 17.3 },
];

// ============================================================================
// WEIGHT FOR AGE - GIRLS (kg)
// ============================================================================

export const whoWeightGirls: WHODataPoint[] = [
  { ageMonths: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { ageMonths: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.4 },
  { ageMonths: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.5 },
  { ageMonths: 3, p3: 4.5, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.4 },
  { ageMonths: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.2, p97: 8.1 },
  { ageMonths: 5, p3: 5.4, p15: 6.0, p50: 6.9, p85: 7.7, p97: 8.7 },
  { ageMonths: 6, p3: 5.7, p15: 6.4, p50: 7.3, p85: 8.2, p97: 9.2 },
  { ageMonths: 7, p3: 6.0, p15: 6.7, p50: 7.6, p85: 8.6, p97: 9.6 },
  { ageMonths: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 8.9, p97: 10.0 },
  { ageMonths: 9, p3: 6.5, p15: 7.2, p50: 8.2, p85: 9.2, p97: 10.4 },
  { ageMonths: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.5, p97: 10.7 },
  { ageMonths: 11, p3: 6.9, p15: 7.7, p50: 8.7, p85: 9.8, p97: 11.0 },
  { ageMonths: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.3 },
  { ageMonths: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.9, p97: 12.2 },
  { ageMonths: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.6, p97: 13.0 },
  { ageMonths: 21, p3: 8.6, p15: 9.6, p50: 10.8, p85: 12.2, p97: 13.7 },
  { ageMonths: 24, p3: 9.0, p15: 10.1, p50: 11.3, p85: 12.8, p97: 14.4 },
  { ageMonths: 27, p3: 9.4, p15: 10.5, p50: 11.8, p85: 13.3, p97: 15.0 },
  { ageMonths: 30, p3: 9.8, p15: 10.9, p50: 12.3, p85: 13.9, p97: 15.6 },
  { ageMonths: 33, p3: 10.1, p15: 11.3, p50: 12.7, p85: 14.4, p97: 16.2 },
  { ageMonths: 36, p3: 10.4, p15: 11.7, p50: 13.1, p85: 14.9, p97: 16.7 },
];

// ============================================================================
// LENGTH/HEIGHT FOR AGE - BOYS (cm)
// ============================================================================

export const whoHeightBoys: WHODataPoint[] = [
  { ageMonths: 0, p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
  { ageMonths: 1, p3: 51.5, p15: 53.6, p50: 55.6, p85: 57.7, p97: 59.7 },
  { ageMonths: 2, p3: 55.4, p15: 57.5, p50: 59.6, p85: 61.7, p97: 63.8 },
  { ageMonths: 3, p3: 58.6, p15: 60.7, p50: 62.8, p85: 65.0, p97: 67.1 },
  { ageMonths: 4, p3: 61.3, p15: 63.4, p50: 65.6, p85: 67.8, p97: 70.0 },
  { ageMonths: 5, p3: 63.7, p15: 65.9, p50: 68.1, p85: 70.3, p97: 72.5 },
  { ageMonths: 6, p3: 65.8, p15: 68.0, p50: 70.2, p85: 72.5, p97: 74.7 },
  { ageMonths: 7, p3: 67.7, p15: 70.0, p50: 72.2, p85: 74.5, p97: 76.8 },
  { ageMonths: 8, p3: 69.4, p15: 71.7, p50: 74.0, p85: 76.3, p97: 78.6 },
  { ageMonths: 9, p3: 71.0, p15: 73.3, p50: 75.6, p85: 78.0, p97: 80.3 },
  { ageMonths: 10, p3: 72.5, p15: 74.8, p50: 77.2, p85: 79.6, p97: 81.9 },
  { ageMonths: 11, p3: 73.9, p15: 76.2, p50: 78.6, p85: 81.0, p97: 83.4 },
  { ageMonths: 12, p3: 75.2, p15: 77.6, p50: 80.0, p85: 82.5, p97: 84.9 },
  { ageMonths: 15, p3: 78.6, p15: 81.1, p50: 83.6, p85: 86.2, p97: 88.7 },
  { ageMonths: 18, p3: 81.7, p15: 84.3, p50: 86.9, p85: 89.6, p97: 92.2 },
  { ageMonths: 21, p3: 84.5, p15: 87.2, p50: 89.9, p85: 92.7, p97: 95.4 },
  { ageMonths: 24, p3: 87.1, p15: 89.9, p50: 92.7, p85: 95.5, p97: 98.3 },
  { ageMonths: 27, p3: 89.6, p15: 92.4, p50: 95.3, p85: 98.2, p97: 101.1 },
  { ageMonths: 30, p3: 91.9, p15: 94.8, p50: 97.8, p85: 100.8, p97: 103.7 },
  { ageMonths: 33, p3: 94.1, p15: 97.1, p50: 100.1, p85: 103.1, p97: 106.1 },
  { ageMonths: 36, p3: 96.2, p15: 99.2, p50: 102.3, p85: 105.4, p97: 108.5 },
];

// ============================================================================
// LENGTH/HEIGHT FOR AGE - GIRLS (cm)
// ============================================================================

export const whoHeightGirls: WHODataPoint[] = [
  { ageMonths: 0, p3: 45.4, p15: 47.2, p50: 49.1, p85: 51.0, p97: 52.9 },
  { ageMonths: 1, p3: 50.4, p15: 52.3, p50: 54.2, p85: 56.1, p97: 58.0 },
  { ageMonths: 2, p3: 54.1, p15: 56.1, p50: 58.0, p85: 60.0, p97: 62.0 },
  { ageMonths: 3, p3: 57.1, p15: 59.2, p50: 61.2, p85: 63.2, p97: 65.2 },
  { ageMonths: 4, p3: 59.7, p15: 61.8, p50: 63.9, p85: 66.0, p97: 68.0 },
  { ageMonths: 5, p3: 62.1, p15: 64.2, p50: 66.3, p85: 68.5, p97: 70.6 },
  { ageMonths: 6, p3: 64.2, p15: 66.3, p50: 68.5, p85: 70.7, p97: 72.8 },
  { ageMonths: 7, p3: 66.1, p15: 68.3, p50: 70.5, p85: 72.8, p97: 75.0 },
  { ageMonths: 8, p3: 67.9, p15: 70.1, p50: 72.4, p85: 74.7, p97: 76.9 },
  { ageMonths: 9, p3: 69.6, p15: 71.8, p50: 74.2, p85: 76.5, p97: 78.8 },
  { ageMonths: 10, p3: 71.2, p15: 73.5, p50: 75.9, p85: 78.2, p97: 80.6 },
  { ageMonths: 11, p3: 72.7, p15: 75.1, p50: 77.5, p85: 79.9, p97: 82.3 },
  { ageMonths: 12, p3: 74.2, p15: 76.6, p50: 79.0, p85: 81.5, p97: 83.9 },
  { ageMonths: 15, p3: 78.4, p15: 80.9, p50: 83.4, p85: 86.0, p97: 88.5 },
  { ageMonths: 18, p3: 82.3, p15: 84.9, p50: 87.5, p85: 90.1, p97: 92.7 },
  { ageMonths: 21, p3: 85.9, p15: 88.6, p50: 91.3, p85: 94.0, p97: 96.7 },
  { ageMonths: 24, p3: 89.3, p15: 92.1, p50: 94.9, p85: 97.7, p97: 100.5 },
  { ageMonths: 27, p3: 92.5, p15: 95.4, p50: 98.3, p85: 101.2, p97: 104.1 },
  { ageMonths: 30, p3: 95.5, p15: 98.5, p50: 101.5, p85: 104.5, p97: 107.5 },
  { ageMonths: 33, p3: 98.4, p15: 101.5, p50: 104.5, p85: 107.6, p97: 110.7 },
  { ageMonths: 36, p3: 101.2, p15: 104.3, p50: 107.5, p85: 110.7, p97: 113.8 },
];

// ============================================================================
// HEAD CIRCUMFERENCE FOR AGE - BOYS (cm)
// ============================================================================

export const whoHeadBoys: WHODataPoint[] = [
  { ageMonths: 0, p3: 32.0, p15: 33.2, p50: 34.5, p85: 35.8, p97: 36.7 },
  { ageMonths: 1, p3: 35.1, p15: 36.3, p50: 37.6, p85: 38.9, p97: 39.8 },
  { ageMonths: 2, p3: 37.1, p15: 38.3, p50: 39.6, p85: 40.9, p97: 41.8 },
  { ageMonths: 3, p3: 38.4, p15: 39.6, p50: 40.9, p85: 42.2, p97: 43.1 },
  { ageMonths: 4, p3: 39.4, p15: 40.6, p50: 41.9, p85: 43.2, p97: 44.1 },
  { ageMonths: 5, p3: 40.1, p15: 41.4, p50: 42.7, p85: 44.0, p97: 44.9 },
  { ageMonths: 6, p3: 40.7, p15: 42.0, p50: 43.3, p85: 44.6, p97: 45.5 },
  { ageMonths: 7, p3: 41.2, p15: 42.5, p50: 43.8, p85: 45.1, p97: 46.0 },
  { ageMonths: 8, p3: 41.6, p15: 42.9, p50: 44.2, p85: 45.5, p97: 46.4 },
  { ageMonths: 9, p3: 42.0, p15: 43.3, p50: 44.6, p85: 45.9, p97: 46.8 },
  { ageMonths: 10, p3: 42.3, p15: 43.6, p50: 44.9, p85: 46.2, p97: 47.1 },
  { ageMonths: 11, p3: 42.6, p15: 43.9, p50: 45.2, p85: 46.5, p97: 47.4 },
  { ageMonths: 12, p3: 42.9, p15: 44.2, p50: 45.5, p85: 46.8, p97: 47.7 },
  { ageMonths: 15, p3: 43.6, p15: 44.9, p50: 46.2, p85: 47.6, p97: 48.5 },
  { ageMonths: 18, p3: 44.2, p15: 45.5, p50: 46.9, p85: 48.3, p97: 49.2 },
  { ageMonths: 21, p3: 44.7, p15: 46.1, p50: 47.5, p85: 48.9, p97: 49.8 },
  { ageMonths: 24, p3: 45.2, p15: 46.6, p50: 48.0, p85: 49.4, p97: 50.3 },
  { ageMonths: 27, p3: 45.6, p15: 47.0, p50: 48.4, p85: 49.8, p97: 50.7 },
  { ageMonths: 30, p3: 46.0, p15: 47.4, p50: 48.8, p85: 50.2, p97: 51.1 },
  { ageMonths: 33, p3: 46.3, p15: 47.7, p50: 49.1, p85: 50.5, p97: 51.4 },
  { ageMonths: 36, p3: 46.6, p15: 48.0, p50: 49.4, p85: 50.8, p97: 51.7 },
];

// ============================================================================
// HEAD CIRCUMFERENCE FOR AGE - GIRLS (cm)
// ============================================================================

export const whoHeadGirls: WHODataPoint[] = [
  { ageMonths: 0, p3: 31.5, p15: 32.6, p50: 33.9, p85: 35.1, p97: 35.9 },
  { ageMonths: 1, p3: 34.2, p15: 35.3, p50: 36.5, p85: 37.7, p97: 38.6 },
  { ageMonths: 2, p3: 35.9, p15: 37.0, p50: 38.3, p85: 39.5, p97: 40.4 },
  { ageMonths: 3, p3: 37.0, p15: 38.1, p50: 39.4, p85: 40.6, p97: 41.5 },
  { ageMonths: 4, p3: 37.8, p15: 39.0, p50: 40.2, p85: 41.5, p97: 42.4 },
  { ageMonths: 5, p3: 38.4, p15: 39.6, p50: 40.9, p85: 42.2, p97: 43.1 },
  { ageMonths: 6, p3: 38.9, p15: 40.1, p50: 41.4, p85: 42.7, p97: 43.6 },
  { ageMonths: 7, p3: 39.3, p15: 40.5, p50: 41.8, p85: 43.1, p97: 44.0 },
  { ageMonths: 8, p3: 39.7, p15: 40.9, p50: 42.2, p85: 43.5, p97: 44.4 },
  { ageMonths: 9, p3: 40.0, p15: 41.2, p50: 42.5, p85: 43.8, p97: 44.7 },
  { ageMonths: 10, p3: 40.3, p15: 41.5, p50: 42.8, p85: 44.1, p97: 45.0 },
  { ageMonths: 11, p3: 40.5, p15: 41.8, p50: 43.1, p85: 44.4, p97: 45.3 },
  { ageMonths: 12, p3: 40.8, p15: 42.0, p50: 43.3, p85: 44.6, p97: 45.5 },
  { ageMonths: 15, p3: 41.3, p15: 42.6, p50: 43.9, p85: 45.2, p97: 46.1 },
  { ageMonths: 18, p3: 41.8, p15: 43.1, p50: 44.4, p85: 45.7, p97: 46.6 },
  { ageMonths: 21, p3: 42.2, p15: 43.5, p50: 44.8, p85: 46.1, p97: 47.0 },
  { ageMonths: 24, p3: 42.6, p15: 43.9, p50: 45.2, p85: 46.5, p97: 47.4 },
  { ageMonths: 27, p3: 42.9, p15: 44.2, p50: 45.5, p85: 46.8, p97: 47.7 },
  { ageMonths: 30, p3: 43.2, p15: 44.5, p50: 45.8, p85: 47.1, p97: 48.0 },
  { ageMonths: 33, p3: 43.5, p15: 44.8, p50: 46.1, p85: 47.4, p97: 48.3 },
  { ageMonths: 36, p3: 43.7, p15: 45.0, p50: 46.3, p85: 47.6, p97: 48.5 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get WHO growth data based on gender
 */
export function getWHOGrowthData(gender: 'male' | 'female' | 'other'): WHOGrowthData {
  const isMale = gender === 'male';
  return {
    weight: isMale ? whoWeightBoys : whoWeightGirls,
    height: isMale ? whoHeightBoys : whoHeightGirls,
    headCircumference: isMale ? whoHeadBoys : whoHeadGirls,
  };
}

/**
 * Get WHO data for a specific metric
 */
export function getWHOMetricData(
  gender: 'male' | 'female' | 'other',
  metric: 'weight' | 'height' | 'headCircumference'
): WHODataPoint[] {
  const data = getWHOGrowthData(gender);
  return data[metric];
}

/**
 * Find the closest WHO data point for a given age in months
 */
export function findClosestWHOPoint(
  ageInMonths: number,
  data: WHODataPoint[]
): WHODataPoint | null {
  if (data.length === 0) return null;

  // Clamp age to data range
  const clampedAge = Math.max(0, Math.min(ageInMonths, data[data.length - 1].ageMonths));

  // Find exact match or closest
  const exact = data.find((p) => p.ageMonths === Math.round(clampedAge));
  if (exact) return exact;

  // Find closest by age
  let closest = data[0];
  let minDiff = Math.abs(data[0].ageMonths - clampedAge);

  for (const point of data) {
    const diff = Math.abs(point.ageMonths - clampedAge);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  return closest;
}

/**
 * Calculate percentile for a given value
 * Returns the percentile range that the value falls into
 */
export function calculatePercentile(
  value: number,
  ageInMonths: number,
  data: WHODataPoint[]
): string {
  const point = findClosestWHOPoint(ageInMonths, data);

  if (!point) return 'N/A';

  if (value < point.p3) return '< 3rd';
  if (value < point.p15) return '3rd - 15th';
  if (value < point.p50) return '15th - 50th';
  if (value < point.p85) return '50th - 85th';
  if (value < point.p97) return '85th - 97th';
  return '> 97th';
}

/**
 * Get exact percentile (approximate)
 * Returns a value between 0 and 100
 */
export function calculateExactPercentile(
  value: number,
  ageInMonths: number,
  data: WHODataPoint[]
): number | null {
  const point = findClosestWHOPoint(ageInMonths, data);

  if (!point) return null;

  const percentiles = [
    { value: point.p3, percentile: 3 },
    { value: point.p15, percentile: 15 },
    { value: point.p50, percentile: 50 },
    { value: point.p85, percentile: 85 },
    { value: point.p97, percentile: 97 },
  ];

  // Find which range the value falls into
  for (let i = 0; i < percentiles.length - 1; i++) {
    const lower = percentiles[i];
    const upper = percentiles[i + 1];

    if (value >= lower.value && value <= upper.value) {
      // Linear interpolation
      const range = upper.value - lower.value;
      const position = (value - lower.value) / range;
      return lower.percentile + position * (upper.percentile - lower.percentile);
    }
  }

  // Below 3rd percentile
  if (value < point.p3) return 1.5;

  // Above 97th percentile
  return 99;
}

/**
 * Interpolate WHO data point for a specific age
 * Useful for getting smooth curves on charts
 */
export function interpolateWHOPoint(
  ageInMonths: number,
  data: WHODataPoint[]
): WHODataPoint | null {
  if (data.length === 0) return null;

  // Clamp age to data range
  const clampedAge = Math.max(0, Math.min(ageInMonths, data[data.length - 1].ageMonths));

  // Find surrounding points
  const lower = data.filter((p) => p.ageMonths <= clampedAge);
  const upper = data.filter((p) => p.ageMonths >= clampedAge);

  if (lower.length === 0) return data[0];
  if (upper.length === 0) return data[data.length - 1];

  const lowerPoint = lower[lower.length - 1];
  const upperPoint = upper[0];

  // Exact match
  if (lowerPoint.ageMonths === upperPoint.ageMonths) {
    return lowerPoint;
  }

  // Interpolate
  const t = (clampedAge - lowerPoint.ageMonths) / (upperPoint.ageMonths - lowerPoint.ageMonths);

  const interpolateValue = (lower: number, upper: number): number => {
    return lower + t * (upper - lower);
  };

  return {
    ageMonths: clampedAge,
    p3: interpolateValue(lowerPoint.p3, upperPoint.p3),
    p15: interpolateValue(lowerPoint.p15, upperPoint.p15),
    p50: interpolateValue(lowerPoint.p50, upperPoint.p50),
    p85: interpolateValue(lowerPoint.p85, upperPoint.p85),
    p97: interpolateValue(lowerPoint.p97, upperPoint.p97),
  };
}
