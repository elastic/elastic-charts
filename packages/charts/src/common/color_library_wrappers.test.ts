/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  stringToRGB,
  validateColor,
  defaultD3Color,
  argsToRGB,
  RgbObject,
  argsToRGBString,
  RGBtoString,
} from './color_library_wrappers';

describe('d3 Utils', () => {
  describe('stringToRGB', () => {
    describe('bad colors or undefined', () => {
      it('should return default color for undefined color string', () => {
        expect(stringToRGB()).toMatchObject({
          r: 255,
          g: 0,
          b: 0,
          opacity: 1,
        });
      });

      it('should return default RgbObject', () => {
        expect(stringToRGB('not a color')).toMatchObject({
          r: 255,
          g: 0,
          b: 0,
          opacity: 1,
        });
      });

      it('should return default color if bad opacity', () => {
        expect(stringToRGB('rgba(50,50,50,x)')).toMatchObject({
          r: 255,
          g: 0,
          b: 0,
          opacity: 1,
        });
      });
    });

    describe('hex colors', () => {
      it('should return RgbObject', () => {
        expect(stringToRGB('#ef713d')).toMatchObject({
          r: 239,
          g: 113,
          b: 61,
        });
      });

      it('should return RgbObject from shorthand', () => {
        expect(stringToRGB('#ccc')).toMatchObject({
          r: 204,
          g: 204,
          b: 204,
        });
      });

      it('should return RgbObject with correct opacity', () => {
        // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        expect(stringToRGB('#ef713d80').opacity).toBeCloseTo(0.5, 1);
      });

      it('should return correct RgbObject for alpha value of 0', () => {
        expect(stringToRGB('#00000000')).toMatchObject({
          r: 0,
          g: 0,
          b: 0,
          opacity: 0,
        });
      });
    });

    describe('rgb colors', () => {
      it('should return RgbObject', () => {
        expect(stringToRGB('rgb(50,50,50)')).toMatchObject({
          r: 50,
          g: 50,
          b: 50,
        });
      });

      it('should return RgbObject with correct opacity', () => {
        expect(stringToRGB('rgba(50,50,50,0.25)').opacity).toBe(0.25);
      });

      it('should return correct RgbObject for alpha value of 0', () => {
        expect(stringToRGB('rgba(50,50,50,0)')).toMatchObject({
          r: 50,
          g: 50,
          b: 50,
          opacity: 0,
        });
      });
    });

    describe('hsl colors', () => {
      it('should return RgbObject', () => {
        expect(stringToRGB('hsl(0,0%,50%)')).toMatchObject({
          r: 128,
          g: 128,
          b: 128,
          opacity: 1,
        });
      });

      it('should return RgbObject with correct opacity', () => {
        expect(stringToRGB('hsla(0,0%,50%,0.25)').opacity).toBe(0.25);
      });

      it('should return correct RgbObject for alpha value of 0', () => {
        expect(stringToRGB('hsla(0,0%,50%,0)')).toEqual({
          r: 128,
          g: 128,
          b: 128,
          opacity: 0,
        });
      });
    });

    describe('named colors', () => {
      it('should return RgbObject', () => {
        expect(stringToRGB('aquamarine')).toMatchObject({
          r: 127,
          g: 255,
          b: 212,
        });
      });

      it('should return default RgbObject with 0 opacity', () => {
        expect(stringToRGB('transparent')).toMatchObject({
          r: 0,
          g: 0,
          b: 0,
          opacity: 0,
        });
      });

      it('should return default RgbObject with 0 opacity even with override', () => {
        expect(stringToRGB('transparent', 0.5)).toMatchObject({
          r: 0,
          g: 0,
          b: 0,
          opacity: 0,
        });
      });
    });

    describe('Optional opactiy override', () => {
      it('should override opacity from color', () => {
        expect(stringToRGB('rgba(50,50,50,0.25)', 0.75).opacity).toBe(0.75);
      });

      it('should use OpacityFn to compute opacity override', () => {
        expect(stringToRGB('rgba(50,50,50,0.25)', (o) => o * 2).opacity).toBe(0.5);
      });
    });

    describe('Edge Cases', () => {
      it.each([
        [undefined, { r: 255, g: 0, b: 0, opacity: 1 }],
        ['', { r: 255, g: 0, b: 0, opacity: 1 }],
        ['bad', { r: 187, g: 170, b: 221, opacity: 1 }],
        ['#00000000', { r: 0, g: 0, b: 0, opacity: 0 }],
        ['#000000', { r: 0, g: 0, b: 0, opacity: 1 }],
        ['#6092c000', { r: 96, g: 146, b: 192, opacity: 0 }],
        ['#6092c06b', { r: 96, g: 146, b: 192, opacity: 0.42 }],
        ['blue', { r: 0, g: 0, b: 255, opacity: 1 }],
        ['hsl(20, 100%, 40%)', { r: 204, g: 68, b: 0, opacity: 1 }],
        ['hsla(20, 100%, 40%, 0.5)', { r: 204, g: 68, b: 0, opacity: 0.5 }],
        ['hsla(20, 100%, 40%, 0)', { r: 204, g: 68, b: 0, opacity: 0 }],
        ['rgb(0,128,128)', { r: 0, g: 128, b: 128, opacity: 1 }],
        ['rgba(0,128,128,0.5)', { r: 0, g: 128, b: 128, opacity: 0.5 }],
        ['rgba(0,128,128,0)', { r: 0, g: 128, b: 128, opacity: 0 }],
      ])('input: $1', (input, output) => {
        expect(stringToRGB(input)).toEqual(output);
      });
    });
  });

  describe('validateColor', () => {
    it.each<string>(['r', 'g', 'b', 'opacity'])('should return null if %s is NaN', (value) => {
      expect(
        validateColor({
          ...defaultD3Color,
          [value]: NaN,
        }),
      ).toBeNull();
    });

    it('should return valid colors', () => {
      expect(validateColor(defaultD3Color)).toBe(defaultD3Color);
    });
  });

  describe('argsToRGB', () => {
    it.each<keyof RgbObject>(['r', 'g', 'b', 'opacity'])('should return defaultD3Color if %s is NaN', (value) => {
      const { r, g, b, opacity }: RgbObject = {
        ...defaultD3Color,
        [value]: NaN,
      };
      expect(argsToRGB(r, g, b, opacity)).toEqual(defaultD3Color);
    });

    it('should return valid colors', () => {
      const { r, g, b, opacity } = defaultD3Color;
      expect(argsToRGB(r, g, b, opacity)).toEqual(defaultD3Color);
    });
  });

  describe('argsToRGBString', () => {
    it('should return valid colors', () => {
      const { r, g, b, opacity } = defaultD3Color;
      expect(argsToRGBString(r, g, b, opacity)).toBe('rgb(255, 0, 0)');
    });
  });

  describe('RGBtoString', () => {
    it('should return valid colors', () => {
      expect(RGBtoString(defaultD3Color)).toBe('rgb(255, 0, 0)');
    });
  });
});
