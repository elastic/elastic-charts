/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export interface WordcloudScreenReaderData {
  // Wordcloud-specific data fields
  // Add specific data fields as needed
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector([], (): ChartSpecificScreenReaderData => {
  const summaryParts: string[] = [];

  // Add wordcloud-specific accessibility information
  // For now, wordcloud charts rely mainly on the chart type description

  return {
    data: {} as WordcloudScreenReaderData,
    summaryParts,
  };
});
