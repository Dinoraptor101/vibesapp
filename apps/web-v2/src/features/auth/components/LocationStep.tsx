/**
 * Location Step Component
 * GPS location permission or manual city input
 */

import { MapPin, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocationGPS } from '@/hooks/useLocationGPS';
import './LocationStep.css'; // Import shake animation

interface LocationStepProps {
  location: { lat: number; lon: number } | null;
  onLocationChange: (location: { lat: number; lon: number } | null) => void;
  onCityStateChange?: (city: string, state: string) => void;
  // Removed onAutoSuccess - no longer auto-advancing
}

export function LocationStep({ location, onLocationChange, onCityStateChange }: LocationStepProps) {
  const { isGettingLocation, getGPSLocation } = useLocationGPS();
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); // ZEN: 1-second delay
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('');
  const [displayLocation, setDisplayLocation] = useState('');
  const [showError, setShowError] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState(false);

  // ZEN: 1-second delay before showing loading spinner
  useEffect(() => {
    if (isGettingLocation) {
      const timer = setTimeout(() => setShowLoadingSpinner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingSpinner(false);
    }
  }, [isGettingLocation]);

  // Auto-detect location on mount (ZEN: minimize interaction)
  useEffect(() => {
    if (!autoAttempted && !location) {
      handleGetLocation(true); // Pass true for silent auto-detect
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleGetLocation = async (isAutoDetect = false) => {
    if (!isAutoDetect) {
      setCityName(''); // Clear manual input when using GPS
    }

    const result = await getGPSLocation();
    setAutoAttempted(true);

    if (result) {
      onLocationChange({ lat: result.lat, lon: result.lon });
      setDisplayLocation(result.city);
      // Extract city and state from the result and pass to parent
      if (onCityStateChange && result.city) {
        const parts = result.city.split(', ');
        const city = parts[0] || '';
        const state = parts[1] || '';
        onCityStateChange(city, state);
      }
      setError('');
      // ZEN: Show detected location, let user confirm (no auto-advance)
    } else if (!isAutoDetect) {
      setError('Unable to get your location. Please enter your city manually.');
    }
  };

  const handleManualLocationSubmit = async () => {
    if (!cityName.trim()) {
      // Trigger shake animation
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
      return;
    }

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

      // Set display location from geocoding result with better formatting
      const address = result.address || {};
      const parts = [];

      // Add neighborhood or suburb if available
      if (address.neighbourhood || address.suburb) {
        parts.push(address.neighbourhood || address.suburb);
      }

      // Add city/town/village
      const locality =
        address.city || address.town || address.village || address.municipality || result.name;
      if (locality) {
        parts.push(locality);
      }

      // Add state/region
      if (address.state) {
        parts.push(address.state);
      }

      // Add country for international locations
      if (address.country && address.country_code !== 'us') {
        parts.push(address.country);
      }

      // Fallback to display_name if we couldn't build a good address
      if (parts.length === 0 && result.display_name) {
        const displayParts = result.display_name.split(',').slice(0, 3);
        setDisplayLocation(displayParts.join(',').trim());
      } else {
        setDisplayLocation(parts.join(', '));
      }

      // Pass city and state to parent
      if (onCityStateChange) {
        const resolvedCity = locality || '';
        const resolvedState = address.state || '';
        onCityStateChange(resolvedCity, resolvedState);
      }
    } catch {
      // Error - shake and clear
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fixed-height container for smooth transitions (ZEN: no layout shifts) */}
      <div className="min-h-[200px] flex items-center justify-center">
        {isGettingLocation && showLoadingSpinner && !autoAttempted ? (
          // ZEN: Show loading only after 1-second delay (avoid flash for fast GPS)
          <div className="flex flex-col items-center justify-center w-full">
            <MapPin className="mb-4 h-12 w-12 animate-pulse text-brand-purple" />
            <p className="text-sm text-text-secondary">Getting your location...</p>
          </div>
        ) : !location ? (
          <div className="w-full space-y-4">
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
          </div>
        ) : (
          // Location confirmed state - clean and minimal
          <div className="w-full">
            <div className="rounded-lg border border-border bg-surface-elevated p-6">
              {/* Centered location icon */}
              <div className="flex justify-center mb-3">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>

              {/* Location text with inline edit button */}
              <div className="flex items-center justify-center gap-2">
                {displayLocation && (
                  <p className="text-sm text-text-secondary leading-relaxed">{displayLocation}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onLocationChange(null);
                    setError('');
                    setCityName('');
                    setDisplayLocation('');
                  }}
                  className="text-text-tertiary hover:text-brand-purple transition-colors flex-shrink-0"
                  aria-label="Change location"
                  title="Change location"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
