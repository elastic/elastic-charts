/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildLineStyles } from './line';
import * as commonColors from '../../../../../common/color_library_wrappers';
import { colorToRgba } from '../../../../../common/color_library_wrappers';
import type { Stroke } from '../../../../../geoms/types';
import { MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';

jest.spyOn(common, 'getColorFromVariant');
jest.spyOn(commonColors, 'colorToRgba');

const COLOR = 'aquamarine';

describe('Line styles', () => {
  describe('#buildLineStyles', () => {
    let result: Stroke;
    let baseColor = COLOR;
    let themeLineStyle = MockStyles.line();
    let geometryStateStyle = MockStyles.geometryState();

    function setDefaults() {
      baseColor = COLOR;
      themeLineStyle = MockStyles.line();
      geometryStateStyle = MockStyles.geometryState();
    }

    beforeEach(() => {
      result = buildLineStyles(baseColor, themeLineStyle, geometryStateStyle);
    });

    it('should call getColorFromVariant with correct args for stroke', () => {
      expect(common.getColorFromVariant).toHaveBeenNthCalledWith(1, baseColor, themeLineStyle.stroke);
    });

    it('should set strokeWidth from themeLineStyle', () => {
      expect(result.width).toBe(themeLineStyle.strokeWidth);
    });

    it('should set dash from themeLineStyle', () => {
      expect(result.dash).toEqual(themeLineStyle.dash);
    });

    describe('Colors', () => {
      const strokeColor = '#4aefb8';

      beforeAll(() => {
        setDefaults();
        (common.getColorFromVariant as jest.Mock).mockReturnValue(strokeColor);
      });

      it('should call colorToRgba with values from getColorFromVariant', () => {
        expect(colorToRgba).toHaveBeenNthCalledWith(1, strokeColor);
      });

      it('should return stroke with color', () => {
        expect(result.color).toEqual(colorToRgba(strokeColor));
      });
    });

    describe('Opacity', () => {
      const strokeColorOpacity = 0.5;
      const strokeColor = `rgba(10,10,10,${strokeColorOpacity})`;
      const strokeOpacity = 0.6;
      const geoOpacity = 0.75;

      beforeAll(() => {
        setDefaults();
        themeLineStyle = MockStyles.line({ opacity: strokeOpacity });
        geometryStateStyle = MockStyles.geometryState({ opacity: geoOpacity });
        (common.getColorFromVariant as jest.Mock).mockReturnValue(strokeColor);
      });

      it('should return correct stroke opacity', () => {
        const expected = strokeColorOpacity * strokeOpacity * geoOpacity;
        expect(result.color[3]).toEqual(expected);
      });
    });
  });
});
