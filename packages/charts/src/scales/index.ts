/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { ScaleType } from './constants';

/** @public */
export type ScaleContinuousType =
  | typeof ScaleType.Linear
  | typeof ScaleType.Time
  | typeof ScaleType.Log
  | typeof ScaleType.Sqrt;

/** @public */
export type ScaleOrdinalType = typeof ScaleType.Ordinal;

/** @public */
export type ScaleBandType = ScaleOrdinalType;

/**
 * A `Scale` interface. A scale can map an input value within a specified domain
 * to an output value from a specified range.
 * The the value is mapped depending on the `type` (linear, log, sqrt, time, ordinal)
 * @internal
 */
export interface Scale<T> {
  domain: T[];
  range: number[];
  /**
   * Returns the distance between the starts of adjacent bands.
   */
  step: number;
  ticks: () => T[];
  scale: (value?: PrimitiveValue) => number | null;
  pureScale: (value?: PrimitiveValue) => number | null;
  invert: (value: number) => T;
  invertWithStep: (
    value: number,
    data: any[],
  ) => {
    value: T;
    withinBandwidth: boolean;
  };
  isSingleValue: () => boolean;
  /** Check if the passed value is within the scale domain */
  isValueInDomain: (value: any) => boolean;
  bandwidth: number;
  bandwidthPadding: number;
  minInterval: number;
  type: ScaleContinuousType | ScaleOrdinalType;
  /**
   * @todo
   * designates unit of scale to compare to other Chart axis
   */
  unit?: string;
  isInverted: boolean;
  barsPadding: number;
}

/** @internal */
export { ScaleBand } from './scale_band';
/** @internal */
export { ScaleContinuous } from './scale_continuous';

export { LogScaleOptions } from './types';
