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
import { AreaSeriesSpec, HistogramModeAlignments, DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const defaultProps = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  seriesType: SeriesType.Area,
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Linear,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  hideInLegend: false,
  histogramModeAlignment: HistogramModeAlignments.Center,
};

type SpecRequiredProps = Pick<AreaSeriesSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<AreaSeriesSpec, 'chartType' | 'specType' | 'seriesType' | 'id' | 'data'>>;

/** @public */
export const AreaSeries: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    AreaSeriesSpec,
    | 'seriesType'
    | 'groupId'
    | 'xScaleType'
    | 'yScaleType'
    | 'xAccessor'
    | 'yAccessors'
    | 'hideInLegend'
    | 'histogramModeAlignment'
  >(defaultProps),
);
