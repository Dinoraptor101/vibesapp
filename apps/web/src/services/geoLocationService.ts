/**
 * Service for handling geolocation functionality.
 * Manages user location data with browser's Geolocation API and cookie storage.
 * Provides methods to obtain and persist approximate user location coordinates.
 */

const LOCATION_COOKIE = 'user_location';

import type { ILocation } from '../types';
import { getCookie, setCookie } from '../utils/cookieUtils';
import { logDebug } from '../utils/utils';

class GeoLocationService {
  static getLocation(): Promise<ILocation> {
    return new Promise((resolve, reject) => {
      // Step 1: Check for Existing Cookie
      try {
        const locationCookie = getCookie(LOCATION_COOKIE);

        if (locationCookie) {
          const location: ILocation = JSON.parse(locationCookie);
          logDebug(`Location obtained from cookie: ${JSON.stringify(location)}`);
          resolve(location);
          return;
        }
      } catch (error) {
        console.error(`Error reading location from cookie: ${error}`);
      }

      // Step 2: Request Location using Geolocation API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const generalLocation: ILocation = GeoLocationService.getGeneralLocation(
            latitude,
            longitude
          );

          // Step 2a: Set a cookie with the location for X days to avoid prompting user
          setCookie(LOCATION_COOKIE, JSON.stringify(generalLocation), 30);

          // Step 2b: Resolve the promise with the location
          logDebug(`Location obtained from Geolocation API: ${JSON.stringify(generalLocation)}`);
          resolve(generalLocation);
        },
        (error) => {
          console.error(`Error obtaining location from Geolocation API: ${error.message}`);
          reject(error); //Reject and Pass the error to the caller
        }
      );
    });
  }

  static getGeneralLocation(latitude: number, longitude: number) {
    const roundedLatitude = Math.round(latitude * 100) / 100;
    const roundedLongitude = Math.round(longitude * 100) / 100;
    return {
      lat: roundedLatitude,
      lon: roundedLongitude,
    };
  }
}

export default GeoLocationService;
