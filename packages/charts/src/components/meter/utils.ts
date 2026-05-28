/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';
import { scaleLinear } from 'd3-scale';

import type { MeterColorStop, MeterOrientation } from './meter';
import type { Color } from '../../common/colors';
import { clamp, LayoutDirection, sortNumbers } from '../../utils/common';
import type { ContinuousDomain } from '../../utils/domain';

interface NormalizedMeterColorStop {
  color: Color;
  position: number;
}

/** @internal */
export interface MeterGeometry {
  fillStart: number;
  fillEnd: number;
  fillSize: number;
  rawValuePosition: number;
  rawBaselinePosition: number;
  isBaselineInDomain: boolean;
}

/** @internal */
export interface MeterRevealWindow {
  scaleFactor: number;
  offset: number;
}

function getScalePositionFn(domain: ContinuousDomain) {
  const [domainStart, domainEnd] = sortNumbers(domain);

  if (domainStart === domainEnd) {
    return () => 50;
  }

  const scale = scaleLinear().domain([domainStart, domainEnd]).range([0, 100]);
  return (value: number) => scale(value);
}

/** @internal */
export function getMeterScalePosition(domain: ContinuousDomain, value: number) {
  return getScalePositionFn(domain)(value);
}

/** @internal */
export function getMeterGeometry(domain: ContinuousDomain, value: number, baseline = 0): MeterGeometry {
  const getScalePosition = getScalePositionFn(domain);
  const rawBaselinePosition = getScalePosition(baseline);
  const rawValuePosition = getScalePosition(value);
  const [fillStart, fillEnd] = sortNumbers([clamp(rawBaselinePosition, 0, 100), clamp(rawValuePosition, 0, 100)]);
  const [domainMin, domainMax] = sortNumbers(domain);

  return {
    fillStart,
    fillEnd,
    fillSize: fillEnd - fillStart,
    rawValuePosition,
    rawBaselinePosition,
    isBaselineInDomain: baseline >= domainMin && baseline <= domainMax,
  };
}

function dedupeStopsByPosition(stops: NormalizedMeterColorStop[]) {
  return stops.reduce<NormalizedMeterColorStop[]>((acc, stop) => {
    const last = acc.at(-1);

    if (last && last.position === stop.position) {
      acc[acc.length - 1] = stop;
    } else {
      acc.push(stop);
    }

    return acc;
  }, []);
}

function getNormalizedMeterColorStops(domain: ContinuousDomain, colorStops: MeterColorStop[]) {
  const getScalePosition = getScalePositionFn(domain);
  const normalizedStops = colorStops
    .map(({ color, stop }) => ({
      color,
      position: clamp(getScalePosition(stop), 0, 100),
    }))
    .sort((left, right) => left.position - right.position);

  return dedupeStopsByPosition(normalizedStops);
}

function getExtendedMeterColorStops(domain: ContinuousDomain, colorStops: MeterColorStop[]) {
  const normalizedStops = getNormalizedMeterColorStops(domain, colorStops);
  const first = normalizedStops[0];
  const last = normalizedStops.at(-1);

  if (!first || !last) {
    return [];
  }

  return [
    ...(first.position > 0 ? [{ color: first.color, position: 0 }] : []),
    ...normalizedStops,
    ...(last.position < 100 ? [{ color: last.color, position: 100 }] : []),
  ];
}

/** @internal */
export function getMeterSolidFillColor(
  domain: ContinuousDomain,
  colorStops: MeterColorStop[],
  value: number,
  fallbackColor: Color,
) {
  const normalizedStops = getNormalizedMeterColorStops(domain, colorStops);

  if (normalizedStops.length === 0) {
    return fallbackColor;
  }

  if (normalizedStops.length === 1) {
    return normalizedStops[0]!.color;
  }

  const position = clamp(getMeterScalePosition(domain, value), 0, 100);
  const scale = chroma
    .scale(normalizedStops.map(({ color }) => color))
    .mode('lab')
    .domain(normalizedStops.map(({ position: stopPosition }) => stopPosition));

  return scale(position).hex();
}

/** @internal */
export function getMeterGradientFill(
  domain: ContinuousDomain,
  colorStops: MeterColorStop[],
  orientation: MeterOrientation,
) {
  const extendedStops = getExtendedMeterColorStops(domain, colorStops);

  if (extendedStops.length === 0) {
    return undefined;
  }

  const direction = orientation === LayoutDirection.Vertical ? 'to top' : 'to right';
  return `linear-gradient(${direction}, ${extendedStops
    .map(({ color, position }) => `${color} ${position}%`)
    .join(', ')})`;
}

/** @internal */
export function getMeterRevealWindow(fillStart: number, fillSize: number): MeterRevealWindow | undefined {
  if (fillSize <= 0) {
    return undefined;
  }

  return {
    scaleFactor: 100 / fillSize,
    offset: (-fillStart / fillSize) * 100,
  };
}
