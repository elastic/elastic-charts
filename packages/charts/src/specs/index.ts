/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../chart_types/chart_type';

/** @public */
export interface Spec {
  /** unique Spec identifier */
  id: string;
  /** Chart type define the type of chart that use this spec */
  chartType: ChartType;
  /** The type of spec, can be series, axis, annotation, settings etc */
  specType: string;
}

export * from './brush_axis';
export * from './group_by';
export * from './small_multiples';
export * from './settings';
export * from './settings_types';
export * from './constants';
export * from './tooltip';
export * from '../chart_types/specs';
export * from './pointer_update_trigger';
export * from './spec_type';
export * from './default_settings_spec';
export * from './default_legend_config';
