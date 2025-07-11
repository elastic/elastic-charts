/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { canDisplayChartTitles } from './selectors/can_display_chart_titles';
import { getScreenReaderDataSelector } from './selectors/get_screen_reader_data';
import { createChartSelectorsFactory } from '../../../state/chart_selectors';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  getChartTypeDescription: () => 'Metric chart',
  getScreenReaderData: getScreenReaderDataSelector,
  isInitialized: () => InitStatus.Initialized,
  isChartEmpty: () => false,
  canDisplayChartTitles,
});
