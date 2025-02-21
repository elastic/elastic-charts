/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from './scale_defaults';
import type { ScaleContinuousType } from '../../../scales';
import type { BasicSeriesSpec, XScaleType } from '../utils/specs';

/** @internal */
export function getXScaleTypeFromSpec(type?: BasicSeriesSpec['xScaleType']): XScaleType {
  return type ?? X_SCALE_DEFAULT.type;
}

/** @internal */
export function getXNiceFromSpec(nice?: BasicSeriesSpec['xNice']): boolean {
  return nice ?? X_SCALE_DEFAULT.nice;
}

/** @internal */
export function getYScaleTypeFromSpec(type?: BasicSeriesSpec['yScaleType']): ScaleContinuousType {
  return type ?? Y_SCALE_DEFAULT.type;
}

/** @internal */
export function getYNiceFromSpec(nice?: BasicSeriesSpec['yNice']): boolean {
  return nice ?? Y_SCALE_DEFAULT.nice;
}
