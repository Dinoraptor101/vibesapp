/**
 * Centralized Location Service
 *
 * Provides cached location access without unexpected GPS prompts.
 * Priority: Memory cache → localStorage cache → User profile → null
 *
 * Key principle: getCachedLocation() NEVER prompts for GPS
 */

import type { User } from '@/types';

// Base coordinates interface
interface LocationCoordinates {
  lat: number;
  lon: number;
}

// Complete location with all required fields
export interface Location extends LocationCoordinates {
  city: string;
  state: string;
}

// Location result from service (may be incomplete)
export interface LocationResult extends LocationCoordinates {
  city?: string;
  state?: string;
  source: 'cache' | 'profile' | 'gps';
  timestamp: number;
}

// Cached location data
interface CachedLocation extends LocationResult {
  expiresAt: number;
}

/**
 * Internal type guard to check if location data is complete
 */
function isCompleteLocation(
  location: LocationResult | null
): location is Location & { source: LocationResult['source']; timestamp: number } {
  return (
    location !== null &&
    typeof location.lat === 'number' &&
    typeof location.lon === 'number' &&
    typeof location.city === 'string' &&
    location.city.trim() !== '' &&
    typeof location.state === 'string' &&
    location.state.trim() !== ''
  );
}

class LocationService {
  private memoryCache: CachedLocation | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'location_cache';

  /**
   * Check if user has any location coordinates available
   * Returns true if lat/lon are available, even without city/state
   */
  async hasLocation(userProfile?: User): Promise<boolean> {
    const coordinates = await this.getCoordinates(userProfile);
    return coordinates !== null;
  }

  /**
   * Check if user has complete location data available
   * Returns true only if lat, lon, city, and state are all available
   * This is the main method consumers should use to check location availability
   */
  async hasCompleteLocation(userProfile?: User): Promise<boolean> {
    const location = await this.getCachedLocation(userProfile);
    return isCompleteLocation(location);
  }

  /**
   * Get cached location without prompting for GPS
   * Priority: Memory → localStorage → User profile → null
   * NEVER triggers GPS permission request
   * Only returns location if it has complete data (lat, lon, city, state)
   */
  async getCachedLocation(userProfile?: User): Promise<LocationResult | null> {
    console.log('[LocationService] getCachedLocation called', { hasUserProfile: !!userProfile });

    // 1. Check memory cache first (fastest)
    if (this.memoryCache && this.isValidCache(this.memoryCache)) {
      console.log('[LocationService] Memory cache found', this.memoryCache);
      if (isCompleteLocation(this.memoryCache)) {
        console.log('[LocationService] Using complete memory cache', this.memoryCache);
        return this.memoryCache;
      } else {
        console.log('[LocationService] Memory cache incomplete, missing required fields:', {
          hasCity: !!this.memoryCache.city,
          hasState: !!this.memoryCache.state,
        });
      }
    }
    console.log('[LocationService] Memory cache miss, expired, or incomplete');

    // 2. Check localStorage cache
    const localCache = this.getLocalStorageCache();
    console.log('[LocationService] localStorage cache check', {
      localCache,
      isValid: localCache ? this.isValidCache(localCache) : false,
      isComplete: localCache ? isCompleteLocation(localCache) : false,
    });
    if (localCache && this.isValidCache(localCache) && isCompleteLocation(localCache)) {
      // Update memory cache with localStorage data
      this.memoryCache = localCache;
      console.log('[LocationService] Using complete localStorage cache', localCache);
      return localCache;
    }
    console.log('[LocationService] localStorage cache miss, expired, or incomplete');

    // 3. Fall back to user profile location
    console.log('[LocationService] Checking user profile', {
      hasLocation: !!(userProfile?.location?.latitude && userProfile.location.longitude),
      userLocation: userProfile?.location,
    });
    if (
      userProfile?.location?.latitude &&
      userProfile.location.longitude &&
      userProfile.location.city &&
      userProfile.location.state
    ) {
      const profileLocation: LocationResult = {
        lat: userProfile.location.latitude,
        lon: userProfile.location.longitude,
        city: userProfile.location.city,
        state: userProfile.location.state,
        source: 'profile',
        timestamp: Date.now(),
      };

      console.log('[LocationService] Using complete user profile location', profileLocation);
      // Cache the profile location for future use
      this.setCachedLocation(profileLocation);
      return profileLocation;
    } else if (userProfile?.location?.latitude && userProfile.location.longitude) {
      console.log('[LocationService] User profile has coordinates but missing city/state:', {
        hasCity: !!userProfile.location.city,
        hasState: !!userProfile.location.state,
      });
    }

    // 4. No complete location available
    console.log('[LocationService] No complete location available from any source');
    return null;
  }

  /**
   * Get best available location without prompting
   * Same as getCachedLocation but with clearer naming
   */
  async getUserLocation(userProfile?: User): Promise<LocationResult | null> {
    return this.getCachedLocation(userProfile);
  }

  /**
   * Refresh location using GPS (WILL prompt user)
   * Only use when user explicitly requests location update
   */
  async refreshLocationWithGPS(): Promise<LocationResult | null> {
    console.log('[LocationService] refreshLocationWithGPS called - WILL PROMPT USER');
    if (!navigator.geolocation) {
      console.error('[LocationService] GPS not supported on this device');
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Force fresh location
        });
      });

      const { latitude, longitude } = position.coords;

      // Try to get city and state name via reverse geocoding
      let city: string | undefined;
      let state: string | undefined;
      try {
        const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
        if (GEOCODING_URL) {
          const reverseUrl = GEOCODING_URL.replace('/search', '/reverse');
          const response = await fetch(
            `${reverseUrl}?lat=${latitude}&lon=${longitude}&format=json`
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            city =
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              address.county ||
              address.state ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            state = address.state;
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding failed:', err);
        city = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      const result: LocationResult = {
        lat: latitude,
        lon: longitude,
        city,
        state,
        source: 'gps',
        timestamp: Date.now(),
      };

      console.log('[LocationService] GPS location obtained and cached', result);
      // Cache the GPS result
      this.setCachedLocation(result);
      return result;
    } catch (error) {
      console.error('[LocationService] GPS location failed:', error);
      return null;
    }
  }

  /**
   * Update cache with new location data
   */
  setCachedLocation(location: LocationResult): void {
    const cached: CachedLocation = {
      ...location,
      expiresAt: Date.now() + this.CACHE_DURATION_MS,
    };

    console.log('[LocationService] setCachedLocation', {
      source: location.source,
      location,
      expiresAt: new Date(cached.expiresAt).toISOString(),
    });

    // Update memory cache
    this.memoryCache = cached;

    // Update localStorage cache
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cached));
      console.log('[LocationService] Location saved to localStorage');
    } catch (err) {
      console.warn('[LocationService] Failed to save location to localStorage:', err);
    }
  }

  /**
   * Get coordinates only (may be incomplete location data)
   * Use this when you just need lat/lon for API calls but don't require complete location
   */
  async getCoordinates(userProfile?: User): Promise<LocationCoordinates | null> {
    console.log('[LocationService] getCoordinates called - allows incomplete data');

    // Check memory cache first
    if (this.memoryCache && this.isValidCache(this.memoryCache)) {
      console.log('[LocationService] Using coordinates from memory cache');
      return { lat: this.memoryCache.lat, lon: this.memoryCache.lon };
    }

    // Check localStorage cache
    const localCache = this.getLocalStorageCache();
    if (localCache && this.isValidCache(localCache)) {
      console.log('[LocationService] Using coordinates from localStorage cache');
      return { lat: localCache.lat, lon: localCache.lon };
    }

    // Fall back to user profile coordinates
    if (userProfile?.location?.latitude && userProfile.location.longitude) {
      console.log('[LocationService] Using coordinates from user profile');
      return {
        lat: userProfile.location.latitude,
        lon: userProfile.location.longitude,
      };
    }

    console.log('[LocationService] No coordinates available');
    return null;
  }

  /**
   * Get formatted display text from location data
   * Returns "City, State" format when both available, coordinates otherwise
   */
  getDisplayText(location: LocationResult): string {
    // If we have complete location data, format nicely
    if (isCompleteLocation(location)) {
      return `${location.city}, ${location.state}`;
    }

    // If we only have city, use that
    if (location.city?.trim()) {
      return location.city;
    }

    // Fallback to coordinates
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
  }

  /**
   * Restore complete location data for given coordinates
   * Returns display text, city, and state if a matching cached location is found
   */
  async restoreLocationData(coordinates: LocationCoordinates): Promise<{
    displayText: string | null;
    city: string | null;
    state: string | null;
    isComplete: boolean;
  }> {
    console.log('[LocationService] restoreLocationData called for coordinates', coordinates);

    const cachedLocation = await this.getCachedLocation();

    if (
      cachedLocation &&
      cachedLocation.lat === coordinates.lat &&
      cachedLocation.lon === coordinates.lon
    ) {
      console.log(
        '[LocationService] Found matching cached location for restoration',
        cachedLocation
      );

      const displayText = this.getDisplayText(cachedLocation);
      const hasComplete = await this.hasCompleteLocation();

      return {
        displayText,
        city: cachedLocation.city || null,
        state: cachedLocation.state || null,
        isComplete: hasComplete && !!cachedLocation.city && !!cachedLocation.state,
      };
    }

    console.log('[LocationService] No matching cached location found for restoration');
    return {
      displayText: null,
      city: null,
      state: null,
      isComplete: false,
    };
  }

  /**
   * Clear all cached location data
   */
  clearCache(): void {
    console.log('[LocationService] clearCache called');
    this.memoryCache = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[LocationService] Cache cleared from localStorage');
    } catch (err) {
      console.warn('[LocationService] Failed to clear location cache:', err);
    }
  }

  /**
   * Check if cached location is still valid (not expired)
   */
  private isValidCache(cached: CachedLocation): boolean {
    return Date.now() < cached.expiresAt;
  }

  /**
   * Get location from localStorage if valid
   */
  private getLocalStorageCache(): CachedLocation | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed: CachedLocation = JSON.parse(stored);

      // Validate structure
      if (
        typeof parsed.lat === 'number' &&
        typeof parsed.lon === 'number' &&
        typeof parsed.expiresAt === 'number'
      ) {
        return parsed;
      }

      return null;
    } catch (err) {
      console.warn('Failed to parse location cache:', err);
      // Clear corrupted cache
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // Ignore localStorage errors
      }
      return null;
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
