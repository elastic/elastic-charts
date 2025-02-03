/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SpecList } from './spec_list';
import { ChartType } from '../chart_types/chart_type';
import { keepDistinct } from '../utils/keep_distinct';
import { Logger } from '../utils/logger';

/** @internal */
export function chartTypeFromSpecs(specs: SpecList): ChartType | null {
  const nonGlobalTypes = Object.values(specs)
    .map((s) => s.chartType)
    .filter((type) => type !== ChartType.Global)
    .filter(keepDistinct);
  if (!nonGlobalTypes[0]) {
    Logger.warn(`${nonGlobalTypes.length === 0 ? 'Zero' : 'Multiple'} chart types in the same configuration`);
    return null;
  }
  return nonGlobalTypes[0];
}
