/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LocaleOptions } from './render/annotations/time_extent';
import { getValidatedTimeZone, getZoneFromSpecs } from '../../../utils/time_zone';
import { cachedZonedDateTimeFrom, TimeProp } from '../../xy_chart/axes/timeslip/chrono/cached_chrono';
import { RasterConfig, TimeFormatter } from '../../xy_chart/axes/timeslip/continuous_time_rasters';
import { MINIMUM_TICK_PIXEL_DISTANCE } from '../../xy_chart/axes/timeslip/multilayer_ticks';

/** @internal */
export type AxisType = 'continuousTime' | 'continuousNumeric';

/** @internal */
export const HORIZONTAL_AXIS: AxisType = 'continuousTime';

const initialDarkMode = false;

/** @internal */
export const drawCartesianBox = false;

// these are hand tweaked constants that fulfill various design constraints, let's discuss before changing them
const lineThicknessSteps = [/*0,*/ 0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
const lumaSteps = [/*255,*/ 192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const smallFontSize = 12;

/** @internal */
export const timeZone = getValidatedTimeZone(getZoneFromSpecs([])); // should eventually come from settings
type RGBObject = { r: number; g: number; b: number };

interface TimeslipTheme {
  defaultFontColor: string;
  subduedFontColor: string;
  offHourFontColor: string;
  weekendFontColor: string;
  backgroundColor: RGBObject;
  lumaSteps: number[];
}

const themeLight: TimeslipTheme = {
  defaultFontColor: 'black',
  subduedFontColor: '#393939',
  offHourFontColor: 'black',
  weekendFontColor: 'darkred',
  backgroundColor: { r: 255, g: 255, b: 255 },
  lumaSteps,
};

const themeDark: TimeslipTheme = {
  defaultFontColor: 'white',
  subduedFontColor: 'darkgrey',
  offHourFontColor: 'white',
  weekendFontColor: 'indianred',
  backgroundColor: { r: 0, g: 0, b: 0 },
  lumaSteps: lumaSteps.map((l) => 255 - l),
};

type CompactDisplay = 'short' | 'long'; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

/** @internal */
export interface TimeslipConfig extends TimeslipTheme, RasterConfig {
  darkMode: boolean;
  sparse: false;
  implicit: false;
  maxLabelRowCount: 1 | 2 | 3;
  a11y: { contrast: 'low' | 'medium' | 'high' };
  numUnit: CompactDisplay | 'none';
  barChroma: RGBObject;
  barFillAlpha: number;
  lineThicknessSteps: number[];
  domainFrom: number;
  domainTo: number;
  smallFontSize: number;
  cssFontShorthand: string;
  monospacedFontShorthand: string;
  rowPixelPitch: number;
  horizontalPixelOffset: number;
  verticalPixelOffset: number;
  clipLeft: boolean;
  clipRight: boolean;
  yTickOverhang: number;
  yTickGap: number;
}

/** @internal */
export const rasterConfig: RasterConfig = {
  minimumTickPixelDistance: MINIMUM_TICK_PIXEL_DISTANCE,
  locale: 'en-US',
};

/** @internal */
export const config: TimeslipConfig = {
  darkMode: initialDarkMode,
  ...(initialDarkMode ? themeDark : themeLight),
  ...rasterConfig,
  sparse: false,
  implicit: false,
  maxLabelRowCount: 2, // can be 1, 2, 3
  a11y: {
    contrast: 'medium',
  },
  numUnit: 'short',
  barChroma: { r: 96, g: 146, b: 192 },
  barFillAlpha: 0.3,
  lineThicknessSteps,
  domainFrom: cachedZonedDateTimeFrom({ timeZone, year: 2002, month: 1, day: 1 })[TimeProp.EpochSeconds],
  domainTo: cachedZonedDateTimeFrom({ timeZone, year: 2022, month: 1, day: 1 })[TimeProp.EpochSeconds],
  smallFontSize,
  cssFontShorthand: `normal normal 100 ${smallFontSize}px Inter, Helvetica, Arial, sans-serif`,
  monospacedFontShorthand: `normal normal 100 ${smallFontSize}px "Roboto Mono", Consolas, Menlo, Courier, monospace`,
  rowPixelPitch: 16,
  horizontalPixelOffset: 4,
  verticalPixelOffset: 6,
  clipLeft: true,
  clipRight: true,
  yTickOverhang: 8,
  yTickGap: 8,
};

/**
 * constants for Y
 * @internal
 */
export const ZERO_Y_BASE = true;
/** @internal */
export const horizontalCartesianAreaPad: [number, number] = [0.04, 0.04];
/** @internal */
export const verticalCartesianAreaPad: [number, number] = [0.3, 0.12];
/** @internal */
export const localeOptions: LocaleOptions = {
  hour12: false,
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const defaultLabelFormatter = new Intl.DateTimeFormat(config.locale, {
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone,
});
/**
 * todo this may need an update with locale change
 * @internal
 */
export const defaultLabelFormat: TimeFormatter = (value) => defaultLabelFormatter.format(value);

const defaultMinorTickLabelFormatter = new Intl.DateTimeFormat(config.locale, {
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone,
});
/**
 * todo this may need an update with locale change
 * @internal
 */
export const defaultMinorTickLabelFormat: TimeFormatter = (value) => defaultMinorTickLabelFormatter.format(value);

/** @internal */
export const fadeOutPixelWidth = 12; // todo add to config

/** @internal */
export const chartTopFontSize = config.smallFontSize + 2; // todo move to config
const background = config.backgroundColor;

/** @internal */
export const backgroundFillStyle = `rgba(${background.r},${background.g},${background.b},1)`;

/** @internal */
export const wheelPanVelocity = 1;

/** @internal */
export const wheelZoomVelocity = 2; // zoom is usually centered, so with 1 the apparent speed is half, compared to wheelPan

/** @internal */
export const keyZoomVelocityDivisor = 2; // 1 means, on each up/down keypress, double/halve the visible time domain

/** @internal */
export const keyPanVelocityDivisor = 10; // 1 means, on each left/right keypress, move the whole of current visible time domain
