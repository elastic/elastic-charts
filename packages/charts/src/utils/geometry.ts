/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import type { Dimensions } from './dimensions';
import type { BarSeriesStyle, PointStyle, PointShape, LineSeriesStyle, AreaSeriesStyle } from './themes/theme';
import type { XYChartSeriesIdentifier } from '../chart_types/xy_chart/utils/series';
import type { LabelOverflowConstraint } from '../chart_types/xy_chart/utils/specs';
import type { Color } from '../common/colors';
import type { Pixels } from '../common/geometry';
import type { LegendItem } from '../common/legend';
import type { SeriesKey } from '../common/series_id';
import type { Fill, Stroke } from '../geoms/types';

/**
 * The accessor type
 * @public
 */
export const BandedAccessorType = Object.freeze({
  Y0: 'y0' as const,
  Y1: 'y1' as const,
});

/** @public */
export type BandedAccessorType = $Values<typeof BandedAccessorType>;

/** @public */
export interface GeometryValue {
  y: any;
  x: any;
  mark: number | null;
  accessor: BandedAccessorType;
  /**
   * The original datum used for this geometry
   */
  datum: any;
}

/** @internal */
export type IndexedGeometry = PointGeometry | BarGeometry;

/**
 * Array of **range** clippings [x1, x2] to be excluded during rendering
 *
 * Note: Must be scaled **range** values (i.e. pixel coordinates) **NOT** domain values
 * @internal
 */
export type ClippedRanges = [number, number][];

/** @internal */
export interface PointGeometry {
  seriesIdentifier: XYChartSeriesIdentifier;
  x: number;
  y: number;
  radius: number;
  color: Color;
  transform: {
    x: number;
    y: number;
  };
  value: GeometryValue;
  style: PointGeometryStyle;
  panel: Dimensions;
  isolated: boolean;
}
/** @internal */
export interface PointGeometryStyle {
  fill: Fill;
  stroke: Stroke;
  shape: PointShape;
}

/** @internal */
export interface PerPanel<T> {
  panel: Dimensions;
  value: T;
}

/** @internal */
export interface BarGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  transform: {
    x: number;
    y: number;
    rotation?: number;
  };
  color: Color;
  displayValue?: {
    fontScale: number;
    fontSize: number;
    text: any;
    width: number;
    height: number;
    overflowConstraints: Set<LabelOverflowConstraint>;
  };
  seriesIdentifier: XYChartSeriesIdentifier;
  value: GeometryValue;
  seriesStyle: BarSeriesStyle;
  panel: Dimensions;
}

/** @internal */
export interface LineGeometry {
  line: string;
  points: PointGeometry[];
  color: Color;
  transform: {
    x: number;
    y: number;
  };
  seriesIdentifier: XYChartSeriesIdentifier;
  style: LineSeriesStyle;
  /**
   * Ranges of `[x0, x1]` pairs to clip from series
   */
  clippedRanges: ClippedRanges;
  shouldClip: boolean;
  hasFit: boolean;
  minPointDistance: Pixels;
}

/** @internal */
export interface AreaGeometry {
  area: string;
  lines: string[];
  points: PointGeometry[];
  color: Color;
  transform: {
    x: number;
    y: number;
  };
  seriesIdentifier: XYChartSeriesIdentifier;
  style: AreaSeriesStyle;
  isStacked: boolean;
  /**
   * Ranges of `[x0, x1]` pairs to clip from series
   */
  clippedRanges: ClippedRanges;
  shouldClip: boolean;
  hasFit: boolean;
  minPointDistance: Pixels;
}

/** @internal */
export interface BubbleGeometry {
  points: PointGeometry[];
  color: Color;
  seriesIdentifier: XYChartSeriesIdentifier;
  seriesPointStyle: PointStyle;
}

/** @internal */
export function isPointGeometry(ig: IndexedGeometry): ig is PointGeometry {
  return ig.hasOwnProperty('radius');
}

/** @internal */
export function isBarGeometry(ig: IndexedGeometry): ig is BarGeometry {
  return ig.hasOwnProperty('width') && ig.hasOwnProperty('height');
}

/** @internal */
export type GeometryHighlightState = 'dimmed' | 'focused' | 'default';

/** @internal */
export function getGeometryHighlightState(key: SeriesKey, highlightedLegendItem?: LegendItem): GeometryHighlightState {
  return !highlightedLegendItem
    ? 'default'
    : highlightedLegendItem.seriesIdentifiers.some((si) => si.key === key)
      ? 'focused'
      : 'dimmed';
}

/** @internal */
export function isDimmed(state: GeometryHighlightState): state is 'dimmed' {
  return state === 'dimmed';
}
