/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @public */
export type ChartSizeArray = [number | string | undefined, number | string | undefined];
/** @public */
export interface ChartSizeObject {
  width?: number | string;
  height?: number | string;
}

/** @public */
export type ChartSize = number | string | ChartSizeArray | ChartSizeObject;

/** @internal */
export function getChartSize(size?: ChartSize): Required<ChartSizeObject> {
  if (Array.isArray(size)) {
    return {
      width: size[0] === undefined ? '100%' : size[0],
      height: size[1] === undefined ? '100%' : size[1],
    };
  }
  if (typeof size === 'object') {
    return {
      width: size.width === undefined ? '100%' : size.width,
      height: size.height === undefined ? '100%' : size.height,
    };
  }
  const sameSize = size === undefined ? '100%' : size;
  return {
    width: sameSize,
    height: sameSize,
  };
}

/**
 * Return the requested size if specified in pixel, null otherwise
 * @internal
 */
export function getFixedChartSize(size?: ChartSize): { width: number; height: number } | null {
  const { width, height } = getChartSize(size);
  return typeof height === 'number' && typeof width === 'number' ? { width, height } : null;
}
