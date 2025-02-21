/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Pixels } from '../../common/geometry';
import type { Attributes, UseInfo } from '../../common/kingly';

/** @internal */
export interface GLResources {
  roundedRectRenderer: (u: UseInfo) => void;
  pickTextureRenderer: (u: UseInfo) => void;
  attributes: Attributes;
}

/** @internal */
export const NULL_GL_RESOURCES: GLResources = {
  roundedRectRenderer: () => {},
  pickTextureRenderer: () => {},
  attributes: new Map(),
};

/** @internal */
export interface ContinuousDomainFocus {
  currentTimestamp: number;
  currentFocusX0: number;
  currentFocusY0: number;
  currentFocusX1: number;
  currentFocusY1: number;
  prevFocusX0: number;
  prevFocusY0: number;
  prevFocusX1: number;
  prevFocusY1: number;
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => number;

/** @internal */
export const nullColumnarViewModel = {
  label: [],
  value: new Float64Array(),
  color: new Float32Array(),
  position0: new Float32Array(),
  position1: new Float32Array(),
  size0: new Float32Array(),
  size1: new Float32Array(),
};
