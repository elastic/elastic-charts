/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

import { ChartType } from '../chart_types';

/** @public */
export const SpecType = Object.freeze({
  Series: 'series' as const,
  Axis: 'axis' as const,
  Annotation: 'annotation' as const,
  Settings: 'settings' as const,
  Tooltip: 'tooltip' as const,
  IndexOrder: 'index_order' as const,
  SmallMultiples: 'small_multiples' as const,
});
/** @public */
export type SpecType = $Values<typeof SpecType>;

/** @public */
export interface Spec {
  /** unique Spec identifier */
  id: string;
  /** Chart type define the type of chart that use this spec */
  chartType: ChartType;
  /** The type of spec, can be series, axis, annotation, settings etc */
  specType: SpecType;
}

/** @internal */
export interface SpecList {
  [specId: string]: Spec;
}
