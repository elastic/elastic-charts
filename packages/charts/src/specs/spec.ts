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
