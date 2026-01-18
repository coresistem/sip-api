import { VO2_FORMULA } from '../constants';

/**
 * Calculates VO2 Max using the requested formula:
 * VO2max = (level × 3.46) + 12.2
 * We use a decimal level (e.g., Level 5, shuttle 5/9 becomes ~5.55) for precision.
 */
export const calculateVO2Max = (level: number, shuttle: number, totalShuttlesInLevel: number): number => {
  // Calculate decimal level
  const decimalLevel = level + (shuttle / totalShuttlesInLevel);
  
  // Formula: VO2max = (level × 3.46) + 12.2
  const val = (decimalLevel * 3.46) + 12.2;
    
  return Math.round(val * 10) / 10;
};

// Normative data structure for better categorization
// Based on Cooper Institute / ACSM general guidelines
const NORMATIVE_DATA = {
  male: [
    { ageMax: 29, superior: 55.9, excellent: 52.4, good: 46.4, fair: 42.4, poor: 36.4 },
    { ageMax: 39, superior: 52.4, excellent: 49.4, good: 44.9, fair: 40.9, poor: 34.9 },
    { ageMax: 49, superior: 48.9, excellent: 45.4, good: 41.9, fair: 37.9, poor: 32.9 },
    { ageMax: 59, superior: 44.9, excellent: 41.4, good: 38.9, fair: 34.9, poor: 29.9 },
    { ageMax: 99, superior: 40.9, excellent: 37.4, good: 34.9, fair: 30.9, poor: 25.9 },
  ],
  female: [
    { ageMax: 29, superior: 49.9, excellent: 45.4, good: 39.4, fair: 34.4, poor: 28.4 },
    { ageMax: 39, superior: 46.9, excellent: 41.4, good: 36.4, fair: 32.4, poor: 26.4 },
    { ageMax: 49, superior: 43.9, excellent: 38.4, good: 33.4, fair: 29.4, poor: 24.4 },
    { ageMax: 59, superior: 39.9, excellent: 34.4, good: 30.4, fair: 26.4, poor: 21.4 },
    { ageMax: 99, superior: 36.9, excellent: 30.4, good: 27.4, fair: 24.4, poor: 20.4 },
  ]
};

export const getFitnessCategory = (vo2: number, gender: 'male' | 'female', age: number): string => {
  const table = NORMATIVE_DATA[gender];
  // Find the correct age group
  const range = table.find(r => age <= r.ageMax) || table[table.length - 1];

  if (vo2 >= range.superior) return 'Superior';
  if (vo2 >= range.excellent) return 'Excellent';
  if (vo2 >= range.good) return 'Good';
  if (vo2 >= range.fair) return 'Fair';
  if (vo2 >= range.poor) return 'Poor';
  return 'Very Poor';
};
