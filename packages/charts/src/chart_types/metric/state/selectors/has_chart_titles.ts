/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from './../../../../state/global_chart_state';
import { canDisplayChartTitles } from './can_display_chart_titles';
import { createCustomCachedSelector } from '../../../../state/create_selector';

const getChartTitleOrDescription = ({ title, description }: GlobalChartState) => Boolean(title || description);

/** @internal */
export const hasChartTitles = createCustomCachedSelector(
  [canDisplayChartTitles, getChartTitleOrDescription],
  (displayTitles, hasTitles): boolean => {
    return displayTitles && hasTitles;
  },
);
