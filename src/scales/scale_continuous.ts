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
 * under the License.
 */

import { bisectLeft } from 'd3-array';
import {
  scaleLinear,
  scaleLog,
  scaleSqrt,
  scaleUtc,
  ScaleLinear,
  ScaleLogarithmic,
  ScalePower,
  ScaleTime,
} from 'd3-scale';

import { ScaleContinuousType, Scale } from '.';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { maxValueWithUpperLimit, mergePartial } from '../utils/commons';
import { getMomentWithTz } from '../utils/data/date_time';
import { ScaleType } from './constants';

/**
 * d3 scales excluding time scale
 */
type D3ScaleNonTime<R = PrimitiveValue, O = number> = ScaleLinear<R, O> | ScaleLogarithmic<R, O> | ScalePower<R, O>;

/**
 * All possible d3 scales
 */
type D3Scale<R = PrimitiveValue, O = number> = D3ScaleNonTime<R, O> | ScaleTime<R, O>;

const SCALES = {
  [ScaleType.Linear]: scaleLinear,
  [ScaleType.Log]: scaleLog,
  [ScaleType.Sqrt]: scaleSqrt,
  [ScaleType.Time]: scaleUtc,
};

/**
 * As log(0) = -Infinite, a log scale domain must be strictly-positive
 * or strictly-negative; the domain must not include or cross zero value.
 * We need to limit the domain scale to the right value on all possible cases.
 * @param domain the domain to limit
 * @internal
 */
export function limitLogScaleDomain(domain: any[]) {
  if (domain[0] === 0) {
    if (domain[1] > 0) {
      return [1, domain[1]];
    }
    if (domain[1] < 0) {
      return [-1, domain[1]];
    }
    return [1, 1];
  }
  if (domain[1] === 0) {
    if (domain[0] > 0) {
      return [domain[0], 1];
    }
    if (domain[0] < 0) {
      return [domain[0], -1];
    }
    return [1, 1];
  }
  if (domain[0] < 0 && domain[1] > 0) {
    const isD0Min = Math.abs(domain[1]) - Math.abs(domain[0]) >= 0;
    if (isD0Min) {
      return [1, domain[1]];
    }
    return [domain[0], -1];
  }
  if (domain[0] > 0 && domain[1] < 0) {
    const isD0Max = Math.abs(domain[0]) - Math.abs(domain[1]) >= 0;
    if (isD0Max) {
      return [domain[0], 1];
    }
    return [-1, domain[1]];
  }
  return domain;
}
interface ScaleData {
  /** The Type of continuous scale */
  type: ScaleContinuousType;
  /** The data input domain */
  domain: any[];
  /** The data output range */
  range: [number, number];
}

interface ScaleOptions {
  /**
   * The desidered bandwidth for a linear band scale.
   * @defaultValue 0
   */
  bandwidth: number;
  /**
   * The min interval computed on the XDomain. Not available for yDomains.
   * @defaultValue 0
   */
  minInterval: number;
  /**
   * A time zone identifier. Can be any IANA zone supported by he host environment,
   * or a fixed-offset name of the form 'utc+3', or the strings 'local' or 'utc'.
   * @defaultValue `utc`
   */
  timeZone: string;
  /**
   * The number of bars in the cluster. Used to correctly compute scales when
   * using padding between bars.
   * @defaultValue 1
   */
  totalBarsInCluster: number;
  /**
   * The proportion of the range that is reserved for blank space between bands
   * A number between 0 and 1.
   * @defaultValue 0
   */
  barsPadding: number;
  /**
   * The approximated number of ticks.
   * @defaultValue 10
   */
  ticks: number;
  /** true if the scale was adjusted to fit one single value histogram */
  isSingleValueHistogram: boolean;
  /** Show only integer values */
  integersOnly?: boolean;
}
const defaultScaleOptions: ScaleOptions = {
  bandwidth: 0,
  minInterval: 0,
  timeZone: 'utc',
  totalBarsInCluster: 1,
  barsPadding: 0,
  ticks: 10,
  isSingleValueHistogram: false,
  integersOnly: false,
};

/**
 * Continuous scale
 * @internal
 */
export class ScaleContinuous implements Scale {
  readonly bandwidth: number;
  readonly totalBarsInCluster: number;
  readonly bandwidthPadding: number;
  readonly minInterval: number;
  readonly step: number;
  readonly type: ScaleContinuousType;
  readonly domain: any[];
  readonly range: number[];
  readonly isInverted: boolean;
  readonly tickValues: number[];
  readonly timeZone: string;
  readonly barsPadding: number;
  readonly isSingleValueHistogram: boolean;
  private readonly d3Scale: D3Scale;

  constructor(scaleData: ScaleData, options?: Partial<ScaleOptions>) {
    const { type, domain, range } = scaleData;
    const {
      bandwidth,
      minInterval,
      timeZone,
      totalBarsInCluster,
      barsPadding,
      ticks,
      isSingleValueHistogram,
      integersOnly,
    } = mergePartial(defaultScaleOptions, options);

    this.d3Scale = SCALES[type]();
    const cleanDomain = type === ScaleType.Log ? limitLogScaleDomain(domain) : domain;
    this.domain = cleanDomain;
    this.d3Scale.domain(cleanDomain);

    const safeBarPadding = maxValueWithUpperLimit(barsPadding, 0, 1);
    this.barsPadding = safeBarPadding;
    this.bandwidth = bandwidth * (1 - safeBarPadding);
    this.bandwidthPadding = bandwidth * safeBarPadding;
    this.d3Scale.range(range);
    this.step = this.bandwidth + this.barsPadding + this.bandwidthPadding;
    this.type = type;
    this.range = range;
    this.minInterval = minInterval;
    this.isInverted = this.domain[0] > this.domain[1];
    this.timeZone = timeZone;
    this.totalBarsInCluster = totalBarsInCluster;
    this.isSingleValueHistogram = isSingleValueHistogram;
    if (type === ScaleType.Time) {
      const startDomain = getMomentWithTz(this.domain[0], this.timeZone);
      const endDomain = getMomentWithTz(this.domain[1], this.timeZone);
      const offset = startDomain.utcOffset();
      const shiftedDomainMin = startDomain.add(offset, 'minutes').valueOf();
      const shiftedDomainMax = endDomain.add(offset, 'minutes').valueOf();
      const tzShiftedScale = scaleUtc().domain([shiftedDomainMin, shiftedDomainMax]);

      const rawTicks = tzShiftedScale.ticks(ticks);
      const timePerTick = (shiftedDomainMax - shiftedDomainMin) / rawTicks.length;
      const hasHourTicks = timePerTick < 1000 * 60 * 60 * 12;

      this.tickValues = rawTicks.map((d: Date) => {
        const currentDateTime = getMomentWithTz(d, this.timeZone);
        const currentOffset = hasHourTicks ? offset : currentDateTime.utcOffset();
        return currentDateTime.subtract(currentOffset, 'minutes').valueOf();
      });
    } else {
      // This case is for the xScale (minInterval is > 0) when we want to show bars (bandwidth > 0)
      // We want to avoid displaying inner ticks between bars in a bar chart when using linear x scale
      if (minInterval > 0 && bandwidth > 0) {
        const intervalCount = Math.floor((this.domain[1] - this.domain[0]) / this.minInterval);
        this.tickValues = new Array(intervalCount + 1).fill(0).map((_, i) => this.domain[0] + i * this.minInterval);
      } else {
        this.tickValues = this.getTicks(ticks, integersOnly!);
      }
    }
  }

  private getScaledValue(value?: PrimitiveValue): number | null {
    if (typeof value !== 'number' || isNaN(value)) {
      return null;
    }

    const scaledValue = this.d3Scale(value);

    return isNaN(scaledValue) ? null : scaledValue;
  }

  getTicks(ticks: number, integersOnly: boolean) {
    // TODO: cleanup types for ticks btw time and non-time scales
    // This is forcing a return type of number[] but is really (number|Date)[]
    return integersOnly
      ? (this.d3Scale as D3ScaleNonTime)
          .ticks(ticks)
          .filter((item: number) => typeof item === 'number' && item % 1 === 0)
          .map((item: number) => parseInt(item.toFixed(0), 10))
      : (this.d3Scale as D3ScaleNonTime).ticks(ticks);
  }

  scaleOrThrow(value?: PrimitiveValue): number {
    const scaleValue = this.scale(value);

    if (scaleValue === null) {
      throw new Error(`Unable to scale value: ${scaleValue})`);
    }

    return scaleValue;
  }

  scale(value?: PrimitiveValue) {
    const scaledValue = this.getScaledValue(value);

    return scaledValue === null ? null : scaledValue + (this.bandwidthPadding / 2) * this.totalBarsInCluster;
  }

  pureScale(value?: PrimitiveValue) {
    if (this.bandwidth === 0) {
      return this.getScaledValue(value);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return null;
    }

    return this.getScaledValue(value + this.minInterval / 2);
  }

  ticks() {
    return this.tickValues;
  }

  invert(value: number): number {
    let invertedValue = this.d3Scale.invert(value);
    if (this.type === ScaleType.Time) {
      invertedValue = getMomentWithTz(invertedValue, this.timeZone).valueOf();
    }

    return invertedValue as number;
  }

  invertWithStep(
    value: number,
    data: number[],
  ): {
    value: number;
    withinBandwidth: boolean;
  } | null {
    if (data.length === 0) {
      return null;
    }
    const invertedValue = this.invert(value);
    const bisectValue = this.bandwidth === 0 ? invertedValue + this.minInterval / 2 : invertedValue;
    const leftIndex = bisectLeft(data, bisectValue);

    if (leftIndex === 0) {
      if (invertedValue < data[0]) {
        return {
          value: data[0] - this.minInterval * Math.ceil((data[0] - invertedValue) / this.minInterval),
          withinBandwidth: false,
        };
      }
      return {
        value: data[0],
        withinBandwidth: true,
      };
    }
    const currentValue = data[leftIndex - 1];
    // pure linear scale
    if (this.minInterval === 0) {
      const nextValue = data[leftIndex];
      const nextDiff = Math.abs(nextValue - invertedValue);
      const prevDiff = Math.abs(invertedValue - currentValue);
      return {
        value: nextDiff <= prevDiff ? nextValue : currentValue,
        withinBandwidth: true,
      };
    }
    if (invertedValue - currentValue <= this.minInterval) {
      return {
        value: currentValue,
        withinBandwidth: true,
      };
    }
    return {
      value: currentValue + this.minInterval * Math.floor((invertedValue - currentValue) / this.minInterval),
      withinBandwidth: false,
    };
  }

  isSingleValue() {
    if (this.isSingleValueHistogram) {
      return true;
    }
    if (this.domain.length < 2) {
      return true;
    }

    const min = this.domain[0];
    const max = this.domain[this.domain.length - 1];
    return max === min;
  }

  isValueInDomain(value: number) {
    return value >= this.domain[0] && value <= this.domain[1];
  }
}
