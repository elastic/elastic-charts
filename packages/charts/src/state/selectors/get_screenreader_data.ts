/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getA11ySettingsSelector } from './get_accessibility_config';
import { getInternalChartTypeDescSelector } from './get_internal_chart_type_desc';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export interface ScreenReaderItem {
  /** The label for this part of the summary */
  label: string;
  /** Optional ID for referencing this part */
  id?: string;
  /** The value for this part of the summary */
  value: string;
}

/** @internal */
export const EMPTY_SCREEN_READER_ITEMS = [];

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getA11ySettingsSelector, getInternalChartTypeDescSelector],
  (a11ySettings, chartTypeDescription): ScreenReaderItem[] => {
    return chartTypeDescription
      ? [{ label: 'Chart type', id: a11ySettings.defaultSummaryId, value: chartTypeDescription }]
      : EMPTY_SCREEN_READER_ITEMS;
  },
);
