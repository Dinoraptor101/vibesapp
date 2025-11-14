/**
 * Location Step Component
 * GPS location permission or manual city input
 */

import { MapPin, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-next';
import './LocationStep.css'; // Import shake animation

interface LocationStepProps {
  location: { lat: number; lon: number } | null;
  onLocationChange: (location: { lat: number; lon: number } | null) => void;
  onAutoSuccess?: () => void; // Callback when auto-location succeeds
}

export function LocationStep({ location, onLocationChange, onAutoSuccess }: LocationStepProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(true); // Start with true for auto-detect
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('');
  const [displayLocation, setDisplayLocation] = useState('');
  const [showError, setShowError] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (!autoAttempted && !location) {
      handleGetLocation(true); // Pass true for silent auto-detect
    } else if (location && onAutoSuccess) {
      // If location already exists, proceed immediately
      onAutoSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleGetLocation = (isAutoDetect = false) => {
    if (!navigator.geolocation) {
      if (!isAutoDetect) {
        setError('Geolocation is not supported by your browser');
      }
      setAutoAttempted(true);
      setIsGettingLocation(false);
      return;
    }

    setIsGettingLocation(true);
    setError('');
    if (!isAutoDetect) {
      setCityName(''); // Clear manual input when using GPS
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        onLocationChange({ lat, lon });

        // Reverse geocode to get city name
        try {
          const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
          if (GEOCODING_URL) {
            const response = await fetch(`${GEOCODING_URL}?lat=${lat}&lon=${lon}&format=json`);
            if (response.ok) {
              const data = await response.json();
              const city = data.address?.city || data.address?.town || data.address?.village || '';
              const state = data.address?.state || '';
              const country = data.address?.country || '';

              if (city && state) {
                setDisplayLocation(`${city}, ${state}`);
              } else if (city) {
                setDisplayLocation(`${city}, ${country}`);
              }
            }
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
        }

        setAutoAttempted(true);
        setIsGettingLocation(false);

        // If auto-detect succeeded, trigger callback to advance
        if (isAutoDetect && onAutoSuccess) {
          onAutoSuccess();
        }
      },
      (err) => {
        console.error('Error getting location:', err);
        if (!isAutoDetect) {
          setError('Unable to get your location. Please enter your city manually.');
        }
        setAutoAttempted(true);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualLocationSubmit = async () => {
    if (!cityName.trim()) {
      // Trigger shake animation
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
      return;
    }

    setIsGettingLocation(true);
    setError('');

    try {
      const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;

      if (!GEOCODING_URL) {
        throw new Error('VITE_GEOCODING_URL environment variable is required');
      }

      const response = await fetch(
        `${GEOCODING_URL}?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();

      if (data.length === 0) {
        // City not found - shake and clear
        setShowError(true);
        setCityName('');
        setTimeout(() => setShowError(false), 500);
        return;
      }

      const result = data[0];
      onLocationChange({
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      });

      // Set display location from geocoding result
      const city =
        result.address?.city || result.address?.town || result.address?.village || result.name;
      const state = result.address?.state || '';

      if (city && state) {
        setDisplayLocation(`${city}, ${state}`);
      } else {
        setDisplayLocation(city || result.display_name.split(',').slice(0, 2).join(','));
      }
    } catch (err) {
      // Error - shake and clear
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      {isGettingLocation && !autoAttempted ? (
        // Show loading indicator during initial auto-detect
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-elevated p-12">
          <MapPin className="mb-4 h-12 w-12 animate-pulse text-brand-purple" />
          <p className="text-sm text-text-secondary">Getting your location...</p>
        </div>
      ) : !location ? (
        <>
          <div className="relative">
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="San Francisco, CA"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cityName.trim()) {
                  e.preventDefault();
                  handleManualLocationSubmit();
                }
              }}
              disabled={isGettingLocation}
              className={`w-full rounded-lg border border-border bg-surface px-4 py-3 pr-12 text-text-primary placeholder-text-tertiary focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 disabled:opacity-50 ${
                showError ? 'animate-shake' : ''
              }`}
            />
            <button
              type="button"
              onClick={handleManualLocationSubmit}
              disabled={isGettingLocation || !cityName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-purple p-2 text-white transition-all hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Find this city"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-warning-border bg-warning-bg p-4 text-sm text-warning-text">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface-elevated p-8">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <p className="mb-2 font-semibold text-text-primary">Location Set!</p>
              {displayLocation && <p className="text-sm text-text-secondary">{displayLocation}</p>}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              onLocationChange(null);
              setError('');
              setCityName('');
              setDisplayLocation('');
            }}
            className="w-full"
          >
            Change Location
          </Button>
        </div>
      )}
    </div>
  );
}
