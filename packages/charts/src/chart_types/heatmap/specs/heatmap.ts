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
import { BaseDatum, SeriesScales, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
import { Accessor, AccessorFn } from '../../../utils/accessor';
import { RecursivePartial } from '../../../utils/common';
import { config } from '../layout/config/config';
import { Config } from '../layout/types/config_types';
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

/** @alpha */
export interface HeatmapSpec<D extends BaseDatum> extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Heatmap;
  data: D[];
  colorScale: HeatmapBandsColorScale;
  xAccessor: keyof D | AccessorFn<D>;
  yAccessor: keyof D | AccessorFn<D>;
  valueAccessor: Accessor | AccessorFn;
  valueFormatter: (value: number) => string;
  xSortPredicate: Predicate;
  ySortPredicate: Predicate;
  xScaleType: SeriesScales['xScaleType'];
  config: RecursivePartial<Config>;
  highlightedData?: { x: Array<string | number>; y: Array<string | number> };
  name?: string;
}

/**
 * Adds heatmap spec to chart specs
 * @alpha
 */
export const Heatmap = function <Datum extends BaseDatum>(
  props: SFProps<
    HeatmapSpec<Datum>,
    keyof typeof buildProps.current['overrides'],
    keyof typeof buildProps.current['defaults'],
    keyof typeof buildProps.current['optionals'],
    keyof typeof buildProps.current['requires']
  >,
) {
  const buildProps = useRef(
    buildSFProps<HeatmapSpec<Datum>>()(
      {
        chartType: ChartType.Heatmap,
        specType: SpecType.Series,
      },
      {
        data: [],
        // xAccessor: ({ x }: { x: string | number }) => x,
        // yAccessor: ({ y }: { y: string | number }) => y,
        valueAccessor: ({ value }) => value,
        xScaleType: X_SCALE_DEFAULT.type,
        valueFormatter: (value) => `${value}`,
        xSortPredicate: Predicate.AlphaAsc,
        ySortPredicate: Predicate.AlphaAsc,
        config,
      },
    ),
  );
  const { defaults, overrides } = buildProps.current;
  useSpecFactory<HeatmapSpec<Datum>>({ ...defaults, ...props, ...overrides });
  return null;
};

/** @public */
export type HeatmapProps = ComponentProps<typeof Heatmap>;
