/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types/chart_type';
import { Spec } from '../../specs/spec';
import { SpecType } from '../../specs/spec_type';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils/get_specs_from_store';

/** @internal */
export const getSpecsByType = <S extends Spec>(chartType: ChartType, specType: SpecType) =>
  createCustomCachedSelector([(state: GlobalChartState) => state.specs], (specs): S[] => {
    return getSpecsFromStore<S>(specs, chartType, specType);
  });
