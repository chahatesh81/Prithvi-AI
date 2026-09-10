import { Coordinates } from '../types/geo';

export function validateCoordinates(lat: number, lon: number): { isValid: boolean; error?: string } {
  if (isNaN(lat) || isNaN(lon)) {
    return { isValid: false, error: 'Latitude and Longitude must be valid numbers' };
  }
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }
  if (lon < -180 || lon > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }
  return { isValid: true };
}

export function formatCoordinates(coords: Coordinates): string {
  const latStr = `${Math.abs(coords.latitude).toFixed(4)}°${coords.latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(coords.longitude).toFixed(4)}°${coords.longitude >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lonStr}`;
}
