/**
 * Proximity Settings Constants
 *
 * Shared type-safe constants for nearby posts radius configuration.
 * Used by both the settings UI and the post filters.
 */

/** Valid proximity radius values in kilometers */
export type ProximityRadiusKm = 50 | 100 | 150;

/** Proximity option for the settings dropdown */
export interface ProximityOption {
  value: ProximityRadiusKm;
  label: string;
}

/** Available proximity options */
export const PROXIMITY_OPTIONS: readonly ProximityOption[] = [
  { value: 50, label: '50 kilometers' },
  { value: 100, label: '100 kilometers' },
  { value: 150, label: '150 kilometers' },
] as const;

/** Valid proximity values for validation */
export const VALID_PROXIMITY_VALUES: readonly ProximityRadiusKm[] = [50, 100, 150] as const;

/** Default proximity radius in kilometers */
export const DEFAULT_PROXIMITY_KM: ProximityRadiusKm = 50;

/** localStorage key for proximity setting */
export const PROXIMITY_STORAGE_KEY = 'proximityRange';

/**
 * Type guard to check if a value is a valid proximity radius
 */
export function isValidProximityKm(value: number): value is ProximityRadiusKm {
  return VALID_PROXIMITY_VALUES.includes(value as ProximityRadiusKm);
}

/**
 * Get the stored proximity radius from localStorage, validated
 * @returns The stored value if valid, otherwise the default
 */
export function getStoredProximityKm(): ProximityRadiusKm {
  const stored = localStorage.getItem(PROXIMITY_STORAGE_KEY);
  if (stored) {
    const value = Number(stored);
    if (isValidProximityKm(value)) {
      return value;
    }
  }
  return DEFAULT_PROXIMITY_KM;
}

/**
 * Convert proximity from kilometers to meters
 */
export function proximityKmToMeters(km: ProximityRadiusKm): number {
  return km * 1000;
}

/**
 * Get the proximity radius in meters from localStorage
 */
export function getProximityRadiusMeters(): number {
  return proximityKmToMeters(getStoredProximityKm());
}
