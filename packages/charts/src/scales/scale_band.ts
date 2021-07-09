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
import { maxValueWithUpperLimit, stringifyNullsUndefined } from '../utils/common';
import { Range } from '../utils/domain';
import { ScaleType } from './constants';

/**
 * Categorical scale
 * @internal
 */
export class ScaleBand implements Scale {
  readonly bandwidth: number;

  readonly bandwidthPadding: number;

  readonly step: number;

  readonly outerPadding: number;

  readonly innerPadding: number;

  readonly originalBandwidth: number;

  readonly type: ScaleBandType;

  readonly domain: any[];

  readonly range: number[];

  readonly isInverted: boolean;

  readonly invertedScale: ScaleQuantize<number>;

  readonly minInterval: number;

  readonly barsPadding: number;

  private readonly d3Scale: D3ScaleBand<NonNullable<PrimitiveValue>>;

  constructor(
    domain: any[],
    range: Range,
    overrideBandwidth?: number,
    /**
     * The proportion of the range that is reserved for blank space between bands
     * A number between 0 and 1.
     * @defaultValue 0
     */
    barsPadding: Ratio | RelativeBandsPadding = 0,
  ) {
    this.type = ScaleType.Ordinal;
    this.d3Scale = scaleBand<NonNullable<PrimitiveValue>>();
    this.d3Scale.domain(domain);
    this.d3Scale.range(range);
    let safeBarPadding = 0;
    if (typeof barsPadding === 'object') {
      this.d3Scale.paddingInner(barsPadding.inner);
      this.d3Scale.paddingOuter(barsPadding.outer);
      this.barsPadding = barsPadding.inner;
    } else {
      safeBarPadding = maxValueWithUpperLimit(barsPadding, 0, 1);
      this.d3Scale.paddingInner(safeBarPadding);
      this.barsPadding = safeBarPadding;
      this.d3Scale.paddingOuter(safeBarPadding / 2);
    }

    this.outerPadding = this.d3Scale.paddingOuter();
    this.innerPadding = this.d3Scale.paddingInner();
    this.bandwidth = this.d3Scale.bandwidth() || 0;
    this.originalBandwidth = this.d3Scale.bandwidth() || 0;
    this.step = this.d3Scale.step();
    this.domain = this.d3Scale.domain();
    this.range = range.slice();
    if (overrideBandwidth) {
      this.bandwidth = overrideBandwidth * (1 - safeBarPadding);
    }
    this.bandwidthPadding = this.bandwidth;
    // TO FIX: we are assuming that it's ordered
    this.isInverted = this.domain[0] > this.domain[1];
    this.invertedScale = scaleQuantize().domain(range).range(this.domain);
    this.minInterval = 0;
  }

  private getScaledValue(value?: PrimitiveValue): number | null {
    const scaleValue = this.d3Scale(stringifyNullsUndefined(value));

    if (scaleValue === undefined || isNaN(scaleValue)) {
      return null;
    }

    return scaleValue;
  }

  scaleOrThrow(value?: PrimitiveValue): number {
    const scaleValue = this.scale(value);

    if (scaleValue === null) {
      throw new Error(`Unable to scale value: ${scaleValue})`);
    }

    return scaleValue;
  }

  scale(value?: PrimitiveValue) {
    return this.getScaledValue(value);
  }

  pureScale(value?: PrimitiveValue) {
    return this.getScaledValue(value);
  }

  ticks() {
    return this.domain;
  }

  invert(value: any) {
    return this.invertedScale(value);
  }

  invertWithStep(value: any) {
    return {
      value: this.invertedScale(value),
      withinBandwidth: true,
    };
  }

  isSingleValue() {
    return this.domain.length < 2;
  }

  isValueInDomain(value: any) {
    return this.domain.includes(value);
  }
}
