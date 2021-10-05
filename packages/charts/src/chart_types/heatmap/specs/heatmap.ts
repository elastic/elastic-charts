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
import { SeriesScales, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { Accessor, AccessorFn } from '../../../utils/accessor';
import { Datum, RecursivePartial } from '../../../utils/common';
import { config } from '../layout/config/config';
import { Config } from '../layout/types/config_types';
import { X_SCALE_DEFAULT } from './scale_defaults';

const defaultProps = {
  chartType: ChartType.Heatmap,
  specType: SpecType.Series,
  data: [],
  xAccessor: ({ x }: { x: string | number }) => x,
  yAccessor: ({ y }: { y: string | number }) => y,
  xScaleType: X_SCALE_DEFAULT.type,
  valueAccessor: ({ value }: { value: string | number }) => value,
  valueFormatter: (value: number) => `${value}`,
  xSortPredicate: Predicate.AlphaAsc,
  ySortPredicate: Predicate.AlphaAsc,
  config,
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
  xScaleType: SeriesScales['xScaleType'];
  config: RecursivePartial<Config>;
  highlightedData?: { x: Array<string | number>; y: Array<string | number> };
  name?: string;
}

/** @alpha */
export const Heatmap: React.FunctionComponent<
  Pick<HeatmapSpec, 'id' | 'data' | 'colorScale'> & Partial<Omit<HeatmapSpec, 'chartType' | 'specType' | 'id' | 'data'>>
> = getConnect()(
  specComponentFactory<
    HeatmapSpec,
    | 'xAccessor'
    | 'yAccessor'
    | 'valueAccessor'
    | 'data'
    | 'ySortPredicate'
    | 'xSortPredicate'
    | 'valueFormatter'
    | 'config'
    | 'xScaleType'
  >(defaultProps),
);
