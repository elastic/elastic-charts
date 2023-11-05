/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';
import { ScaleLinear } from 'd3-scale';
import { $Values } from 'utility-types';

import { BaseBoundsConfig, OpenClosedBoundsConfig } from './bounds';
import { combineColors } from '../../../common/color_calcs';
import { RGBATupleToString, colorToRgba } from '../../../common/color_library_wrappers';
import { Color } from '../../../common/colors';
import { isFiniteNumber, isNil, sortNumbers } from '../../../utils/common';
import { ContinuousDomain, GenericDomain } from '../../../utils/domain';

/**
 * @internal
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
/** @internal */
export type ColorBandValueType = $Values<typeof ColorBandValueType>;

/** @internal */
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

/** @internal */
export interface ColorBandStepConfig {
  /**
   * Distinct color classes to defined discrete color breakdown
   * Defaults to intervals between ticks
   *
   * See https://gka.github.io/chroma.js/#scale-classes
   */
  classes?: number | number[];
  colors: Color[];
}

/** @internal */
export type ColorBandComplexConfig = ColorBandConfig[];

/**
 * Defines the color of bullet chart bands
 * @public
 */
export type BulletColorConfig = Color[] | ColorBandStepConfig | ColorBandComplexConfig;

const getValueByTypeFn = ([min, max]: ContinuousDomain) => {
  const domainLength = max - min;
  const minOffset = domainLength / 100000; // TODO validate approach
  return (bandValue: ColorBandValue | number, openOffset: -1 | 0 | 1 = 0): number | null => {
    const openOffsetValue = openOffset * minOffset;
    if (typeof bandValue === 'number') return bandValue + openOffsetValue;
    const { type, value } = bandValue;
    if (type === 'scale') return value + openOffsetValue;
    if (type === 'percentage') return min + value * domainLength + openOffsetValue;
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

const getFullDomainTicks = ([min, max]: ContinuousDomain, ticks: number[]): number[] => {
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
  return fullTicks;
};

function getScaleInputs(
  baseDomain: ContinuousDomain,
  config: BulletColorConfig,
  fullTicks: number[],
  backgroundColor: Color,
): {
  domain: number[];
  colors: string[];
  classes?: number | number[];
} {
  if (!Array.isArray(config) || !isComplexConfig(config)) {
    const { colors, classes }: { colors: string[]; classes?: number | number[] } = !Array.isArray(config)
      ? config
      : {
          colors: config,
        };

    if (colors.length === 1) {
      // Adds second color
      const [color] = colors;
      // should always have color
      if (color) {
        const secondary = chroma(color).alpha(0.7).hex();
        const blendedSecondary = combineColors(colorToRgba(secondary), colorToRgba(backgroundColor));
        colors.push(RGBATupleToString(blendedSecondary));
      }
    }

    return {
      domain: baseDomain,
      colors,
      classes: classes ?? fullTicks,
    };
  }

  if (!isComplexConfig(config)) {
    return {
      domain: baseDomain,
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
  return boundedDomains.reduce<{
    domain: number[];
    colors: string[];
  }>(
    (acc, [min, max], i) => {
      const testMinValue = isFiniteNumber(min) ? min : isFiniteNumber(max) ? max : null;
      if (testMinValue === null || testMinValue < prevMax) return acc;
      const newMaxValue = isFiniteNumber(max) ? max : isFiniteNumber(min) ? min : null;
      if (newMaxValue === null) {
        // TODO remove this error
        throw new Error('newMaxValue is null?????');
      }
      prevMax = newMaxValue;

      const color = colors[i];

      if (!color) {
        // TODO remove this error
        throw new Error('color is undefined????????');
      }

      if (isFiniteNumber(min)) {
        acc.domain.push(min);
        acc.colors.push(color);
      }
      if (isFiniteNumber(max)) {
        acc.domain.push(max);
        acc.colors.push(color);
      }

      return acc;
    },
    {
      domain: [],
      colors: [],
    },
  );
}

/** @internal */
export function getColorScale(
  baseDomain: ContinuousDomain,
  config: BulletColorConfig,
  fullTicks: number[],
  backgroundColor: Color,
) {
  const { colors, domain, classes } = getScaleInputs(baseDomain, config, fullTicks, backgroundColor);
  const scale = chroma.scale(colors).mode('lab').domain(domain);

  if (classes) scale.classes(classes);

  return scale;
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
export function getColorBands(
  scale: ScaleLinear<number, number>,
  config: BulletColorConfig,
  ticks: number[],
  backgroundColor: Color,
): {
  scale: chroma.Scale<chroma.Color>;
  bands: ColorTick[];
} {
  const domain = scale.domain() as GenericDomain;
  const orderedDomain = sortNumbers(domain) as ContinuousDomain;
  const fullTicks = getFullDomainTicks(orderedDomain, ticks);
  const colorScale = getColorScale(orderedDomain, config, sortNumbers(fullTicks), backgroundColor);
  const scaledBandPositions = fullTicks.reduce<[pixelPosition: BandPositions, tick: number][]>((acc, start, i) => {
    const end = fullTicks[i + 1];
    if (end === undefined) return acc;
    const scaledStart = scale(start);
    const scaledEnd = scale(end);
    const size = Math.abs(scaledEnd - scaledStart);
    acc.push([
      { start: scaledStart, end: scaledEnd, size },
      // pegs color at start of band - maybe allow control of this later
      start + (end - start) / 2,
    ]);
    return acc;
  }, []);

  // TODO allow continuous gradients
  const bands = scaledBandPositions.reduce<ColorTick[]>((acc, [pxPosition, tick]) => {
    return [
      ...acc,
      {
        ...pxPosition,
        color: colorScale(tick).hex(),
      },
    ];
  }, []);

  return {
    scale: colorScale,
    bands,
  };
}
