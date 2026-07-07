/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildAreaStyles } from './area';
import * as commonColors from '../../../../../common/color_library_wrappers';
import { colorToRgba } from '../../../../../common/color_library_wrappers';
import type { Fill } from '../../../../../geoms/types';
import { MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';
import type { GeometryHighlightState } from '../../../../../utils/geometry';
import { getTextureStyles } from '../../../utils/texture';

jest.mock('../../../utils/texture');
jest.spyOn(common, 'getColorFromVariant');
jest.spyOn(commonColors, 'colorToRgba');

const COLOR = 'aquamarine';

describe('Area styles', () => {
  // not used by the tests below (the texture path is mocked), only passed through
  const ctx = {} as unknown as CanvasRenderingContext2D;
  const imgCanvas = {} as unknown as HTMLCanvasElement;

  describe('#buildAreaStyles', () => {
    let result: Fill;
    let baseColor = COLOR;
    let themeAreaStyle = MockStyles.area();
    let geometryHighlightState: GeometryHighlightState = 'default';

    function setDefaults() {
      baseColor = COLOR;
      themeAreaStyle = MockStyles.area();
      geometryHighlightState = 'default';
    }

    beforeEach(() => {
      result = buildAreaStyles(ctx, imgCanvas, baseColor, themeAreaStyle, geometryHighlightState);
    });

    it('should call getColorFromVariant with correct args for fill', () => {
      expect(common.getColorFromVariant).toHaveBeenNthCalledWith(1, baseColor, themeAreaStyle.fill);
    });

    describe('Colors', () => {
      const fillColor = '#4aefb8';

      beforeAll(() => {
        setDefaults();
        (common.getColorFromVariant as jest.Mock).mockReturnValue(fillColor);
      });

      it('should call colorToRgba with values from getColorFromVariant', () => {
        expect(colorToRgba).toHaveBeenNthCalledWith(1, fillColor);
      });

      it('should return fill with color', () => {
        expect(result.color).toEqual(colorToRgba(fillColor));
      });
    });

    describe('Opacity', () => {
      const fillColorOpacity = 0.5;
      const fillColor = `rgba(10,10,10,${fillColorOpacity})`;
      const fillOpacity = 0.6;
      const geoOpacity = 0.75;

      beforeAll(() => {
        setDefaults();
        themeAreaStyle = MockStyles.area({ opacity: fillOpacity });
        geometryHighlightState = 'dimmed';
        (common.getColorFromVariant as jest.Mock).mockReturnValue(fillColor);
      });

      it('should return correct fill opacity', () => {
        const expected = fillColorOpacity * fillOpacity * geoOpacity;
        expect(result.color[3]).toEqual(expected);
      });
    });

    describe('Texture', () => {
      const texture = {};
      const mockTexture = {};

      beforeAll(() => {
        setDefaults();
        themeAreaStyle = MockStyles.area({ texture });
        (getTextureStyles as jest.Mock).mockReturnValue(mockTexture);
      });

      it('should return correct texture', () => {
        expect(result.texture).toEqual(mockTexture);
      });

      it('should call getTextureStyles with params', () => {
        expect(getTextureStyles).toHaveBeenCalledTimes(1);
        expect(getTextureStyles).toHaveBeenCalledWith(ctx, imgCanvas, baseColor, expect.anything(), texture);
      });
    });

    describe('Gradient', () => {
      beforeAll(() => {
        // pass static colors through, and resolve the series variant to a known color
        (common.getColorFromVariant as jest.Mock).mockImplementation((_baseColor, color) =>
          color === common.ColorVariant.Series ? 'rgba(1,2,3,1)' : color,
        );
      });

      describe('when no gradient is configured', () => {
        beforeAll(() => {
          setDefaults();
        });

        it('should not return a gradient', () => {
          expect(result.gradient).toBeUndefined();
        });
      });

      describe('when a gradient is configured', () => {
        beforeAll(() => {
          setDefaults();
          themeAreaStyle = {
            ...MockStyles.area({ opacity: 0.5 }),
            gradient: {
              type: 'linear',
              x0: 0.1,
              y0: 0.2,
              x1: 0.3,
              y1: 0.4,
              stops: [
                { offset: 0, color: 'rgba(10,10,10,1)' },
                { offset: 0.5, color: common.ColorVariant.Series, opacity: 0.6 },
                { offset: 1, color: 'rgba(20,20,20,0.5)' },
              ],
            },
          };
        });

        it('should resolve coordinates, offsets, the series variant and fold stop/area opacity', () => {
          // series-variant stops are resolved against the (dimmed-aware) base color
          expect(common.getColorFromVariant).toHaveBeenCalledWith(baseColor, common.ColorVariant.Series);
          // coordinates pass through, and each stop alpha = colorAlpha * stopOpacity * areaOpacity (0.5)
          expect(result.gradient).toEqual({
            type: 'linear',
            x0: 0.1,
            y0: 0.2,
            x1: 0.3,
            y1: 0.4,
            stops: [
              { offset: 0, color: [10, 10, 10, 0.5] },
              { offset: 0.5, color: [1, 2, 3, 0.3] },
              { offset: 1, color: [20, 20, 20, 0.25] },
            ],
          });
        });
      });

      describe('when gradient coordinates are omitted', () => {
        beforeAll(() => {
          setDefaults();
          themeAreaStyle = {
            ...MockStyles.area(),
            gradient: {
              type: 'linear',
              stops: [{ offset: 0, color: 'rgba(0,0,0,1)' }],
            },
          };
        });

        it('should default to a vertical (bottom-to-top) gradient', () => {
          expect(result.gradient).toMatchObject({ x0: 0, y0: 1, x1: 0, y1: 0 });
        });
      });
    });
  });
});
