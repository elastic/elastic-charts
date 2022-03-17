/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';

/**
 * Returns function to get geometry styles for a given id
 * @internal
 */
export const getAnnotationHoverStylesFn = (hoveredElementIds: string[], styles: SharedGeometryStateStyle) => (
  id: string,
): GeometryStateStyle =>
  hoveredElementIds.length === 0
    ? styles.default
    : hoveredElementIds.includes(id)
    ? styles.highlighted
    : styles.unhighlighted;
