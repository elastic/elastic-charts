/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps, ComponentType, ReactElement, ReactNode } from 'react';
import { $Values } from 'utility-types';

import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { specComponentFactory } from '../../../state/spec_factory';
import { LayoutDirection, ValueFormatter } from '../../../utils/common';
import { GenericDomain } from '../../../utils/domain';
import { BulletValueLabels } from '../../bullet_graph/spec';
import { ChartType } from '../..';

/** @alpha */
export type MetricBase = {
  color: Color;
  /**
   * Overrides background color from `Theme.background` and `Theme.metric.emptyBackground`
   */
  background?: Color;
  title?: string;
  valueColor?: Color;
  valueIcon?: ComponentType<{ width: number; height: number; color: Color; verticalAlign: 'middle' }>;
  subtitle?: string;
  extra?: ReactElement;
  icon?: ComponentType<{ width: number; height: number; color: Color }>;
  body?: ReactNode;
};

/** @alpha */
export type MetricWText = MetricBase & {
  value: string;
  valueFormatter?: never;
};

/** @alpha */
export type MetricWNumberArrayValues = MetricBase & {
  value: Array<number>;
  valueFormatter: ValueFormatter<number>;
};

/** @alpha */
export type MetricWStringArrayValues = MetricBase & {
  value: Array<string>;
  valueFormatter?: never;
};

/** @alpha */
export type MetricWNumber = MetricBase & {
  value: number;
  target?: number;
  valueFormatter: ValueFormatter;
  /**
   * Used for header display only, defaults to `valueFormatter`
   */
  targetFormatter?: ValueFormatter;
};

/** @alpha */
export type MetricWProgress = MetricWNumber & {
  domainMax: number;
  progressBarDirection: LayoutDirection;
};

/**
 * Type used internally by bullet
 * TODO - discuss usage of this externally
 *
 * @internal
 */
export type BulletMetricWProgress = Omit<MetricWProgress, 'domainMax'> & {
  domain: GenericDomain;
  niceDomain?: boolean;
  valueLabels: Omit<BulletValueLabels, 'active'>;
};

/** @alpha */
export const MetricTrendShape = Object.freeze({
  Bars: 'bars' as const,
  Area: 'area' as const,
});

/** @alpha */
export type MetricTrendShape = $Values<typeof MetricTrendShape>;

/** @alpha */
export type MetricWTrend = (MetricWNumber | MetricWText | MetricWNumberArrayValues | MetricWStringArrayValues) & {
  trend: { x: number; y: number }[];
  trendShape: MetricTrendShape;
  trendA11yTitle?: string;
  trendA11yDescription?: string;
};

/** @alpha */
export type MetricDatum =
  | MetricWNumber
  | MetricWText
  | MetricWNumberArrayValues
  | MetricWStringArrayValues
  | MetricWProgress
  | MetricWTrend;

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

// TODO: Remove this for overall spec prop consistency as this does not refer to the spec props but the metric component props that are defined by the spec
/**
 * @deprecated in favor of MetricProps
 * @alpha
 */
export type MetricSpecProps = ComponentProps<typeof Metric>;

/**@alpha */
export type MetricProps = ComponentProps<typeof Metric>;

/** @internal */
export function isBulletMetric(datum: MetricDatum): datum is BulletMetricWProgress {
  return Array.isArray((datum as BulletMetricWProgress).domain);
}

/** @internal */
export function isMetricWNumberArrayValues(datum: MetricDatum): datum is MetricWNumberArrayValues {
  return Array.isArray(datum.value) && typeof datum.value[0] === 'number' && datum.hasOwnProperty('valueFormatter');
}

/** @internal */
export function isMetricWStringArrayValues(datum: MetricDatum): datum is MetricWStringArrayValues {
  return Array.isArray(datum.value) && typeof datum.value[0] === 'string';
}

/** @internal */
export function isMetricWNumber(datum: MetricDatum): datum is MetricWNumber {
  return 'value' in datum && typeof datum.value === 'number' && datum.hasOwnProperty('valueFormatter');
}

/** @internal */
export function isMetricWText(datum: MetricDatum): datum is MetricWNumber {
  return 'value' in datum && typeof datum.value === 'string';
}

/** @internal */
export function isMetricWProgress(datum: MetricDatum): datum is MetricWProgress {
  return (
    (isMetricWNumber(datum) && datum.hasOwnProperty('domainMax') && !datum.hasOwnProperty('trend')) ||
    isBulletMetric(datum)
  );
}

/** @internal */
export function isMetricWTrend(datum: MetricDatum): datum is MetricWTrend {
  return (
    (isMetricWNumber(datum) ||
      isMetricWText(datum) ||
      isMetricWNumberArrayValues(datum) ||
      isMetricWStringArrayValues(datum)) &&
    datum.hasOwnProperty('trend') &&
    !datum.hasOwnProperty('domainMax')
  );
}
