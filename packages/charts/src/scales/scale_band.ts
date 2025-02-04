/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleBand, scaleQuantize } from 'd3-scale';

import { ScaleBandType } from '.';
import { ScaleType } from './constants';
import { Ratio } from '../common/geometry';
import { RelativeBandsPadding } from '../specs/small_multiples';
import { clamp } from '../utils/common';
import { Range } from '../utils/domain';

/**
 * Categorical scale
 * @internal
 */
export class ScaleBand {
  readonly bandwidth: number;
  readonly bandwidthPadding: number;
  readonly step: number;
  readonly outerPadding: number;
  readonly innerPadding: number;
  readonly originalBandwidth: number;
  readonly type: ScaleBandType;
  readonly domain: (string | number)[];
  readonly range: [number, number];
  readonly barsPadding: number;
  readonly minInterval: number;
  readonly unit?: string;

  private readonly project: (d: string | number) => number;
  private readonly inverseProject: (d: number) => string | number | undefined;

  constructor(
    inputDomain: (string | number)[],
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
    const d3Scale = scaleBand<string | number>()
      .domain(inputDomain.length > 0 ? inputDomain : [undefined as unknown as string | number]) // TODO fix this trick
      .range(range)
      .paddingInner(isObjectPad ? barsPadding.inner : safeBarPadding)
      .paddingOuter(isObjectPad ? barsPadding.outer : safeBarPadding / 2);
    this.barsPadding = isObjectPad ? barsPadding.inner : safeBarPadding;
    this.outerPadding = d3Scale.paddingOuter();
    this.innerPadding = d3Scale.paddingInner();
    this.bandwidth = overrideBandwidth ? overrideBandwidth * (1 - safeBarPadding) : d3Scale.bandwidth() || 0;
    this.originalBandwidth = d3Scale.bandwidth() || 0;
    this.step = d3Scale.step();
    this.domain = (inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined]) as (string | number)[];
    this.range = [range[0], range[1]];
    this.bandwidthPadding = this.bandwidth;
    const invertedScale = scaleQuantize<string | number, undefined>()
      .domain(range)
      .range(inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined as unknown as string | number]);

    this.minInterval = 0; // FIXED doesn't exist in reality
    this.project = (d) => d3Scale(d) ?? NaN;
    this.inverseProject = (d) => invertedScale(d);
  }

  scale(value: string | number): number {
    return this.project(value);
  }

  // TODO this can be removed, it is there just to simplify the code with the continuous scale
  pureScale(value: string | number) {
    return this.scale(value);
  }

  ticks(): (string | number)[] {
    return this.domain;
  }

  invert(value: number): string | number | undefined {
    return this.inverseProject(value);
  }

  invertWithStep(value: number): {
    withinBandwidth: boolean;
    value: string | number | undefined;
  } {
    return {
      withinBandwidth: true,
      value: this.inverseProject(value),
    };
  }

  isSingleValue() {
    return this.domain.length < 2;
  }

  isValueInDomain(value: string | number) {
    return this.domain.includes(value);
  }
}
