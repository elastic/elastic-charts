/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from '../../state/chart_state';
import { getScreenReaderSummarySelector, type ScreenReaderSummaryData } from '../../state/selectors/get_screen_reader_summary';

/** @internal */
export const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryData => {
  return getScreenReaderSummarySelector(state);
};
