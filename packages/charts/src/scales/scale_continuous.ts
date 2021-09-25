/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bisectLeft } from 'd3-array';
import {
  ScaleContinuousNumeric,
  ScaleLinear,
  scaleLinear,
  scaleLog,
  ScaleLogarithmic,
  ScalePower,
  scaleSqrt,
  ScaleTime,
  scaleUtc,
} from 'd3-scale';
import { Required } from 'utility-types';

import { Scale, ScaleContinuousType } from '.';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { screenspaceMarkerScaleCompressor } from '../solvers/screenspace_marker_scale_compressor';
import { clamp, mergePartial } from '../utils/common';
import { getMomentWithTz } from '../utils/data/date_time';
import { ContinuousDomain, Range } from '../utils/domain';
import { LOG_MIN_ABS_DOMAIN, ScaleType } from './constants';
import { LogScaleOptions } from './types';

const SCALES = {
  [ScaleType.Linear]: scaleLinear,
  [ScaleType.Log]: scaleLog,
  [ScaleType.Sqrt]: scaleSqrt,
  [ScaleType.Time]: scaleUtc,
};

const defaultScaleOptions: ScaleOptions = {
  bandwidth: 0,
  minInterval: 0,
  timeZone: 'utc',
  totalBarsInCluster: 1,
  barsPadding: 0,
  constrainDomainPadding: true,
  domainPixelPadding: 0,
  desiredTickCount: 10,
  isSingleValueHistogram: false,
  integersOnly: false,
  logBase: 10,
  logMinLimit: NaN, // NaN preserves the replaced `undefined` semantics
};

const isUnitRange = ([r1, r2]: Range) => r1 === 0 && r2 === 1;

/**
 * Continuous scale
 * @internal
 */
export class ScaleContinuous implements Scale<number> {
  readonly bandwidth: number;

  readonly totalBarsInCluster: number;

  readonly bandwidthPadding: number;

  readonly minInterval: number;

  readonly step: number;

  readonly type: ScaleContinuousType;

  readonly domain: number[];

  readonly range: Range;

  readonly isInverted: boolean;

  readonly tickValues: number[];

  readonly timeZone: string;

  readonly barsPadding: number;

  readonly isSingleValueHistogram: boolean;

  private readonly d3Scale: D3Scale;

  constructor(
    { type = ScaleType.Linear, domain: inputDomain, range, nice = false }: ScaleData,
    options?: Partial<ScaleOptions>,
  ) {
    const scaleOptions: ScaleOptions = mergePartial(defaultScaleOptions, options, { mergeOptionalPartialValues: true });

    const min = inputDomain.reduce((p, n) => Math.min(p, n), Infinity);
    const max = inputDomain.reduce((p, n) => Math.max(p, n), -Infinity);
    const properLogScale = type === ScaleType.Log && min < max;
    const rawDomain = properLogScale ? limitLogScaleDomain([min, max], scaleOptions.logMinLimit) : inputDomain;
    const barsPadding = clamp(scaleOptions.barsPadding, 0, 1);
    const isNice = nice && type !== ScaleType.Time;
    const totalRange = Math.abs(range[1] - range[0]);
    const pixelPadFits = 0 < scaleOptions.domainPixelPadding && scaleOptions.domainPixelPadding * 2 < totalRange;
    const isPixelPadded = pixelPadFits && type !== ScaleType.Time && !isUnitRange(range);
    const minInterval = Math.abs(scaleOptions.minInterval);
    const bandwidth = scaleOptions.bandwidth * (1 - barsPadding);
    const bandwidthPadding = scaleOptions.bandwidth * barsPadding;

    // make and embellish the opaque scale object
    const d3Scale = SCALES[type]();
    d3Scale.domain(rawDomain);
    d3Scale.range(range);
    if (properLogScale) (d3Scale as ScaleLogarithmic<PrimitiveValue, number>).base(scaleOptions.logBase);
    if (isNice) (d3Scale as ScaleContinuousNumeric<PrimitiveValue, number>).nice(scaleOptions.desiredTickCount);

    // possibly niced domain
    const domain = isNice ? (d3Scale.domain() as number[]) : rawDomain;

    const newDomain = isPixelPadded
      ? getPixelPaddedDomain(
          totalRange,
          domain as [number, number],
          scaleOptions.domainPixelPadding,
          scaleOptions.constrainDomainPadding,
        )
      : domain;

    // tweak the domain and scale even further
    d3Scale.domain(newDomain); // only need to do this if isPixelPadded is true, but hey
    if (isPixelPadded && isNice)
      (d3Scale as ScaleContinuousNumeric<PrimitiveValue, number>).nice(scaleOptions.desiredTickCount);

    const finalDomain = isPixelPadded && isNice ? (d3Scale.domain() as number[]) : newDomain;

    // set the this props
    this.d3Scale = d3Scale; // this must be set before calling `getTicks`
    this.tickValues =
      // This case is for the xScale (minInterval is > 0) when we want to show bars (bandwidth > 0)
      // we want to avoid displaying inner ticks between bars in a bar chart when using linear x scale
      type === ScaleType.Time
        ? getTimeTicks(scaleOptions.desiredTickCount, scaleOptions.timeZone, finalDomain)
        : scaleOptions.minInterval <= 0 || scaleOptions.bandwidth <= 0
        ? (d3Scale as D3ScaleNonTime)
            .ticks(scaleOptions.desiredTickCount)
            .filter(scaleOptions.integersOnly ? Number.isInteger : () => true)
        : new Array(Math.floor((finalDomain[1] - finalDomain[0]) / minInterval) + 1)
            .fill(0)
            .map((_, i) => finalDomain[0] + i * minInterval);
    this.barsPadding = barsPadding;
    this.bandwidth = bandwidth;
    this.bandwidthPadding = bandwidthPadding;
    this.type = type;
    this.range = range;
    this.minInterval = minInterval;
    this.step = bandwidth + barsPadding + bandwidthPadding;
    this.timeZone = scaleOptions.timeZone;
    this.isInverted = domain[0] > domain[1];
    this.totalBarsInCluster = scaleOptions.totalBarsInCluster;
    this.isSingleValueHistogram = scaleOptions.isSingleValueHistogram;
    this.domain = finalDomain;
  }

  private getScaledValue(value?: PrimitiveValue): number | null {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    const result = this.d3Scale(value);
    return typeof result !== 'number' || Number.isNaN(result) ? null : result;
  }

  scale(value?: PrimitiveValue) {
    const scaledValue = this.getScaledValue(value);
    return scaledValue === null ? null : scaledValue + (this.bandwidthPadding / 2) * this.totalBarsInCluster;
  }

  pureScale(value?: PrimitiveValue) {
    return this.bandwidth === 0
      ? this.getScaledValue(value)
      : typeof value === 'number' && Number.isFinite(value)
      ? this.getScaledValue(value + this.minInterval / 2)
      : null;
  }

  ticks() {
    return this.tickValues;
  }

  invert(value: number): number {
    const invertedValue = this.d3Scale.invert(value);
    return this.type === ScaleType.Time
      ? getMomentWithTz(invertedValue, this.timeZone).valueOf()
      : Number(invertedValue);
  }

  invertWithStep(
    value: number,
    data: number[],
  ): {
    withinBandwidth: boolean;
    value: number;
  } {
    if (data.length === 0) {
      return { withinBandwidth: false, value: NaN };
    }
    const invertedValue = this.invert(value);
    const bisectValue = this.bandwidth === 0 ? invertedValue + this.minInterval / 2 : invertedValue;
    const leftIndex = bisectLeft(data, bisectValue);

    if (leftIndex === 0) {
      const withinBandwidth = invertedValue >= data[0];
      return {
        withinBandwidth,
        value:
          data[0] + (withinBandwidth ? 0 : -this.minInterval * Math.ceil((data[0] - invertedValue) / this.minInterval)),
      };
    }
    const currentValue = data[leftIndex - 1];
    // pure linear scale
    if (this.bandwidth === 0) {
      const nextValue = data[leftIndex];
      const nextDiff = Math.abs(nextValue - invertedValue);
      const prevDiff = Math.abs(invertedValue - currentValue);
      return {
        withinBandwidth: true,
        value: nextDiff <= prevDiff ? nextValue : currentValue,
      };
    }
    const withinBandwidth = invertedValue - currentValue <= this.minInterval;
    return {
      withinBandwidth,
      value:
        currentValue +
        (withinBandwidth ? 0 : this.minInterval * Math.floor((invertedValue - currentValue) / this.minInterval)),
    };
  }

  isSingleValue() {
    return this.isSingleValueHistogram || isDegenerateDomain(this.domain);
  }

  isValueInDomain(value: number) {
    return this.domain[0] <= value && value <= this.domain[1];
  }

  handleDomainPadding() {}
}

function getTimeTicks(desiredTickCount: number, timeZone: string, domain: number[]) {
  const startDomain = getMomentWithTz(domain[0], timeZone);
  const endDomain = getMomentWithTz(domain[1], timeZone);
  const offset = startDomain.utcOffset();
  const shiftedDomainMin = startDomain.add(offset, 'minutes').valueOf();
  const shiftedDomainMax = endDomain.add(offset, 'minutes').valueOf();
  const tzShiftedScale = scaleUtc().domain([shiftedDomainMin, shiftedDomainMax]);
  const rawTicks = tzShiftedScale.ticks(desiredTickCount);
  const timePerTick = (shiftedDomainMax - shiftedDomainMin) / rawTicks.length;
  const hasHourTicks = timePerTick < 1000 * 60 * 60 * 12;
  return rawTicks.map((d: Date) => {
    const currentDateTime = getMomentWithTz(d, timeZone);
    const currentOffset = hasHourTicks ? offset : currentDateTime.utcOffset();
    return currentDateTime.subtract(currentOffset, 'minutes').valueOf();
  });
}

function isDegenerateDomain(domain: unknown[]): boolean {
  return domain.every((v) => v === domain[0]);
}

/** @internal */
export function limitLogScaleDomain([min, max]: ContinuousDomain, logMinLimit: number) {
  // todo further simplify this
  const absLimit = Math.abs(logMinLimit);
  const fallback = absLimit || LOG_MIN_ABS_DOMAIN;
  if (absLimit > 0 && min > 0 && min < absLimit) return max > absLimit ? [absLimit, max] : [absLimit, absLimit];
  if (absLimit > 0 && max < 0 && max > -absLimit) return min < -absLimit ? [min, -absLimit] : [-absLimit, -absLimit];
  if (min === 0) return max > 0 ? [fallback, max] : max < 0 ? [-fallback, max] : [fallback, fallback];
  if (max === 0) return min > 0 ? [min, fallback] : min < 0 ? [min, -fallback] : [fallback, fallback];
  if (min < 0 && max > 0) return Math.abs(max) >= Math.abs(min) ? [fallback, max] : [min, -fallback];
  if (min > 0 && max < 0) return Math.abs(min) >= Math.abs(max) ? [min, fallback] : [-fallback, max];
  return [min, max];
}

function getPixelPaddedDomain(
  chartHeight: number,
  domain: [number, number],
  desiredPixelPadding: number,
  constrainDomainPadding?: boolean,
  intercept = 0,
) {
  const inverted = domain[1] < domain[0];
  const orderedDomain: [number, number] = inverted ? [domain[1], domain[0]] : domain;
  const { scaleMultiplier } = screenspaceMarkerScaleCompressor(
    orderedDomain,
    [2 * desiredPixelPadding, 2 * desiredPixelPadding],
    chartHeight,
  );
  const baselinePaddedDomainLo = orderedDomain[0] - desiredPixelPadding / scaleMultiplier;
  const baselinePaddedDomainHigh = orderedDomain[1] + desiredPixelPadding / scaleMultiplier;
  const crossBelow = constrainDomainPadding && baselinePaddedDomainLo < intercept && orderedDomain[0] >= intercept;
  const crossAbove = constrainDomainPadding && baselinePaddedDomainHigh > 0 && orderedDomain[1] <= 0;
  const paddedDomainLo = crossBelow
    ? intercept
    : crossAbove
    ? orderedDomain[0] -
      desiredPixelPadding /
        screenspaceMarkerScaleCompressor([orderedDomain[0], intercept], [2 * desiredPixelPadding, 0], chartHeight)
          .scaleMultiplier
    : baselinePaddedDomainLo;
  const paddedDomainHigh = crossBelow
    ? orderedDomain[1] +
      desiredPixelPadding /
        screenspaceMarkerScaleCompressor([intercept, orderedDomain[1]], [0, 2 * desiredPixelPadding], chartHeight)
          .scaleMultiplier
    : crossAbove
    ? intercept
    : baselinePaddedDomainHigh;

  return inverted ? [paddedDomainHigh, paddedDomainLo] : [paddedDomainLo, paddedDomainHigh];
}

/**
 * d3 scales excluding time scale
 */
type D3ScaleNonTime<R = PrimitiveValue, O = number> = ScaleLinear<R, O> | ScaleLogarithmic<R, O> | ScalePower<R, O>;

/**
 * All possible d3 scales
 */
type D3Scale<R = PrimitiveValue, O = number> = D3ScaleNonTime<R, O> | ScaleTime<R, O>;

interface ScaleData {
  /** The Type of continuous scale */
  type: ScaleContinuousType;
  /** The data input domain */
  domain: number[];
  /** The data output range */
  range: Range;
  nice?: boolean;
}

type ScaleOptions = Required<LogScaleOptions, 'logBase'> & {
  /**
   * The desired bandwidth for a linear band scale.
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
   * Pixel value to extend the domain. Applied __before__ nicing.
   *
   * Does not apply to time scales
   * @defaultValue 0
   */
  domainPixelPadding: number;
  /**
   * Constrains domain pixel padding to the zero baseline
   * Does not apply to time scales
   */
  constrainDomainPadding?: boolean;
  /**
   * The approximated number of ticks.
   * @defaultValue 10
   */
  desiredTickCount: number;
  /**
   * true if the scale was adjusted to fit one single value histogram
   */
  isSingleValueHistogram: boolean;
  /**
   * Show only integer values
   */
  integersOnly: boolean;
  /**
   * As log(0) = -Infinite, a log scale domain must be strictly-positive
   * or strictly-negative; the domain must not include or cross zero value.
   * We need to limit the domain scale to the right value on all possible cases.
   */
  logMinLimit: number;
};
