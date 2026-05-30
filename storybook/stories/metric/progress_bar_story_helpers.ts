/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  euiPaletteColorBlind,
  euiPaletteComplementary,
  euiPaletteCool,
  euiPaletteForDarkBackground,
  euiPaletteForLightBackground,
  euiPaletteForStatus,
} from '@elastic/eui';

import type { MeterFill } from '@elastic/charts';
import { MeterFillStyle } from '@elastic/charts';

import { positivePalette, signedPalette } from '../components/meter/meter_story_helpers';

export const labelsGroup = 'Labels';
export const metricGroup = 'Metric';
export const progressBarGroup = 'Progress bar';
export const trendGroup = 'Trend';

export const progressBarSizeOptions = {
  Auto: 'auto',
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
} as const;

export type ProgressBarPaletteSelection = 'none' | `palette-${number}-${'solid' | 'gradient'}`;

export const progressBarPaletteOptions: Record<string, ProgressBarPaletteSelection> = {
  None: 'none',
  'Palette 1 (Solid)': 'palette-1-solid',
  'Palette 1 (Gradient)': 'palette-1-gradient',
  'Palette 2 (Solid)': 'palette-2-solid',
  'Palette 2 (Gradient)': 'palette-2-gradient',
  'Palette 3 (Solid)': 'palette-3-solid',
  'Palette 3 (Gradient)': 'palette-3-gradient',
  'Palette 4 (Solid)': 'palette-4-solid',
  'Palette 4 (Gradient)': 'palette-4-gradient',
  'Palette 5 (Solid)': 'palette-5-solid',
  'Palette 5 (Gradient)': 'palette-5-gradient',
  'Palette 6 (Solid)': 'palette-6-solid',
  'Palette 6 (Gradient)': 'palette-6-gradient',
};

interface ProgressBarPalettePreset {
  colors: string[];
  getStops: (domain: [number, number]) => number[];
}

function normalizeDomain(domain: [number, number]) {
  return domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
}

function getEvenlyDistributedStops(domain: [number, number], stopCount: number) {
  const [domainMin, domainMax] = normalizeDomain(domain);

  if (stopCount <= 1 || domainMin === domainMax) {
    return new Array(stopCount).fill(domainMin);
  }

  return new Array(stopCount).fill(0).map((_, index) => {
    return domainMin + ((domainMax - domainMin) * index) / (stopCount - 1);
  });
}

function getLensStops(domain: [number, number]) {
  const [domainMin, domainMax] = normalizeDomain(domain);

  if (domainMin < 0 && domainMax > 0) {
    return [domainMin, 0, domainMax];
  }

  const domainSpan = domainMax - domainMin;
  return [domainMin, domainMin + domainSpan * 0.6, domainMax];
}

function getProgressBarPalettePresets(isDarkTheme: boolean, domain: [number, number]): ProgressBarPalettePreset[] {
  const [domainMin, domainMax] = normalizeDomain(domain);
  const lensColors = (domainMin < 0 && domainMax > 0 ? signedPalette : positivePalette).map(({ color }) => color);

  return [
    {
      colors: lensColors,
      getStops: getLensStops,
    },
    {
      colors: euiPaletteColorBlind().slice(0, 3),
      getStops: (resolvedDomain) => getEvenlyDistributedStops(resolvedDomain, 3),
    },
    {
      colors: (isDarkTheme ? euiPaletteForDarkBackground() : euiPaletteForLightBackground()).slice(0, 3),
      getStops: (resolvedDomain) => getEvenlyDistributedStops(resolvedDomain, 3),
    },
    {
      colors: euiPaletteForStatus(3),
      getStops: (resolvedDomain) => getEvenlyDistributedStops(resolvedDomain, 3),
    },
    {
      colors: euiPaletteComplementary(3),
      getStops: (resolvedDomain) => getEvenlyDistributedStops(resolvedDomain, 3),
    },
    {
      colors: euiPaletteCool(3),
      getStops: (resolvedDomain) => getEvenlyDistributedStops(resolvedDomain, 3),
    },
  ];
}

export function getProgressBarFill(
  selection: ProgressBarPaletteSelection,
  domain: [number, number],
  isDarkTheme: boolean,
): MeterFill | undefined {
  if (selection === 'none') {
    return undefined;
  }

  const match = selection.match(/^palette-(\d+)-(solid|gradient)$/);

  if (!match) {
    return undefined;
  }

  const paletteIndex = Number(match[1]) - 1;
  const paletteStyle = match[2];
  const palettePreset = getProgressBarPalettePresets(isDarkTheme, domain)[paletteIndex];

  if (!palettePreset) {
    return undefined;
  }

  const stops = palettePreset.getStops(domain);

  return {
    type: 'palette',
    style: paletteStyle === 'solid' ? MeterFillStyle.Solid : MeterFillStyle.Gradient,
    colorStops: palettePreset.colors.map((paletteColor, index) => ({
      color: paletteColor,
      stop: stops[index] ?? stops.at(-1) ?? domain[0],
    })),
  };
}

export const defaultBulletValueLabels = {
  value: 'Value',
  target: 'Target',
} as const;
