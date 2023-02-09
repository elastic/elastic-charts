/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { X_SCALE_DEFAULT } from './scale_defaults';
import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Predicate } from '../../../common/predicate';
import { ScaleType } from '../../../scales/constants';
import { BaseDatum, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
import { Accessor, AccessorFn } from '../../../utils/accessor';
import { ESCalendarInterval, ESFixedInterval } from '../../../utils/chrono/elasticsearch';
import { Datum, LabelAccessor, stripUndefined, ValueFormatter } from '../../../utils/common';
import { Prettify } from '../../../utils/types';
import { Cell } from '../layout/types/viewmodel_types';

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

interface RasterTimeScaleInt extends TimeScale {
  interval: ESCalendarInterval | ESFixedInterval;
}

/** @public */
export type RasterTimeScale = Prettify<RasterTimeScaleInt>;

/** @public */
export interface LinearScale {
  type: typeof ScaleType.Linear;
}

/** @public */
export interface OrdinalScale {
  type: typeof ScaleType.Ordinal;
}

/** @internal */
interface HeatmapSpecInternal<D extends BaseDatum = Datum> extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Heatmap;
  data: D[];
  colorScale: HeatmapBandsColorScale;
  xAccessor: Accessor<D> | AccessorFn<D>;
  yAccessor: Accessor<D> | AccessorFn<D>;
  valueAccessor: Accessor<never> | AccessorFn;
  valueFormatter: ValueFormatter;
  xSortPredicate: Predicate;
  ySortPredicate: Predicate;
  xScale: RasterTimeScale | OrdinalScale | LinearScale;
  highlightedData?: { x: Array<string | number>; y: Array<string | number> };
  name?: string;
  timeZone: string;
  onBrushEnd?: (brushArea: HeatmapBrushEvent) => void;
  xAxisTitle: string;
  xAxisLabelName: string;
  xAxisLabelFormatter: LabelAccessor<string | number>;
  yAxisTitle: string;
  yAxisLabelName: string;
  yAxisLabelFormatter: LabelAccessor<string | number>;
}
/** @public */
export type HeatmapSpec = Prettify<HeatmapSpecInternal>;

/** @internal */
export const buildProps = buildSFProps<HeatmapSpecInternal>()(
  {
    chartType: ChartType.Heatmap,
    specType: SpecType.Series,
  },
  {
    data: [],
    valueAccessor: ({ value }) => value,
    xScale: { type: X_SCALE_DEFAULT.type },
    valueFormatter: (value) => `${value}`,
    xSortPredicate: Predicate.AlphaAsc,
    ySortPredicate: Predicate.AlphaAsc,
    // TODO: make accessors required
    xAccessor: (d) => d?.x,
    yAccessor: (d) => d?.y,
    timeZone: 'UTC',
    xAxisTitle: '',
    yAxisTitle: '',
    xAxisLabelName: 'X Value',
    xAxisLabelFormatter: String,
    yAxisLabelName: 'Y Value',
    yAxisLabelFormatter: String,
  },
);

/**
 * Adds heatmap spec to chart specs
 * @alpha
 */
export const Heatmap = function <D extends BaseDatum = Datum>(
  props: SFProps<
    HeatmapSpecInternal<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<HeatmapSpecInternal<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type HeatmapProps = Prettify<ComponentProps<typeof Heatmap>>;
