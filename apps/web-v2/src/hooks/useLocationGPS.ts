/**
 * useLocationGPS Hook
 * Shared GPS location fetching with reverse geocoding
 * Integrates with location service cache for consistent behavior
 */

import { useState, useCallback } from 'react';
import { locationService } from '@/lib/locationService';
import type { LocationResult } from '@/lib/locationService';

interface UseLocationGPSReturn {
  isGettingLocation: boolean;
  getGPSLocation: () => Promise<LocationResult | null>;
}

export function useLocationGPS(): UseLocationGPSReturn {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getGPSLocation = useCallback(async (): Promise<LocationResult | null> => {
    if (!navigator.geolocation) {
      console.error('GPS not supported on this device');
      return null;
    }

    setIsGettingLocation(true);

    try {
      // Use location service which handles GPS and caching
      const result = await locationService.refreshLocationWithGPS();
      return result;
    } catch (error) {
      console.error('GPS error:', error);
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  return {
    isGettingLocation,
    getGPSLocation,
  };
}
