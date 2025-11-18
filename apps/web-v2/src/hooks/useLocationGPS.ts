/**
 * useLocationGPS Hook
 * Shared GPS location fetching with reverse geocoding
 */

import { useState, useCallback } from 'react';

interface LocationResult {
  lat: number;
  lon: number;
  city: string;
}

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
      // Get GPS coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city name
      try {
        const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
        if (!GEOCODING_URL) {
          throw new Error('VITE_GEOCODING_URL not configured');
        }

        // Use /reverse endpoint for reverse geocoding
        const reverseUrl = GEOCODING_URL.replace('/search', '/reverse');
        const response = await fetch(`${reverseUrl}?lat=${latitude}&lon=${longitude}&format=json`);

        if (response.ok) {
          const data = await response.json();
          console.log('Reverse geocoding response:', data);
          const address = data.address || {};

          // Try multiple fields to get the best city name
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            address.state;

          if (city) {
            return {
              lat: latitude,
              lon: longitude,
              city,
            };
          } else {
            console.warn('No city found in geocoding response');
            // Fallback to coordinates as string
            return {
              lat: latitude,
              lon: longitude,
              city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            };
          }
        }
      } catch (err) {
        console.error('Error reverse geocoding:', err);
      }

      // If geocoding failed, return coordinates with coords as city fallback
      return {
        lat: latitude,
        lon: longitude,
        city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };
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
