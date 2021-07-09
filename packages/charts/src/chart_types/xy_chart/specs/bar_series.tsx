/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/constants';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
import { BarSeriesSpec, DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const defaultProps = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  seriesType: SeriesType.Bar,
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  hideInLegend: false,
  enableHistogramMode: false,
};

type SpecRequiredProps = Pick<BarSeriesSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<BarSeriesSpec, 'chartType' | 'specType' | 'seriesType' | 'id' | 'data'>>;

/** @public */
export const BarSeries: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    BarSeriesSpec,
    | 'seriesType'
    | 'groupId'
    | 'xScaleType'
    | 'yScaleType'
    | 'xAccessor'
    | 'yAccessors'
    | 'hideInLegend'
    | 'enableHistogramMode'
  >(defaultProps),
);
