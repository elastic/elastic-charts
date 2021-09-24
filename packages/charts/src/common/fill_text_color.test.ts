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
      expect(fillTextColor(null, Colors.White.keyword)).toEqual(RGBATupleToString(Colors.Black.rgba));
    });
    // test contrast computation
    it('should return black with yellow/semi-transparent background', () => {
      expect(fillTextColor(null, 'rgba(255,255,51,0.3)')).toEqual(RGBATupleToString(Colors.Black.rgba));
    });
    it('should use white text for Thailand color', () => {
      // black for WCAG2, white for WCAG3
      expect(fillTextColor(null, 'rgba(120, 116, 178, 1)')).toEqual(RGBATupleToString(Colors.Black.rgba));
    });
  });

  describe('Fallback color', () => {
    const fallback = Colors.Red.keyword;

    it('should return fallback if background is transparent and no foreground', () => {
      expect(fillTextColor(null, Colors.Transparent.keyword, fallback)).toEqual(fallback);
    });

    it('should return fallback if background is lower tranparent limit and no foreground', () => {
      expect(fillTextColor(null, `rgba(120, 116, 178, ${TRANSPARENT_LIMIT - Number.EPSILON})`, fallback)).toEqual(
        fallback,
      );
    });

    it('should contrast with opac foreground if background is transparent', () => {
      expect(fillTextColor('rgba(0, 0, 255, 1)', Colors.Transparent.keyword, fallback)).toEqual(
        'rgba(255, 255, 255, 1)',
      );
    });

    it('should return fallback with transparent foreground if background is transparent', () => {
      expect(
        fillTextColor(`rgba(0, 0, 255, ${TRANSPARENT_LIMIT - Number.EPSILON})`, Colors.Transparent.keyword, fallback),
      ).toEqual(fallback);
    });

    it('should return constrast with white foreground blend if background is transparent with no fallback', () => {
      expect(
        fillTextColor(`rgba(0, 0, 255, ${TRANSPARENT_LIMIT - Number.EPSILON})`, Colors.Transparent.keyword),
      ).toEqual('rgba(0, 0, 0, 1)');
    });

    it('should return constrast with opac foreground and opac background', () => {
      expect(fillTextColor('rgba(0, 0, 255, 1)', 'rgba(255, 0, 0, 1)', fallback)).toEqual('rgba(255, 255, 255, 1)');
    });

    it('should return constrast with white foreground blend and white background blend if no fallback', () => {
      expect(
        fillTextColor(
          `rgba(0, 0, 255, ${TRANSPARENT_LIMIT - Number.EPSILON})`,
          `rgba(255, 0, 0, ${TRANSPARENT_LIMIT - Number.EPSILON})`,
        ),
      ).toEqual('rgba(0, 0, 0, 1)');
    });
  });
});
