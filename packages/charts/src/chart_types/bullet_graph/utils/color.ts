/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';
import { extent } from 'd3-array';
import { ScaleLinear } from 'd3-scale';
import { $Values, Required } from 'utility-types';

import { BaseBoundsConfig, OpenClosedBoundsConfig } from './bounds';
import { combineColors } from '../../../common/color_calcs';
import { RGBATupleToString, colorToRgba, getChromaColor } from '../../../common/color_library_wrappers';
import { ChromaColorScale, Color, Colors } from '../../../common/colors';
import { clamp, isFiniteNumber, isNil, isSorted, isWithinRange, sortNumbers } from '../../../utils/common';
import { ContinuousDomain, GenericDomain } from '../../../utils/domain';
import { Logger } from '../../../utils/logger';

/**
 * @public
 */
export const ColorBandValueType = Object.freeze({
  /**
   * Value in the scaled space
   */
  Scale: 'scale' as const,
  /**
   * Percentage of the scaled space as a ratio from `0` to `1`
   */
  Percentage: 'percentage' as const,
});
/** @public */
export type ColorBandValueType = $Values<typeof ColorBandValueType>;

/** @public */
export interface ColorBandValue {
  /**
   * Type of value
   *
   * @defaultValue `scale`
   */
  type: ColorBandValueType;
  value: number;
}

/** @public */
export type ColorBandConfig = OpenClosedBoundsConfig<number | ColorBandValue> & {
  /**
   * Color to be applied to band
   */
  color: Color;
};

/** @public */
export interface ColorBandSimpleConfig {
  /**
   * Distinct color steps to defined discrete color breakdown
   * Defaults to intervals between ticks
   *
   * Number - scales colors evenly n times, does not support continuous color blending (i.e. n \>\> 10)
   * Array of numbers - defines the color stop positions
   *
   * See https://gka.github.io/chroma.js/#scale-classes
   */
  steps?: number | number[];
  colors: Color[];
}

/** @public */
export type ColorBandComplexConfig = ColorBandConfig[];

/**
 * Defines the color of bullet chart bands
 * @public
 */
export type BulletColorConfig = Color[] | ColorBandSimpleConfig | ColorBandComplexConfig;

const getValueByTypeFn = ([min, max]: ContinuousDomain) => {
  const domainLength = max - min;
  const minOffset = domainLength / 100000; // TODO validate approach
  return (bandValue: ColorBandValue | number, openOffset: -1 | 0 | 1 = 0): number | null => {
    const openOffsetValue = openOffset * minOffset;
    if (typeof bandValue === 'number') return bandValue + openOffsetValue;
    const { type, value } = bandValue;
    if (type === 'scale') return value + openOffsetValue;
    if (type === 'percentage') return min + (value / 100) * domainLength + openOffsetValue;
    return null;
  };
};

const getBandValueFn = (domain: ContinuousDomain) => {
  const getValueByType = getValueByTypeFn(domain);
  return (bandValue?: number | ColorBandValue, openOffset?: -1 | 0 | 1): number | null => {
    if (isNil(bandValue)) return null;
    return getValueByType(bandValue, openOffset);
  };
};

const getDomainPairFn = (domain: ContinuousDomain) => {
  const getBandValue = getBandValueFn(domain);
  return (config: BaseBoundsConfig<number | ColorBandValue>): [start: number | null, end: number | null] => {
    return [
      getBandValue(config.gt, 1) ?? getBandValue(config.gte),
      getBandValue(config.lt, -1) ?? getBandValue(config.lte),
    ];
  };
};

const isComplexConfig = (config: BulletColorConfig): config is ColorBandComplexConfig =>
  Array.isArray(config) && typeof config[0] !== 'string';

const getColorBandsFromTicks = ([min, max]: ContinuousDomain, ticks: number[]): number[] => {
  const fullTicks = ticks.slice();
  const first = fullTicks.at(0)!;
  const last = fullTicks.at(-1)!;
  const minIndex = first > last ? -1 : 0;
  const maxIndex = first < last ? -1 : 0;
  if (fullTicks.at(minIndex) !== min) {
    if (minIndex === 0) fullTicks.unshift(min);
    else fullTicks.push(min);
  }
  if (fullTicks.at(maxIndex) !== max) {
    if (maxIndex === 0) fullTicks.unshift(max);
    else fullTicks.push(max);
  }
  return fullTicks.flatMap((n, i, { length }) => (i === 0 || i === length - 1 ? [n] : [n, n]));
};

interface ScaleInputs {
  colorBandDomain?: number[];
  colors: string[];
  steps?: number | number[];
}

function getScaleInputs(baseDomain: ContinuousDomain, config: BulletColorConfig, backgroundColor: Color): ScaleInputs {
  if (!Array.isArray(config) || !isComplexConfig(config)) {
    const { colors: rawColors, steps }: { colors: string[]; steps?: number | number[] } = !Array.isArray(config)
      ? config
      : {
          colors: config,
        };

    // TODO - fix thrown error for RGBA colors from storybook
    const colors = rawColors.map((c) => c.toLowerCase());
    if (colors.length === 1) {
      // Adds second color
      const [color] = colors;
      // should always have color
      if (color) {
        const secondary = getChromaColor(color).alpha(0.7).hex();
        const blendedSecondary = combineColors(colorToRgba(secondary), colorToRgba(backgroundColor));
        colors.push(RGBATupleToString(blendedSecondary));
      }
    }

    return {
      colors,
      steps,
    };
  }

  if (!isComplexConfig(config)) {
    return {
      colors: config,
    };
  }

  const getDomainPair = getDomainPairFn(baseDomain);
  const { colors, boundedDomains } = config.reduce<{
    boundedDomains: [number | null, number | null][];
    colors: string[];
  }>(
    (acc, colorConfig) => {
      if (typeof colorConfig === 'string') {
        acc.colors.push(colorConfig);
      } else {
        acc.colors.push(colorConfig.color);
        const domainPair = getDomainPair(colorConfig);
        acc.boundedDomains.push(domainPair);
      }

      return acc;
    },
    {
      boundedDomains: [],
      colors: [],
    },
  );

  let prevMax = -Infinity;
  return boundedDomains.reduce<Required<ScaleInputs, 'colorBandDomain'>>(
    (acc, [min, max], i) => {
      // TODO: Add better error handling around this logic, the complex config right now assumes the following:
      // - All ranges are ordered from min to max
      // - All ranges are compatible with each other such that there is no overlapping or excluded ranges
      // Ideally we validate the config and fix it the best we can based on what is provided, filling or clamping as needed
      const testMinValue = isFiniteNumber(min) ? min : isFiniteNumber(max) ? max : null;
      if (testMinValue === null || testMinValue < prevMax) {
        Logger.warn(`Error with ColorBandComplexConfig:

Ranges are incompatible with each other such that there is either overlapping or excluded range pairs`);
        return acc;
      }
      const newMaxValue = isFiniteNumber(max) ? max : isFiniteNumber(min) ? min : null;
      if (newMaxValue === null) return acc;

      prevMax = newMaxValue;
      const color = colors[i] ?? Colors.Transparent.keyword;

      if (isFiniteNumber(min)) {
        acc.colorBandDomain.push(min);
        acc.colors.push(color);
      }
      if (isFiniteNumber(max)) {
        acc.colorBandDomain.push(max);
        acc.colors.push(color);
      }

      return acc;
    },
    {
      colorBandDomain: [],
      colors: [],
    },
  );
}

/** @internal */
export function getColorScale(
  baseDomain: ContinuousDomain,
  config: BulletColorConfig,
  backgroundColor: Color,
  fallbackBandColor: Color,
): [colorScale: ChromaColorScale, scaleInputs: ScaleInputs] {
  const { colors, colorBandDomain, steps: userSteps } = getScaleInputs(baseDomain, config, backgroundColor);
  const scale = chroma
    .scale(colors)
    .mode('lab')
    .domain(colorBandDomain ?? baseDomain);
  let steps = userSteps;
  let scaleDomain = baseDomain;

  if (steps !== undefined) {
    if (Array.isArray(steps) && !isSorted(steps, { order: 'ascending' })) {
      Logger.warn(
        `Ignoring Bullet.colorBands.steps. Expected a sorted ascending array of numbers without duplicates.\n\n\tReceived:${JSON.stringify(steps)}`,
      );
      steps = undefined;
    } else if (typeof steps === 'number' && steps < 1) {
      Logger.warn(`Ignoring Bullet.colorBands.steps. Expected a positive number.\n\n\tReceived:${steps}`);
      steps = undefined;
    } else {
      if (Array.isArray(steps)) {
        const [min = NaN, max = NaN] = extent(steps);
        scaleDomain = [min, max];
      }
      scale.classes(steps);
    }
  }
  const isInDomain = isWithinRange(scaleDomain);

  return [(n) => (isInDomain(n) ? scale(n) : getChromaColor(fallbackBandColor)), { colors, colorBandDomain, steps }];
}

/** @internal */
export interface BandPositions {
  start: number;
  end: number;
  size: number;
}

/** @internal */
export type ColorTick = { color: Color } & BandPositions;

// TODO memoize for duplicate calls
/** @internal */
export function getColorScaleWithBands(
  scale: ScaleLinear<number, number>,
  config: BulletColorConfig,
  ticks: number[],
  backgroundColor: Color,
  fallbackBandColor: Color,
): {
  scale: ChromaColorScale;
  bands: ColorTick[];
} {
  const domain = scale.domain() as GenericDomain;
  const baseDomain = sortNumbers(domain) as ContinuousDomain;
  const [colorScale, colorScaleInputs] = getColorScale(baseDomain, config, backgroundColor, fallbackBandColor);

  return {
    scale: colorScale,
    bands: getColorBands(scale, colorScale, ticks, baseDomain, colorScaleInputs),
  };
}

function getColorBands(
  scale: ScaleLinear<number, number>,
  colorScale: ChromaColorScale,
  ticks: number[],
  baseDomain: ContinuousDomain,
  { colorBandDomain, steps }: ScaleInputs,
): ColorTick[] {
  const [min, max] = baseDomain;
  if (steps) {
    if (Array.isArray(steps)) {
      const bands: ColorTick[] = [];

      for (let i = 0; i < steps.length - 1; i++) {
        const start = steps[i]!;
        const end = steps[i + 1]!;
        const [scaledStart, scaledEnd] = sortNumbers([scale(clamp(start, min, max)), scale(clamp(end, min, max))]);

        bands.push({
          start: scaledStart,
          end: scaledEnd,
          size: Math.abs(scaledEnd - scaledStart),
          color: colorScale(start + Math.abs(end - start) / 2).hex(),
        });
      }

      return bands;
    }
    const domainDelta = max - min;
    const size = domainDelta / steps;

    return Array.from({ length: steps }, (_, i) => {
      const [start, end] = sortNumbers([scale(i * size + min), scale((i + 1) * size + min)]);

      return {
        start,
        end,
        color: colorScale((i + 0.5) * size + min).hex(),
        size: Math.abs(end - start),
      };
    });
  }

  const bandPositions = colorBandDomain ?? getColorBandsFromTicks(baseDomain, ticks);
  const scaledColorBands: ColorTick[] = [];

  for (let i = 0; i < bandPositions.length; i += 2) {
    const [start, end] = bandPositions.slice(i, i + 2);
    if (start === undefined || end === undefined) continue;

    const [scaledStart, scaledEnd] = sortNumbers([scale(clamp(start, min, max)), scale(clamp(end, min, max))]);
    const size = Math.abs(scaledEnd - scaledStart);
    const tick = clamp(start + (end - start) / 2, min, max); // pegs color at middle of band - maybe allow control of this later

    if (scaledStart === scaledEnd) continue;

    scaledColorBands.push({
      start: scaledStart,
      end: scaledEnd,
      size,
      color: colorScale(tick).hex(),
    });
  }

  return scaledColorBands;
}
