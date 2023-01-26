/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from './color_library_wrappers';
import { Colors } from './colors';
import { Logger } from '../utils/logger';

jest.mock('../utils/logger', () => ({
  Logger: {
    warn: jest.fn(),
  },
}));

describe('color library wrappers utils', () => {
  describe('colorToRgba', () => {
    describe('bad colors or undefined', () => {
      it('should return default RgbaTuple', () => {
        expect(colorToRgba('not a color')).toMatchObject(Colors.Red.rgba);
      });

      it('should return default color if bad opacity', () => {
        expect(colorToRgba('rgba(50,50,50,x)')).toMatchObject(Colors.Red.rgba);
      });
    });

    describe('hex colors', () => {
      it('should return RgbaTuple', () => {
        expect(colorToRgba('#ef713d')).toMatchObject([239, 113, 61, 1]);
      });

      it('should return RgbaTuple from shorthand', () => {
        expect(colorToRgba('#ccc')).toMatchObject([204, 204, 204, 1]);
      });

      it('should return RgbaTuple with correct opacity', () => {
        // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        expect(colorToRgba('#ef713d80')[3]).toBeCloseTo(0.5, 1);
      });

      it('should return correct RgbaTuple for alpha value of 0', () => {
        expect(colorToRgba('#00000000')).toMatchObject(Colors.Transparent.rgba);
      });
    });

    describe('rgb colors', () => {
      it('should return RgbaTuple', () => {
        expect(colorToRgba('rgb(50,50,50)')).toMatchObject([50, 50, 50, 1]);
      });

      it('should return RgbaTuple with correct opacity', () => {
        expect(colorToRgba('rgba(50,50,50,0.25)')[3]).toBe(0.25);
      });

      it('should return correct RgbaTuple for alpha value of 0', () => {
        expect(colorToRgba('rgba(50,50,50,0)')).toMatchObject([50, 50, 50, 0]);
      });
    });

    describe('hsl colors', () => {
      it('should return RgbaTuple', () => {
        expect(colorToRgba('hsl(0,0%,50%)')).toMatchObject([128, 128, 128, 1]);
      });

      it('should return RgbaTuple with correct opacity', () => {
        expect(colorToRgba('hsla(0,0%,50%,0.25)')[3]).toBe(0.25);
      });

      it('should return correct RgbaTuple for alpha value of 0', () => {
        expect(colorToRgba('hsla(0,0%,50%,0)')).toEqual([128, 128, 128, 0]);
      });
    });

    describe('named colors', () => {
      it('should return RgbaTuple', () => {
        expect(colorToRgba('aquamarine')).toMatchObject([127, 255, 212, 1]);
      });

      it('should return default RgbaTuple with 0 opacity', () => {
        expect(colorToRgba('transparent')).toMatchObject(Colors.Transparent.rgba);
      });

      it('should return default RgbaTuple with 0 opacity even with override', () => {
        expect(overrideOpacity(colorToRgba('transparent'), 0.5)).toMatchObject(Colors.Transparent.rgba);
      });
    });

    describe('Optional opacity override', () => {
      it('should override opacity from color', () => {
        expect(overrideOpacity(colorToRgba('rgba(50,50,50,0.25)'), 0.75)[3]).toBe(0.75);
      });

      it('should use OpacityFn to compute opacity override', () => {
        expect(overrideOpacity(colorToRgba('rgba(50,50,50,0.25)'), (o) => o * 2)[3]).toBe(0.5);
      });
    });

    describe('Edge Cases', () => {
      it.each([
        // [undefined, [255,0,0, 1 ],
        ['', Colors.Red.rgba],
        ['bad', [187, 170, 221, 1]],
        ['#00000000', Colors.Transparent.rgba],
        ['#000000', Colors.Black.rgba],
        ['#6092c000', [96, 146, 192, 0]],
        ['#6092c06b', [96, 146, 192, 0.42]],
        ['blue', [0, 0, 255, 1]],
        ['hsl(20, 100%, 40%)', [204, 68, 0, 1]],
        ['hsla(20, 100%, 40%, 0.5)', [204, 68, 0, 0.5]],
        ['hsla(20, 100%, 40%, 0)', [204, 68, 0, 0]],
        ['rgb(0,128,128)', [0, 128, 128, 1]],
        ['rgba(0,128,128,0.5)', [0, 128, 128, 0.5]],
        ['rgba(0,128,128,0)', [0, 128, 128, 0]],
      ])('input: $1', (input, output) => {
        expect(colorToRgba(input)).toEqual(output);
      });
    });
  });

  describe('colorToRGB always return a color', () => {
    it.each<string>(['rgba(NaN, 0, 0, 0)', 'rgba(0, NaN, 0, 0)', 'rgba(0, 0, NaN, 0)', 'rgba(0, 0, 0, NaN)'])(
      'should return null if %s is NaN',
      (color) => {
        expect(colorToRgba(color)).toEqual(Colors.Red.rgba);
        expect(Logger.warn).toHaveBeenCalledTimes(1);
      },
    );
  });
});
