/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LineAnnotationStyle, RectAnnotationStyle } from './theme';
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
