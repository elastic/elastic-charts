import { ScaleBand } from '.';

describe('Scale Band', () => {
  it('shall clone domain and range arrays', () => {
    const domain = [0, 1, 2, 3];
    const range = [0, 100] as [number, number];
    const scale = new ScaleBand(domain, range);
    expect(scale.domain).not.toBe(domain);
    expect(scale.range).not.toBe(range);
    expect(scale.domain).toEqual(domain);
    expect(scale.range).toEqual(range);
  });
  it('shall scale a numeric domain', () => {
    const domain = [0, 1, 2, 3];
    const range = [0, 100] as [number, number];
    const scale = new ScaleBand(domain, range);
    expect(scale.bandwidth).toBe(25);
    expect(scale.scale(0)).toBe(0);
    expect(scale.scale(1)).toBe(25);
    expect(scale.scale(2)).toBe(50);
    expect(scale.scale(3)).toBe(75);
  });
  it('shall scale a string domain', () => {
    const scale = new ScaleBand(['a', 'b', 'c', 'd'], [0, 100]);
    expect(scale.bandwidth).toBe(25);
    expect(scale.scale('a')).toBe(0);
    expect(scale.scale('b')).toBe(25);
    expect(scale.scale('c')).toBe(50);
    expect(scale.scale('d')).toBe(75);
  });
  it('is value within domain', () => {
    const scale = new ScaleBand(['a', 'b', 'c', 'd'], [0, 100]);
    expect(scale.bandwidth).toBe(25);
    expect(scale.isValueInDomain('a')).toBe(true);
    expect(scale.isValueInDomain('b')).toBe(true);
    expect(scale.isValueInDomain('z')).toBe(false);
    expect(scale.isValueInDomain(null)).toBe(false);
  });
  it('shall scale a any domain', () => {
    const scale = new ScaleBand(['a', 1, null, 'd', undefined], [0, 100]);
    expect(scale.bandwidth).toBe(20);
    expect(scale.scale('a')).toBe(0);
    expect(scale.scale(1)).toBe(20);
    expect(scale.scale(null)).toBe(40);
    expect(scale.scale('d')).toBe(60);
    expect(scale.scale(undefined)).toBe(80);
  });
  it('shall scale remove domain duplicates', () => {
    const scale = new ScaleBand(['a', 'a', 'b', 'c', 'c', 'd'], [0, 100]);
    expect(scale.bandwidth).toBe(25);
    expect(scale.scale('a')).toBe(0);
    expect(scale.scale('b')).toBe(25);
    expect(scale.scale('c')).toBe(50);
    expect(scale.scale('d')).toBe(75);
  });
  it('shall scale a domain with inverted range', () => {
    const scale = new ScaleBand(['a', 'b', 'c', 'd'], [100, 0]);
    expect(scale.bandwidth).toBe(25);
    expect(scale.scale('a')).toBe(75);
    expect(scale.scale('b')).toBe(50);
    expect(scale.scale('c')).toBe(25);
    expect(scale.scale('d')).toBe(0);
  });
  it('shall return undefined for out of domain values', () => {
    const scale = new ScaleBand(['a', 'b', 'c', 'd'], [0, 100]);
    expect(scale.scale('e')).toBeUndefined();
    expect(scale.scale(0)).toBeUndefined();
    expect(scale.scale(null)).toBeUndefined();
  });
  it('shall scale a numeric domain with padding', () => {
    const scale = new ScaleBand([0, 1, 2], [0, 120], undefined, 0.5);
    expect(scale.bandwidth).toBe(20);
    expect(scale.step).toBe(40);
    // an empty 1 step place at the beginning
    expect(scale.scale(0)).toBe(10); // padding
    expect(scale.scale(1)).toBe(50); // padding + step
    expect(scale.scale(2)).toBe(90);
    // an empty 1 step place at the end

    const scale2 = new ScaleBand([0, 1, 2, 3], [0, 100], undefined, 0.5);
    expect(scale2.bandwidth).toBe(12.5);
    expect(scale2.step).toBe(25);
    // an empty 1/2 step place at the beginning
    expect(scale2.scale(0)).toBe(6.25);
    expect(scale2.scale(1)).toBe(31.25);
    expect(scale2.scale(2)).toBe(56.25);
    expect(scale2.scale(3)).toBe(81.25);
    // an empty 1/2 step place at the end
  });
  it('shall not scale scale null values', () => {
    const scale = new ScaleBand([0, 1, 2], [0, 120], undefined, 0.5);
    expect(scale.scale(-1)).toBeUndefined();
    expect(scale.scale(3)).toBeUndefined();
  });
  it('shall invert all values in range', () => {
    const domain = ['a', 'b', 'c', 'd'];
    const minRange = 0;
    const maxRange = 100;
    const scale = new ScaleBand(domain, [minRange, maxRange]);
    expect(scale.invert(0)).toBe('a');
    expect(scale.invert(15)).toBe('a');
    expect(scale.invert(24)).toBe('a');
    expect(scale.invert(24.99999)).toBe('a');
    expect(scale.invert(25)).toBe('b');
    expect(scale.invert(99.99999)).toBe('d');
    expect(scale.invert(100)).toBe('d');
  });
  describe('isSingleValue', () => {
    it('should return true for single value scale', () => {
      const scale = new ScaleBand(['a'], [0, 100]);
      expect(scale.isSingleValue()).toBe(true);
    });
    it('should return false for multi value scale', () => {
      const scale = new ScaleBand(['a', 'b'], [0, 100]);
      expect(scale.isSingleValue()).toBe(false);
    });
  });
});
