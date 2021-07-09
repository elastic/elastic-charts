/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export interface BBox {
  width: number;
  height: number;
}

/** @internal */
export const DEFAULT_EMPTY_BBOX = {
  width: 0,
  height: 0,
};

/** @internal */
export interface BBoxCalculator {
  compute(text: string, padding: number, fontSize?: number, fontFamily?: string): BBox;
  destroy(): void;
}
