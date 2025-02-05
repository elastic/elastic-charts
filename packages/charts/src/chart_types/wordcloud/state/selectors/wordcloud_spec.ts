/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SpecType } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecFromStore } from '../../../../state/utils/get_spec_from_store';
import { ChartType } from '../../../chart_type';
import { WordcloudSpec } from '../../specs';

/** @internal */
export function getWordcloudSpecSelector(state: GlobalChartState): WordcloudSpec | null {
  return getSpecFromStore<WordcloudSpec, false>(state.specs, ChartType.Wordcloud, SpecType.Series, false);
}
