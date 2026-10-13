/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Area, Line } from 'd3-shape';

import type { ShapePath } from '../../../utils/geometry';

type ShapeGenerator<D> = Line<D> | Area<D>;

/**
 * Build a path with d3-shape. In the browser this draws into a Path2D so we skip
 * allocating a large SVG command string; jsdom has no Path2D and still gets SVG.
 *
 * @internal
 */
export function generateShapePath<D>(generator: ShapeGenerator<D>, data: D[]): ShapePath {
  if (typeof Path2D === 'function') {
    const path = new Path2D();
    generator.context(path as unknown as CanvasRenderingContext2D);
    generator(data);
    generator.context(null);
    return path;
  }
  return generator(data) || '';
}
