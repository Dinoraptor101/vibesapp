import type React from 'react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import GeoLocationService from '../services/geoLocationService';
import type { ILocation, ILocationContextType } from '../types';
import { getCookie } from '../utils/cookieUtils';

/**
 * Context for sharing location data throughout the application.
 */
export const LocationContext = createContext<ILocationContextType | undefined>(undefined);

/**
 * A custom hook that handles geolocation functionality.
 * It attempts to get the user's location and manages associated states including
 * the current location, any errors that occur, and whether location access was denied.
 * @returns {ILocationContextType} Object containing location data, error state, and denied state
 */
const useLocation = (): ILocationContextType => {
  const [location, setLocation] = useState<ILocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const userId = getCookie('userId');
      if (!userId) {
        return;
      }

      if (!navigator.geolocation) {
        const errorMessage = 'Geolocation is not supported by your browser';
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }

      try {
        const locationData = await GeoLocationService.getLocation();
        const { lat, lon } = locationData as ILocation;
        setLocation({ lat, lon });
      } catch (error) {
        let errorMessage = 'Error fetching location';
        const errorCode = (error as { code?: number }).code;
        if (errorCode) {
          switch (errorCode) {
            case 1:
              errorMessage = 'User denied the request for Geolocation.';
              setIsDenied(true);
              break;
            case 2:
              errorMessage = 'Location information is unavailable.';
              break;
            case 3:
              errorMessage = 'The request to get user location timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
              break;
          }
        }
        console.error('Error obtaining location from Geolocation API:', errorMessage, error);
        setError(errorMessage);
      }
    };

    fetchLocation();
  }, []);

  return { location, error, isDenied };
};

/**
 * Provider component that makes location data available to any nested components.
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const locationData = useLocation();

  return <LocationContext.Provider value={locationData}>{children}</LocationContext.Provider>;
};

/**
 * Custom hook to access the location context.
 * Must be used within a LocationProvider component.
 * @returns {ILocationContextType} The location context value
 * @throws {Error} If used outside of a LocationProvider
 */
export const useLocationContext = (): ILocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export default useLocation;
