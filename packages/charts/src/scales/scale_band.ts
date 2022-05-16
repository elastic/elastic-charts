/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleBand, scaleQuantize, ScaleQuantize, ScaleBand as D3ScaleBand } from 'd3-scale';

import { Scale, ScaleBandType } from '.';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { Ratio } from '../common/geometry';
import { RelativeBandsPadding } from '../specs';
import { clamp } from '../utils/common';
import { Range } from '../utils/domain';
import { ScaleType } from './constants';

/**
 * Categorical scale
 * @internal
 */
export class ScaleBand<T extends number | string> implements Scale<T> {
  readonly bandwidth: number;

  readonly bandwidthPadding: number;

  readonly step: number;

  readonly outerPadding: number;

  readonly innerPadding: number;

  readonly originalBandwidth: number;

  readonly type: ScaleBandType;

  readonly domain: [T, ...T[]];

  readonly range: number[];

  readonly isInverted: boolean;

  readonly invertedScale: ScaleQuantize<T>;

  readonly minInterval: number;

  readonly barsPadding: number;

  private readonly d3Scale: D3ScaleBand<NonNullable<PrimitiveValue>>;

  constructor(
    inputDomain: T[],
    range: Range,
    overrideBandwidth?: number,
    /**
     * The proportion of the range that is reserved for blank space between bands
     * A number between 0 and 1.
     * @defaultValue 0
     */
    barsPadding: Ratio | RelativeBandsPadding = 0,
  ) {
    const isObjectPad = typeof barsPadding === 'object';
    const safeBarPadding = isObjectPad ? 0 : clamp(barsPadding, 0, 1);
    this.type = ScaleType.Ordinal;
    this.d3Scale = scaleBand<NonNullable<PrimitiveValue>>();
    this.d3Scale.domain(inputDomain.length > 0 ? inputDomain : [(undefined as unknown) as T]);
    this.d3Scale.range(range);
    this.d3Scale.paddingInner(isObjectPad ? barsPadding.inner : safeBarPadding);
    this.d3Scale.paddingOuter(isObjectPad ? barsPadding.outer : safeBarPadding / 2);
    this.barsPadding = isObjectPad ? barsPadding.inner : safeBarPadding;
    this.outerPadding = this.d3Scale.paddingOuter();
    this.innerPadding = this.d3Scale.paddingInner();
    this.bandwidth = overrideBandwidth ? overrideBandwidth * (1 - safeBarPadding) : this.d3Scale.bandwidth() || 0;
    this.originalBandwidth = this.d3Scale.bandwidth() || 0;
    this.step = this.d3Scale.step();
    this.domain = (inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined]) as [T, ...T[]];
    this.range = range.slice();
    this.bandwidthPadding = this.bandwidth;
    this.isInverted = false;
    this.invertedScale = scaleQuantize<T>()
      .domain(range)
      .range(inputDomain.length > 0 ? [...new Set(inputDomain)] : [(undefined as unknown) as T]);
    this.minInterval = 0;
  }

  scale(value?: PrimitiveValue) {
    const scaleValue = this.d3Scale((value as unknown) as T);
    return typeof scaleValue === 'number' && Number.isFinite(scaleValue) ? scaleValue : NaN; // fixme when TS improves
  }

  pureScale(value?: PrimitiveValue) {
    return this.scale(value);
  }

  ticks() {
    return this.domain;
  }

  invert(value: number) {
    return this.invertedScale(value);
  }

  invertWithStep(value: number) {
    return {
      value: this.invertedScale(value),
      withinBandwidth: true,
    };
  }

  isSingleValue() {
    return this.domain.length < 2;
  }

  isValueInDomain(value: T) {
    return this.domain.includes(value);
  }
}
