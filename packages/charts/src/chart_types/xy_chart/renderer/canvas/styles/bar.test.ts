/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { Fill, Stroke } from '../../../../../geoms/types';
import { getMockCanvas, getMockCanvasContext2D, MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';
import { getTextureStyles } from '../../../utils/texture';
import { buildBarStyles } from './bar';

import 'jest-canvas-mock';

jest.mock('../../../../../common/color_library_wrappers');
jest.mock('../../../utils/texture');
jest.spyOn(common, 'getColorFromVariant');

const COLOR = 'aquamarine';

describe('Bar styles', () => {
  let ctx: CanvasRenderingContext2D;
  let imgCanvas: HTMLCanvasElement;

  beforeEach(() => {
    ctx = getMockCanvasContext2D();
    imgCanvas = getMockCanvas();
  });

  describe('#buildBarStyles', () => {
    let result: { fill: Fill; stroke: Stroke };
    let baseColor = COLOR;
    let themeRectStyle = MockStyles.rect();
    let themeRectBorderStyle = MockStyles.rectBorder();
    let geometryStateStyle = MockStyles.geometryState();

    function setDefaults() {
      baseColor = COLOR;
      themeRectStyle = MockStyles.rect();
      themeRectBorderStyle = MockStyles.rectBorder();
      geometryStateStyle = MockStyles.geometryState();
    }

    beforeEach(() => {
      result = buildBarStyles(ctx, imgCanvas, baseColor, themeRectStyle, themeRectBorderStyle, geometryStateStyle);
    });

    it('should call getColorFromVariant with correct args for fill', () => {
      expect(common.getColorFromVariant).nthCalledWith(1, baseColor, themeRectStyle.fill);
    });

    it('should call getColorFromVariant with correct args for border', () => {
      expect(common.getColorFromVariant).nthCalledWith(1, baseColor, themeRectBorderStyle.stroke);
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

      it('should call stringToRGB with values from getColorFromVariant', () => {
        expect(stringToRGB).nthCalledWith(1, fillColor, expect.any(Function));
        expect(stringToRGB).nthCalledWith(2, strokeColor, expect.any(Function));
      });

      it('should return fill with color', () => {
        expect(result.fill.color).toEqual(stringToRGB(fillColor));
      });

      it('should return stroke with color', () => {
        expect(result.stroke.color).toEqual(stringToRGB(strokeColor));
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
        expect(result.fill.color.opacity).toEqual(expected);
      });

      it('should return correct stroke opacity', () => {
        const expected = strokeColorOpacity * strokeOpacity * geoOpacity;
        expect(result.stroke.color.opacity).toEqual(expected);
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
          expect(result.stroke.color.opacity).toEqual(expected);
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
      });

      it('should return correct texture', () => {
        expect(result.fill.texture).toEqual(mockTexture);
      });

      it('should call getTextureStyles with params', () => {
        expect(getTextureStyles).toBeCalledTimes(1);
        expect(getTextureStyles).toBeCalledWith(ctx, imgCanvas, baseColor, expect.anything(), texture);
      });
    });
  });
});
