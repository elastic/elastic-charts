/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ComponentProps } from 'react';

import { X_SCALE_DEFAULT } from './scale_defaults';
import { ChartType } from '../..';
import type { Color } from '../../../common/colors';
import type { SmallMultiplesDatum } from '../../../common/panel_utils';
import { Predicate } from '../../../common/predicate';
import { ScaleType } from '../../../scales/constants';
import type { BaseDatum } from '../../../specs';
import type { Spec } from '../../../specs/spec_type';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { SFProps } from '../../../state/spec_factory';
import { buildSFProps, useSpecFactory } from '../../../state/spec_factory';
import type { Accessor, AccessorFn } from '../../../utils/accessor';
import type { ESCalendarInterval, ESFixedInterval } from '../../../utils/chrono/elasticsearch';
import type { Datum, LabelAccessor, ValueFormatter } from '../../../utils/common';
import { stripUndefined } from '../../../utils/common';
import type { DomainRange } from '../../xy_chart/utils/specs';
import type { Cell } from '../layout/types/viewmodel_types';

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
export type HeatmapBrushEvent = HeatmapHighlightedData & {
  cells: Cell[];
};
/** @public */
export interface TimeScale {
  type: typeof ScaleType.Time;
}

/** @internal */
export type RasterDomain = Partial<Pick<DomainRange, 'min' | 'max'>>;

/** @public */
export interface RasterTimeScale extends TimeScale {
  interval: ESCalendarInterval | ESFixedInterval;
  domain?: RasterDomain;
}

/**
 * A numeric scale of uniform bins, e.g. the buckets of a histogram aggregation.
 * The data values are expected to be the start of their bin.
 * @public
 */
export interface RasterLinearScale {
  type: typeof ScaleType.Linear;
  interval: number;
  domain?: RasterDomain;
}

/**
 * @public
 * @deprecated rendered as an {@link OrdinalScale} preserving the data order.
 * Use `OrdinalScale`, or `RasterLinearScale` for numeric bins.
 */
export interface LinearScale {
  type: typeof ScaleType.Linear;
}

/** @public */
export interface OrdinalScale {
  type: typeof ScaleType.Ordinal;
  /**
   * The order of the categories. `Predicate.DataIndex` preserves the data order.
   * Falls back to the axis sort predicate of the spec.
   */
  sort?: Predicate;
}

/**
 * @public
 */
export interface HeatmapHighlightedData extends SmallMultiplesDatum {
  x: Array<string | number>;
  y: Array<string | number>;
}

/** @alpha */
export interface HeatmapSpec<D extends BaseDatum = Datum> extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Heatmap;
  data: D[];
  colorScale: HeatmapBandsColorScale;
  xAccessor: Accessor<D> | AccessorFn<D>;
  yAccessor: Accessor<D> | AccessorFn<D>;
  valueAccessor: Accessor<never> | AccessorFn;
  valueFormatter: ValueFormatter;
  /** @deprecated use `xScale.sort` instead */
  xSortPredicate: Predicate;
  /** @deprecated use `yScale.sort` instead */
  ySortPredicate: Predicate;
  xScale: RasterTimeScale | RasterLinearScale | OrdinalScale | LinearScale;
  yScale: OrdinalScale;
  highlightedData?: HeatmapHighlightedData;
  name?: string;
  timeZone: string;
  xAxisTitle: string;
  xAxisLabelName: string;
  xAxisLabelFormatter: LabelAccessor<string | number>;
  yAxisTitle: string;
  yAxisLabelName: string;
  yAxisLabelFormatter: LabelAccessor<string | number>;
}

/** @public */
export const heatmapBuildProps = buildSFProps<HeatmapSpec>()(
  {
    chartType: ChartType.Heatmap,
    specType: SpecType.Series,
  },
  {
    data: [],
    valueAccessor: ({ value }) => value,
    xScale: { type: X_SCALE_DEFAULT.type },
    yScale: { type: ScaleType.Ordinal },
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
    HeatmapSpec<D>,
    keyof (typeof heatmapBuildProps)['overrides'],
    keyof (typeof heatmapBuildProps)['defaults'],
    keyof (typeof heatmapBuildProps)['optionals'],
    keyof (typeof heatmapBuildProps)['requires']
  >,
) {
  const { defaults, overrides } = heatmapBuildProps;
  useSpecFactory<HeatmapSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type HeatmapProps = ComponentProps<typeof Heatmap>;
