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
import { clamp, stringifyNullsUndefined } from '../utils/common';
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

  readonly domain: [T, T, ...T[]];

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
    this.type = ScaleType.Ordinal;
    this.d3Scale = scaleBand<NonNullable<PrimitiveValue>>();
    this.d3Scale.domain(inputDomain.length > 0 ? inputDomain : [(undefined as unknown) as T]);
    this.d3Scale.range(range);
    const isObjectPad = typeof barsPadding === 'object';
    const safeBarPadding = isObjectPad ? 0 : clamp(barsPadding, 0, 1);
    if (isObjectPad) {
      this.d3Scale.paddingInner(barsPadding.inner);
      this.d3Scale.paddingOuter(barsPadding.outer);
      this.barsPadding = barsPadding.inner;
    } else {
      this.d3Scale.paddingInner(safeBarPadding);
      this.barsPadding = safeBarPadding;
      this.d3Scale.paddingOuter(safeBarPadding / 2);
    }

    this.outerPadding = this.d3Scale.paddingOuter();
    this.innerPadding = this.d3Scale.paddingInner();
    this.bandwidth = this.d3Scale.bandwidth() || 0;
    this.originalBandwidth = this.d3Scale.bandwidth() || 0;
    this.step = this.d3Scale.step();
    // prefilling with undefined to ensure at least two elements, as the uses of `domain` index with 0 and 1 at least
    // [] => [undefined, undefined]
    // [7] => [7, 7]
    // [7, 9, ...] => [7, 9, ...]
    /*
        const preDomain = [...new Set(inputDomain)];
        this.domain = [
          ...preDomain,
          ...new Array(Math.max(0, 2 - preDomain.length)).fill(preDomain.length > 0 ? preDomain[0] : undefined),
        ] as [T, T, ...T[]];
    */
    this.domain = (inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined]) as [T, T, ...T[]];
    this.range = range.slice();
    if (overrideBandwidth) {
      this.bandwidth = overrideBandwidth * (1 - safeBarPadding);
    }
    this.bandwidthPadding = this.bandwidth;
    // TO FIX: we are assuming that it's ordered
    this.isInverted = inputDomain.length > 1 ? this.domain[0] > this.domain[1] : false;
    this.invertedScale = scaleQuantize<T>()
      .domain(range)
      .range(inputDomain.length > 0 ? [...new Set(inputDomain)] : [(undefined as unknown) as T]);
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
