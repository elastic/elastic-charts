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
import { BubbleSeriesSpec, DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const defaultProps = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  seriesType: SeriesType.Bubble,
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  hideInLegend: false,
};
type SpecRequiredProps = Pick<BubbleSeriesSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<BubbleSeriesSpec, 'chartType' | 'specType' | 'seriesType' | 'id' | 'data'>>;

/**
 * @alpha
 *
 * This series type uses a spatial index that is incompatible with other series types. This will
 * be fixed once an update has been made to the tooltip design.
 *
 * When used alone with other `BubbleSeries` the spatial index will be used. However when
 * mixed with other series types, the linear index will be used. This will affect highlighting
 * of points when using the `markSizeAccessor`.
 */
export const BubbleSeries: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    BubbleSeriesSpec,
    'seriesType' | 'groupId' | 'xScaleType' | 'yScaleType' | 'xAccessor' | 'yAccessors' | 'hideInLegend'
  >(defaultProps),
);
