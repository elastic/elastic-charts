/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps, useRef } from 'react';

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
import { Cell } from '../layout/types/viewmodel_types';
import { X_SCALE_DEFAULT } from './scale_defaults';

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
export interface HeatmapSpec<D extends BaseDatum = Datum> extends Spec {
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

/**
 * Adds heatmap spec to chart specs
 * @alpha
 */
export const Heatmap = function <D extends BaseDatum = Datum>(
  props: SFProps<
    HeatmapSpec<D>,
    keyof typeof buildProps.current['overrides'],
    keyof typeof buildProps.current['defaults'],
    keyof typeof buildProps.current['optionals'],
    keyof typeof buildProps.current['requires']
  >,
) {
  const buildProps = useRef(
    // @ts-ignore - excessively deep types
    buildSFProps<HeatmapSpec<D>>()(
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
        xAccessor: (d) => (d as any)?.x,
        yAccessor: (d) => (d as any)?.y,
        timeZone: 'UTC',
        xAxisTitle: '',
        yAxisTitle: '',
        xAxisLabelName: 'X Value',
        xAxisLabelFormatter: String,
        yAxisLabelName: 'Y Value',
        yAxisLabelFormatter: String,
      },
    ),
  );
  const { defaults, overrides } = buildProps.current;
  useSpecFactory<HeatmapSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type HeatmapProps = ComponentProps<typeof Heatmap>;
