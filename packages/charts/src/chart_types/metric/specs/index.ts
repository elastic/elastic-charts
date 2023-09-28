/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps, ComponentType, ReactElement } from 'react';
import { $Values } from 'utility-types';

import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { specComponentFactory } from '../../../state/spec_factory';
import { LayoutDirection } from '../../../utils/common';

/** @alpha */
export type MetricBase = {
  color: Color;
  title?: string;
  valueColor?: Color;
  valueIcon?: ComponentType<{ width: number; height: number; color: Color; verticalAlign: 'middle' }>;
  subtitle?: string;
  extra?: ReactElement;
  icon?: ComponentType<{ width: number; height: number; color: Color }>;
};

/** @alpha */
export type MetricWText = MetricBase & {
  value: string;
};

/** @alpha */
export type MetricWNumber = MetricBase & {
  value: number;
  target?: number;
  valueFormatter: (d: number) => string;
};

/** @alpha */
export type MetricWProgress = MetricWNumber & {
  domainMax: number;
  progressBarDirection: LayoutDirection;
};

/** @alpha */
export const MetricTrendShape = Object.freeze({
  Bars: 'bars' as const,
  Area: 'area' as const,
});

/** @alpha */
export type MetricTrendShape = $Values<typeof MetricTrendShape>;

/** @alpha */
export type MetricWTrend = (MetricWNumber | MetricWText) & {
  trend: { x: number; y: number }[];
  trendShape: MetricTrendShape;
  trendA11yTitle?: string;
  trendA11yDescription?: string;
};

/** @alpha */
export type MetricDatum = MetricWNumber | MetricWText | MetricWProgress | MetricWTrend;

/** @alpha */
export interface MetricSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Metric;
  data: (MetricDatum | undefined)[][];
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
export function isMetricWNumber(datum: MetricDatum): datum is MetricWNumber {
  return typeof datum.value === 'number' && datum.hasOwnProperty('valueFormatter');
}
/** @internal */
export function isMetricWText(datum: MetricDatum): datum is MetricWNumber {
  return typeof datum.value === 'string';
}

/** @internal */
export function isMetricWProgress(datum: MetricDatum): datum is MetricWProgress {
  return isMetricWNumber(datum) && datum.hasOwnProperty('domainMax') && !datum.hasOwnProperty('trend');
}

/** @internal */
export function isMetricWTrend(datum: MetricDatum): datum is MetricWTrend {
  return (
    (isMetricWNumber(datum) || isMetricWText(datum)) &&
    datum.hasOwnProperty('trend') &&
    !datum.hasOwnProperty('domainMax')
  );
}
