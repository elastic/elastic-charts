/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { scaleBand, scaleQuantize, ScaleQuantize, ScaleBand as D3ScaleBand } from 'd3-scale';
import { clamp } from '../utils/commons';
import { ScaleType, Scale } from '.';

export class ScaleBand implements Scale {
  readonly bandwidth: number;
  readonly bandwidthPadding: number;
  readonly step: number;
  readonly type: ScaleType;
  readonly domain: any[];
  readonly range: number[];
  readonly isInverted: boolean;
  readonly invertedScale: ScaleQuantize<number>;
  readonly minInterval: number;
  readonly barsPadding: number;
  private readonly d3Scale: D3ScaleBand<string | number>;

  constructor(
    domain: any[],
    range: [number, number],
    overrideBandwidth?: number,
    /**
     * The proportion of the range that is reserved for blank space between bands
     * A number between 0 and 1.
     * @default 0
     */
    barsPadding = 0,
  ) {
    this.type = ScaleType.Ordinal;
    this.d3Scale = scaleBand<string | number>();
    this.d3Scale.domain(domain);
    this.d3Scale.range(range);
    const safeBarPadding = clamp(barsPadding, 0, 1);
    this.barsPadding = safeBarPadding;
    this.d3Scale.paddingInner(safeBarPadding);
    this.d3Scale.paddingOuter(safeBarPadding / 2);
    this.bandwidth = this.d3Scale.bandwidth() || 0;
    this.step = this.d3Scale.step();
    this.domain = this.d3Scale.domain();
    this.range = range.slice();
    if (overrideBandwidth) {
      this.bandwidth = overrideBandwidth * (1 - safeBarPadding);
    }
    this.bandwidthPadding = this.bandwidth;
    // TO FIX: we are assiming that it's ordered
    this.isInverted = this.domain[0] > this.domain[1];
    this.invertedScale = scaleQuantize()
      .domain(range)
      .range(this.domain);
    this.minInterval = 0;
  }

  scale(value: string | number) {
    const scaleValue = this.d3Scale(value);

    if (typeof scaleValue !== 'number') {
      console.error(`The value (${value}) was not scalable`);
      return 0;
    }

    return scaleValue;
  }

  pureScale(value: string | number) {
    const scaleValue = this.d3Scale(value);

    if (typeof scaleValue !== 'number') {
      console.error(`The value (${value}) was not scalable`);
      return 0;
    }

    return scaleValue;
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
