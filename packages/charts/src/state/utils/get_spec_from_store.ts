/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types/chart_type';
import { Spec } from '../../specs/spec';
import { SpecList } from '../spec_list';

/**
 * Returns first matching spec
 * @internal
 * TODO: Make these generator types automatic
 */
export function getSpecFromStore<U extends Spec, R extends boolean, RR = R extends true ? never : null>(
  specs: SpecList,
  chartType: ChartType,
  specType: string,
  required: R,
): U | RR {
  const spec = Object.values(specs).find((spec) => spec.chartType === chartType && spec.specType === specType) as U;

  if (!spec && required) throw new Error(`Unable to find spec [${chartType} = ${specType}]`);

  return spec ?? null;
}
