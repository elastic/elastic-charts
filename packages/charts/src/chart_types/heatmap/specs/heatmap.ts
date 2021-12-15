/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Predicate } from '../../../common/predicate';
import { ScaleType } from '../../../scales/constants';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { Accessor, AccessorFn } from '../../../utils/accessor';
import { ESCalendarInterval, ESFixedInterval } from '../../../utils/chrono/elasticsearch';
import { Datum } from '../../../utils/common';
import { Cell } from '../layout/types/viewmodel_types';
import { X_SCALE_DEFAULT } from './scale_defaults';

const defaultProps = {
  chartType: ChartType.Heatmap,
  specType: SpecType.Series,
  data: [],
  xAccessor: ({ x }: { x: string | number }) => x,
  yAccessor: ({ y }: { y: string | number }) => y,
  xScale: { type: X_SCALE_DEFAULT.type },
  valueAccessor: ({ value }: { value: string | number }) => value,
  valueFormatter: (value: number) => `${value}`,
  xSortPredicate: Predicate.AlphaAsc,
  ySortPredicate: Predicate.AlphaAsc,
  timeZone: 'UTC',
  xAxisLabelName: 'X Value',
  xAxisLabelFormatter: String,
  yAxisLabelName: 'Y Value',
  yAxisLabelFormatter: String,
};

/** @public */
export type HeatmapScaleType =
  | typeof ScaleType.Linear
  | typeof ScaleType.Quantile
  | typeof ScaleType.Quantize
  | typeof ScaleType.Threshold;

/** @alpha */
export type ColorBand = {
  start: number;
  end: number;
  color: Color;
  label?: string;
};

/** @alpha */
export interface HeatmapBandsColorScale {
  type: 'bands';
  bands: Array<ColorBand>;
  /** called on ColorBands without a provided label */
  labelFormatter?: (start: number, end: number) => string;
}

/** @public */
export type HeatmapBrushEvent = {
  cells: Cell[];
  x: (string | number)[];
  y: (string | number)[];
};
/** @public */
export interface TimeScale {
  type: typeof ScaleType.Time;
}

/** @public */
export interface RasterTimeScale extends TimeScale {
  interval: ESCalendarInterval | ESFixedInterval;
}

/** @public */
export interface LinearScale {
  type: typeof ScaleType.Linear;
}

/** @public */
export interface OrdinalScale {
  type: typeof ScaleType.Ordinal;
}

/** @alpha */
export interface HeatmapSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Heatmap;
  data: Datum[];
  colorScale: HeatmapBandsColorScale;
  xAccessor: Accessor | AccessorFn;
  yAccessor: Accessor | AccessorFn;
  valueAccessor: Accessor | AccessorFn;
  valueFormatter: (value: number) => string;
  xSortPredicate: Predicate;
  ySortPredicate: Predicate;
  xScale: RasterTimeScale | OrdinalScale | LinearScale;
  highlightedData?: { x: Array<string | number>; y: Array<string | number> };
  name?: string;
  timeZone: string;
  onBrushEnd?: (brushArea: HeatmapBrushEvent) => void;
  xAxisLabelName: string;
  xAxisLabelFormatter: (value: string | number) => string;
  yAxisLabelName: string;
  yAxisLabelFormatter: (value: string | number) => string;
}

type SpecRequiredProps = Pick<HeatmapSpec, 'id' | 'data' | 'colorScale'>;
type SpecOptionalProps = Partial<Omit<HeatmapSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

/** @alpha */
export const Heatmap: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    HeatmapSpec,
    | 'xAccessor'
    | 'yAccessor'
    | 'valueAccessor'
    | 'data'
    | 'ySortPredicate'
    | 'xSortPredicate'
    | 'valueFormatter'
    | 'xScale'
    | 'timeZone'
    | 'xAxisLabelName'
    | 'xAxisLabelFormatter'
    | 'yAxisLabelName'
    | 'yAxisLabelFormatter'
  >(defaultProps),
);
