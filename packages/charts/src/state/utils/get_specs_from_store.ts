/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { Spec } from '../../specs';
import { SpecList } from '../spec_list';

/**
 * Returns all matching specs
 * @internal
 */
export function getSpecsFromStore<U extends Spec>(specs: SpecList, chartType: ChartType, specType: string): U[] {
  return Object.values(specs).filter((spec) => spec.chartType === chartType && spec.specType === specType) as U[];
}
