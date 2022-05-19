/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';

/** @internal */
export interface AnnotationHoverParams {
  style: GeometryStateStyle;
  isHighlighted: boolean;
  shouldTransition: boolean;
}

/**
 * Returns function to get geometry styles for a given id
 * @internal
 */
export const getAnnotationHoverParamsFn = (hoveredElementIds: string[], styles: SharedGeometryStateStyle) => (
  id: string,
): AnnotationHoverParams => {
  const isHighlighted = hoveredElementIds.includes(id);
  const style =
    hoveredElementIds.length === 0 ? styles.default : isHighlighted ? styles.highlighted : styles.unhighlighted;
  const shouldTransition = !isHighlighted && hoveredElementIds.length > 0;

  return {
    style,
    isHighlighted,
    shouldTransition,
  };
};
