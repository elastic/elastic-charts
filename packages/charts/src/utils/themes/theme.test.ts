/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DARK_THEME } from './dark_theme';
import { LIGHT_THEME } from './light_theme';
import {
  DEFAULT_ANNOTATION_LINE_STYLE,
  DEFAULT_ANNOTATION_RECT_STYLE,
  mergeWithDefaultAnnotationLine,
  mergeWithDefaultAnnotationRect,
} from './merge_utils';
import { LineAnnotationStyle, TextStyle, Theme } from './theme';

describe('Theme', () => {
  let CLONED_LIGHT_THEME: Theme;
  let CLONED_DARK_THEME: Theme;

  beforeEach(() => {
    CLONED_LIGHT_THEME = JSON.parse(JSON.stringify(LIGHT_THEME));
    CLONED_DARK_THEME = JSON.parse(JSON.stringify(DARK_THEME));
  });

  afterEach(() => {
    // check default immutability
    expect(LIGHT_THEME).toEqual(CLONED_LIGHT_THEME);
    expect(DARK_THEME).toEqual(CLONED_DARK_THEME);
  });

  describe('mergeWithDefaultAnnotationLine', () => {
    it('should merge custom and default annotation line configs', () => {
      expect(mergeWithDefaultAnnotationLine()).toEqual(DEFAULT_ANNOTATION_LINE_STYLE);

      const customLineConfig = {
        stroke: 'foo',
        strokeWidth: 50,
        opacity: 1,
      };

      const defaultLineConfig = {
        stroke: '#777',
        strokeWidth: 1,
        opacity: 1,
      };

      const customDetailsConfig: TextStyle = {
        fontSize: 50,
        fontFamily: 'custom-font-family',
        fontStyle: 'italic',
        fill: 'custom-fill',
        padding: 20,
      };

      const defaultDetailsConfig = {
        fontSize: 10,
        fill: '#777',
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        padding: 0,
      };

      const expectedMergedCustomLineConfig = {
        line: customLineConfig,
        details: defaultDetailsConfig,
      } as LineAnnotationStyle;
      const mergedCustomLineConfig = mergeWithDefaultAnnotationLine({ line: customLineConfig });
      expect(mergedCustomLineConfig).toEqual(expectedMergedCustomLineConfig);

      const expectedMergedCustomDetailsConfig = {
        line: defaultLineConfig,
        details: customDetailsConfig,
      } as LineAnnotationStyle;
      const mergedCustomDetailsConfig = mergeWithDefaultAnnotationLine({ details: customDetailsConfig });
      expect(mergedCustomDetailsConfig).toEqual(expectedMergedCustomDetailsConfig);
    });
  });

  describe('mergeWithDefaultAnnotationRect', () => {
    it('should merge custom and default rect annotation style', () => {
      expect(mergeWithDefaultAnnotationRect()).toEqual(DEFAULT_ANNOTATION_RECT_STYLE);

      const customConfig = {
        stroke: 'customStroke',
        fill: 'customFill',
      };

      const expectedMergedConfig = {
        stroke: 'customStroke',
        fill: 'customFill',
        opacity: 0.25,
        strokeWidth: 0,
      };

      expect(mergeWithDefaultAnnotationRect(customConfig)).toEqual(expectedMergedConfig);
    });
  });
});
