/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { ChartType } from '../..';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
import { HistogramBarSeriesSpec, DEFAULT_GLOBAL_ID, SeriesType, BaseDatum } from '../utils/specs';

const buildProps = buildSFProps<HistogramBarSeriesSpec<unknown>>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    seriesType: SeriesType.Bar,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
    // xAccessor: 'x',
    // yAccessors: ['y'],
    hideInLegend: false,
    enableHistogramMode: true as const,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const HistogramBarSeries = function <Datum extends BaseDatum>(
  props: SFProps<
    HistogramBarSeriesSpec<Datum>,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<HistogramBarSeriesSpec<Datum>>({ ...defaults, ...props, ...overrides });
  return null;
};

/** @public */
export type HistogramBarSeriesProp = ComponentProps<typeof HistogramBarSeries>;
