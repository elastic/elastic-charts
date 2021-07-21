/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { WordcloudSpec } from '../../specs';

/** @internal */
export function getSpecOrNull(state: GlobalChartState): WordcloudSpec | null {
  const specs = getSpecsFromStore<WordcloudSpec>(state.specs, ChartType.Wordcloud, SpecType.Series);
  return specs.length > 0 ? specs[0] : null;
}
