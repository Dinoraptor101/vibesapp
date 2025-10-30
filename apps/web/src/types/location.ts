// Location-related type definitions
export interface ILocation {
  lat: number;
  lon: number;
}

export interface IGeoLocation extends ILocation {
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface ILocationContextType {
  location: ILocation | null;
  error: string | null;
  isDenied: boolean;
}

export interface IGeolocationPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}
