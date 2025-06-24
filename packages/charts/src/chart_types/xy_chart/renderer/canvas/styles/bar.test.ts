/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildBarStyle } from './bar';
import * as commonColors from '../../../../../common/color_library_wrappers';
import { colorToRgba } from '../../../../../common/color_library_wrappers';
import type { Fill, Rect, Stroke } from '../../../../../geoms/types';
import { MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';
import { getTextureStyles } from '../../../utils/texture';

jest.mock('../../../utils/texture');
jest.spyOn(common, 'getColorFromVariant');
jest.spyOn(commonColors, 'colorToRgba');

const COLOR = 'aquamarine';

describe('Bar styles', () => {
  let ctx: CanvasRenderingContext2D;
  let imgCanvas: HTMLCanvasElement;

  // Mock CanvasRenderingContext2D and HTMLCanvasElement for Jest environment
  beforeAll(() => {
    // @ts-ignore
    global.HTMLCanvasElement = class { getContext() { return {}; } };
    // @ts-ignore
    global.CanvasRenderingContext2D = class {};
  });

  describe('#buildBarStyles', () => {
    let result: { fill: Fill; stroke: Stroke };
    let baseColor = COLOR;
    let themeRectStyle = MockStyles.rect();
    let themeRectBorderStyle = MockStyles.rectBorder();
    let geometryStateStyle = MockStyles.geometryState();
    const rect: Rect = {
      height: 250,
      width: 200,
      x: 560,
      y: 30,
    };

    function setDefaults() {
      baseColor = COLOR;
      themeRectStyle = MockStyles.rect();
      themeRectBorderStyle = MockStyles.rectBorder();
      geometryStateStyle = MockStyles.geometryState();
    }

    beforeEach(() => {
      imgCanvas = document.createElement('canvas');
      ctx = imgCanvas.getContext('2d') as CanvasRenderingContext2D;
      result = buildBarStyle(ctx, imgCanvas, baseColor, themeRectStyle, themeRectBorderStyle, geometryStateStyle, rect);
    });

    it('should call getColorFromVariant with correct args for fill', () => {
      expect(common.getColorFromVariant).toHaveBeenNthCalledWith(1, baseColor, themeRectStyle.fill);
    });

    it('should call getColorFromVariant with correct args for border', () => {
      expect(common.getColorFromVariant).toHaveBeenNthCalledWith(1, baseColor, themeRectBorderStyle.stroke);
    });

    describe('Colors', () => {
      const fillColor = '#4aefb8';
      const strokeColor = '#a740cf';

      beforeAll(() => {
        setDefaults();
        (common.getColorFromVariant as jest.Mock).mockImplementation(() => {
          const { length } = (common.getColorFromVariant as jest.Mock).mock.calls;
          return length === 1 ? fillColor : strokeColor;
        });
      });

      it('should call colorToRgba with values from getColorFromVariant', () => {
        expect(colorToRgba).toHaveBeenNthCalledWith(1, fillColor);
        expect(colorToRgba).toHaveBeenNthCalledWith(2, strokeColor);
      });

      it('should return fill with color', () => {
        expect(result.fill.color).toEqual(colorToRgba(fillColor));
      });

      it('should return stroke with color', () => {
        expect(result.stroke.color).toEqual(colorToRgba(strokeColor));
      });
    });

    describe('Opacity', () => {
      const fillColorOpacity = 0.5;
      const strokeColorOpacity = 0.25;
      const fillColor = `rgba(10,10,10,${fillColorOpacity})`;
      const strokeColor = `rgba(10,10,10,${strokeColorOpacity})`;
      const fillOpacity = 0.6;
      const strokeOpacity = 0.8;
      const geoOpacity = 0.75;

      beforeAll(() => {
        setDefaults();
        themeRectStyle = MockStyles.rect({ opacity: fillOpacity });
        themeRectBorderStyle = MockStyles.rectBorder({ strokeOpacity });
        geometryStateStyle = MockStyles.geometryState({ opacity: geoOpacity });
        (common.getColorFromVariant as jest.Mock).mockImplementation(() => {
          const { length } = (common.getColorFromVariant as jest.Mock).mock.calls;
          return length === 1 ? fillColor : strokeColor;
        });
      });

      it('should return correct fill opacity', () => {
        const expected = fillColorOpacity * fillOpacity * geoOpacity;
        expect(result.fill.color[3]).toEqual(expected);
      });

      it('should return correct stroke opacity', () => {
        const expected = strokeColorOpacity * strokeOpacity * geoOpacity;
        expect(result.stroke.color[3]).toEqual(expected);
      });

      describe('themeRectBorderStyle opacity is undefined', () => {
        beforeAll(() => {
          themeRectBorderStyle = {
            ...MockStyles.rectBorder(),
            strokeOpacity: undefined,
          };
        });

        it('should use themeRectStyle opacity', () => {
          const expected = strokeColorOpacity * fillOpacity * geoOpacity;
          expect(result.stroke.color[3]).toEqual(expected);
        });
      });
    });

    describe('Width', () => {
      describe('visible is set to false', () => {
        beforeAll(() => {
          themeRectBorderStyle = MockStyles.rectBorder({ visible: false });
        });

        it('should set stroke width to zero', () => {
          expect(result.stroke.width).toEqual(0);
        });
      });

      describe('visible is set to true', () => {
        const strokeWidth = 22;

        beforeAll(() => {
          themeRectBorderStyle = MockStyles.rectBorder({ visible: true, strokeWidth });
        });

        it('should set stroke width to strokeWidth', () => {
          expect(result.stroke.width).toEqual(strokeWidth);
        });
      });
    });

    describe('Texture', () => {
      const texture = {};
      const mockTexture = {};

      beforeAll(() => {
        setDefaults();
        themeRectStyle = MockStyles.rect({ texture });
        (getTextureStyles as jest.Mock).mockReturnValue(mockTexture);
        imgCanvas = document.createElement('canvas');
        ctx = imgCanvas.getContext('2d') as CanvasRenderingContext2D;
      });

      it('should return correct texture', () => {
        expect(result.fill.texture).toEqual(mockTexture);
      });

      it('should call getTextureStyles with params', () => {
        expect(getTextureStyles).toHaveBeenCalledTimes(1);
        expect(getTextureStyles).toHaveBeenCalledWith(ctx, imgCanvas, baseColor, expect.anything(), texture);
      });
    });
  });
});
