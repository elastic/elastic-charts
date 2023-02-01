/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LIGHT_THEME } from './light_theme';
import { LineAnnotationStyle, PartialTheme, RectAnnotationStyle, Theme } from './theme';
import { mergePartial, RecursivePartial } from '../common';

/** @public */
export const DEFAULT_ANNOTATION_LINE_STYLE: LineAnnotationStyle = {
  line: {
    stroke: '#777',
    strokeWidth: 1,
    opacity: 1,
  },
  details: {
    fontSize: 10,
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
    fill: '#777',
    padding: 0,
  },
};
/** @public */
export const DEFAULT_ANNOTATION_RECT_STYLE: RectAnnotationStyle = {
  stroke: '#FFEEBC',
  strokeWidth: 0,
  opacity: 0.25,
  fill: '#FFEEBC',
};

/** @public */
export function mergeWithDefaultAnnotationLine(config?: RecursivePartial<LineAnnotationStyle>): LineAnnotationStyle {
  return mergePartial(DEFAULT_ANNOTATION_LINE_STYLE, config);
}

/** @public */
export function mergeWithDefaultAnnotationRect(config?: RecursivePartial<RectAnnotationStyle>): RectAnnotationStyle {
  return mergePartial(DEFAULT_ANNOTATION_RECT_STYLE, config);
}

/**
 * Merge theme or themes with a base theme
 *
 * priority is based on spatial order
 *
 * @param theme - primary partial theme
 * @param defaultTheme - base theme
 * @param auxiliaryThemes - additional themes to be merged
 *
 * @public
 * @deprecated - Please use `baseTheme` and `theme` on Settings instead
 */
export function mergeWithDefaultTheme(
  theme: PartialTheme,
  defaultTheme: Theme = LIGHT_THEME,
  auxiliaryThemes: PartialTheme[] = [],
): Theme {
  return mergePartial(defaultTheme, theme, {}, auxiliaryThemes);
}
