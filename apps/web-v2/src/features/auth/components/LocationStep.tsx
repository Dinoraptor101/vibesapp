/**
 * Location Step Component
 * GPS location permission or manual city input
 */

import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button, Input } from '@/components/ui-next';

interface LocationStepProps {
  location: { lat: number; lon: number } | null;
  onLocationChange: (location: { lat: number; lon: number }) => void;
}

export function LocationStep({ location, onLocationChange }: LocationStepProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [cityName, setCityName] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setManualEntry(true);
      return;
    }

    setIsGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Unable to get your location. Please enter your city manually.');
        setManualEntry(true);
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
      setError('Please enter a city name');
      return;
    }

    setIsGettingLocation(true);
    setError('');

    try {
      // Use a geocoding service to convert city name to coordinates
      // For now, using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error('City not found. Please try a different name.');
      }

      onLocationChange({
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      });
      setManualEntry(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      {!location ? (
        <>
          {!manualEntry ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-border bg-surface-elevated p-8">
                <MapPin className="h-16 w-16 text-brand-purple" />
                <p className="text-center text-sm text-text-secondary">
                  We'll use your location to show you nearby vibes and local content
                </p>
                <Button
                  onClick={handleGetLocation}
                  loading={isGettingLocation}
                  disabled={isGettingLocation}
                  size="lg"
                  leftIcon={!isGettingLocation ? <MapPin className="h-5 w-5" /> : undefined}
                >
                  {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setManualEntry(true)}
                className="mx-auto block text-sm font-medium text-brand-purple hover:underline"
              >
                Or enter your city manually
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="City Name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualLocationSubmit();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setManualEntry(false);
                    setError('');
                  }}
                  disabled={isGettingLocation}
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualLocationSubmit}
                  loading={isGettingLocation}
                  disabled={isGettingLocation || !cityName.trim()}
                  className="flex-1"
                >
                  {isGettingLocation ? 'Finding...' : 'Find Location'}
                </Button>
              </div>

              <p className="text-center text-xs text-text-secondary">
                We'll convert your city to coordinates for location-based features
              </p>
            </div>
          )}

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
              <p className="text-sm text-text-secondary">
                Coordinates: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              onLocationChange({ lat: 0, lon: 0 });
              setManualEntry(false);
              setError('');
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
