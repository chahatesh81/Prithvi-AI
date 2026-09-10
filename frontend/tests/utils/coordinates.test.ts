import { describe, it, expect } from 'vitest';
import { validateCoordinates, formatCoordinates } from '../../src/utils/coordinates';

describe('Coordinates Utilities', () => {
  it('validates valid coordinates correctly', () => {
    const result = validateCoordinates(31.1048, 77.1734);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects latitude greater than 90', () => {
    const result = validateCoordinates(95.0, 77.1734);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Latitude must be between -90 and 90');
  });

  it('rejects longitude less than -180', () => {
    const result = validateCoordinates(31.1048, -190.0);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Longitude must be between -180 and 180');
  });

  it('formats coordinates string properly', () => {
    const formatted = formatCoordinates({ latitude: 31.1048, longitude: 77.1734 });
    expect(formatted).toBe('31.1048°N, 77.1734°E');
  });
});
