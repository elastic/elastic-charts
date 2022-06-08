/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps, ReactElement } from 'react';

import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { specComponentFactory } from '../../../state/spec_factory';
import { LayoutDirection } from '../../../utils/common';

/** @alpha */
export type MetricBase = {
  value: number;
  valueFormatter: (d: number) => string;
  color: Color;
  title?: string;
  subtitle?: string;
  extra?: ReactElement;
};

/** @alpha */
export type MetricWProgress = MetricBase & {
  domain: { min: number; max: number };
  progressBarDirection?: LayoutDirection;
};

/** @alpha */
export type MetricWTrend = MetricBase & {
  trend: { x: number; y: number }[];
  trendShape?: 'area' | 'bar';
  trendA11yTitle?: string;
  trendA11yDescription?: string;
};

/** @alpha */
export interface MetricSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Metric;
  data: (MetricBase | MetricWProgress | MetricWTrend | undefined)[][];
}

/** @alpha */
export const Metric = specComponentFactory<MetricSpec>()(
  {
    chartType: ChartType.Metric,
    specType: SpecType.Series,
  },
  {
    data: [],
  },
);

/** @alpha */
export type MetricSpecProps = ComponentProps<typeof Metric>;

/** @internal */
export function isMetricWProgress(datum: MetricBase | MetricWProgress | MetricWTrend): datum is MetricWProgress {
  return datum.hasOwnProperty('domain') && !datum.hasOwnProperty('trend');
}

/** @internal */
export function isMetricWTrend(datum: MetricBase | MetricWProgress | MetricWTrend): datum is MetricWTrend {
  return datum.hasOwnProperty('trend') && !datum.hasOwnProperty('domain');
}
