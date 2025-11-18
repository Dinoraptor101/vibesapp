/**
 * Location Input Component for Settings
 * Reuses location logic from signup flow
 * Auto-saves location changes to backend
 */

import { MapPin, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../../auth/components/LocationStep.css'; // Import shake animation

interface LocationInputProps {
  initialLocation: { lat: number; lon: number } | null;
  initialDisplayLocation?: string;
  onLocationChange: (location: { lat: number; lon: number }, displayLocation: string) => void;
}

export function LocationInput({
  initialLocation,
  initialDisplayLocation = '',
  onLocationChange,
}: LocationInputProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(initialLocation);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [cityName, setCityName] = useState('');
  const [displayLocation, setDisplayLocation] = useState(initialDisplayLocation);
  const [showError, setShowError] = useState(false);

  // Update local state when initial values change
  useEffect(() => {
    setLocation(initialLocation);
    setDisplayLocation(initialDisplayLocation);
  }, [initialLocation, initialDisplayLocation]);

  // ZEN: 1-second delay before showing loading spinner
  useEffect(() => {
    if (isGettingLocation) {
      const timer = setTimeout(() => setShowLoadingSpinner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingSpinner(false);
    }
  }, [isGettingLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setCityName(''); // Clear manual input when using GPS

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        let locationCaptionFound = false;
        let newDisplayLocation = '';

        // Reverse geocode to get city name
        try {
          const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
          if (GEOCODING_URL) {
            const response = await fetch(`${GEOCODING_URL}?lat=${lat}&lon=${lon}&format=json`);
            if (response.ok) {
              const data = await response.json();
              const address = data.address || {};

              // Build a more detailed address string
              const parts = [];

              // Add neighborhood or suburb if available
              if (address.neighbourhood || address.suburb) {
                parts.push(address.neighbourhood || address.suburb);
              }

              // Add city/town/village
              const locality =
                address.city || address.town || address.village || address.municipality;
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
              if (parts.length === 0 && data.display_name) {
                const displayParts = data.display_name.split(',').slice(0, 3);
                newDisplayLocation = displayParts.join(',').trim();
                locationCaptionFound = !!newDisplayLocation;
              } else if (parts.length > 0) {
                newDisplayLocation = parts.join(', ');
                locationCaptionFound = true;
              }
            }
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
        }

        if (locationCaptionFound) {
          setLocation({ lat, lon });
          setDisplayLocation(newDisplayLocation);
          onLocationChange({ lat, lon }, newDisplayLocation);
        }

        setIsGettingLocation(false);
      },
      (err) => {
        console.error('Error getting location:', err);
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
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
      return;
    }

    setIsGettingLocation(true);

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
        setShowError(true);
        setCityName('');
        setTimeout(() => setShowError(false), 500);
        return;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

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

      let newDisplayLocation: string;
      // Fallback to display_name if we couldn't build a good address
      if (parts.length === 0 && result.display_name) {
        const displayParts = result.display_name.split(',').slice(0, 3);
        newDisplayLocation = displayParts.join(',').trim();
      } else {
        newDisplayLocation = parts.join(', ');
      }

      setLocation({ lat, lon });
      setDisplayLocation(newDisplayLocation);
      onLocationChange({ lat, lon }, newDisplayLocation);
    } catch {
      setShowError(true);
      setCityName('');
      setTimeout(() => setShowError(false), 500);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div>
      <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
        Location
      </div>
      {!location ? (
        <div className="space-y-2">
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
              className={`w-full rounded-lg border border-gray-300 dim:border-gray-500 dark:border-gray-600 bg-white dim:bg-gray-700 dark:bg-gray-800 px-4 py-2 pr-12 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 ${
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
              <Send className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 hover:bg-gray-50 dim:hover:bg-gray-650 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGettingLocation && showLoadingSpinner ? (
              <>
                <MapPin className="w-4 h-4 animate-pulse" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Use GPS
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-gray-50 dim:bg-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 dim:text-gray-200 dark:text-gray-300 truncate">
              {displayLocation}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocation(null);
              setCityName('');
              setDisplayLocation('');
            }}
            className="text-gray-500 hover:text-brand-purple transition-colors flex-shrink-0 ml-2"
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
              aria-label="Edit icon"
            >
              <title>Edit</title>
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
