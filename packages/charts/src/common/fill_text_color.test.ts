/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from './color_library_wrappers';
import { Colors } from './colors';
import { fillTextColor, TRANSPARENT_LIMIT } from './fill_text_color';

describe('Fill text color', () => {
  describe('highContrastColor', () => {
    it('should return black when background is white', () => {
      expect(fillTextColor(Colors.White.keyword, null, Colors.White.keyword).color.keyword).toEqual(
        RGBATupleToString(Colors.Black.rgba),
      );
    });
    // test contrast computation
    it('should return black with yellow/semi-transparent background', () => {
      expect(fillTextColor(Colors.White.keyword, null, 'rgba(255,255,51,0.3)').color.keyword).toEqual(
        RGBATupleToString(Colors.Black.rgba),
      );
    });
    it('should use white text for Thailand color', () => {
      // black for WCAG2, white for WCAG3
      expect(fillTextColor(Colors.White.keyword, null, 'rgba(120, 116, 178, 1)').color.keyword).toEqual(
        RGBATupleToString(Colors.Black.rgba),
      );
    });
  });

  describe('FallbackBG color', () => {
    const fallbackBG = Colors.White.keyword;

    it('should use fallbackBG if background is transparent and no foreground', () => {
      expect(fillTextColor(fallbackBG, null, Colors.Transparent.keyword).color.keyword).toEqual('rgba(0, 0, 0, 1)');
    });

    it('should use fallbackBG if background is lower tranparent limit and no foreground', () => {
      expect(
        fillTextColor(fallbackBG, null, `rgba(120, 116, 178, ${TRANSPARENT_LIMIT - Number.EPSILON})`).color.keyword,
      ).toEqual('rgba(0, 0, 0, 1)');
    });

    it('should contrast fallbackBG with foreground if background is transparent', () => {
      expect(fillTextColor(fallbackBG, 'rgba(0, 0, 255, 1)', Colors.Transparent.keyword).color.keyword).toEqual(
        'rgba(255, 255, 255, 1)',
      );
    });

    it('should contrast fallbackBG with transparent foreground if background is transparent', () => {
      expect(
        fillTextColor(fallbackBG, `rgba(0, 0, 255, ${TRANSPARENT_LIMIT - Number.EPSILON})`, Colors.Transparent.keyword)
          .color.keyword,
      ).toEqual('rgba(0, 0, 0, 1)');
    });

    it('should return constrast with opac foreground and opac background', () => {
      expect(fillTextColor(fallbackBG, 'rgba(0, 0, 255, 1)', 'rgba(255, 0, 0, 1)').color.keyword).toEqual(
        'rgba(255, 255, 255, 1)',
      );
    });
  });
});
