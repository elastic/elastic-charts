/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DARK_THEME } from './dark_theme';
import { LIGHT_THEME } from './light_theme';
import { mergeWithDefaultAnnotationLine, mergeWithDefaultAnnotationRect } from './merge_utils';
import type { LineAnnotationStyle, Theme } from './theme';

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
      expect(mergeWithDefaultAnnotationLine(LIGHT_THEME.lineAnnotation)).toEqual(LIGHT_THEME.lineAnnotation);

      const customLineConfig = {
        stroke: 'red',
        strokeWidth: 50,
        opacity: 1,
      };

      const expectedMergedCustomLineConfig: LineAnnotationStyle = {
        line: customLineConfig,
      };
      const mergedCustomLineConfig = mergeWithDefaultAnnotationLine(LIGHT_THEME.lineAnnotation, {
        line: customLineConfig,
      });
      expect(mergedCustomLineConfig).toEqual(expectedMergedCustomLineConfig);
    });
  });

  describe('mergeWithDefaultAnnotationRect', () => {
    it('should merge custom and default rect annotation style', () => {
      expect(mergeWithDefaultAnnotationRect(LIGHT_THEME.rectAnnotation)).toEqual(LIGHT_THEME.rectAnnotation);

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

      expect(mergeWithDefaultAnnotationRect(LIGHT_THEME.rectAnnotation, customConfig)).toEqual(expectedMergedConfig);
    });
  });
});
