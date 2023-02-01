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
import { Fill } from '../../../../../geoms/types';
import { MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';
import { getTextureStyles } from '../../../utils/texture';

jest.mock('../../../utils/texture');
jest.spyOn(common, 'getColorFromVariant');
jest.spyOn(commonColors, 'colorToRgba');

const COLOR = 'aquamarine';

describe('Area styles', () => {
  let ctx: CanvasRenderingContext2D;
  let imgCanvas: HTMLCanvasElement;

  describe('#buildAreaStyles', () => {
    let result: Fill;
    let baseColor = COLOR;
    let themeAreaStyle = MockStyles.area();
    let geometryStateStyle = MockStyles.geometryState();

    function setDefaults() {
      baseColor = COLOR;
      themeAreaStyle = MockStyles.area();
      geometryStateStyle = MockStyles.geometryState();
    }

    beforeEach(() => {
      result = buildAreaStyles(ctx, imgCanvas, baseColor, themeAreaStyle, geometryStateStyle);
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
        geometryStateStyle = MockStyles.geometryState({ opacity: geoOpacity });
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
  });
});
