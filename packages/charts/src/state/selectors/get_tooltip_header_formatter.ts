/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SettingsSpec, TooltipValueFormatter, isTooltipProps } from '../../specs/settings';
import { createCustomCachedSelector } from '../create_selector';
import { getSettingsSpecSelector } from './get_settings_specs';

/** @internal */
export const getTooltipHeaderFormatterSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  getTooltipHeaderFormatter,
);

function getTooltipHeaderFormatter(settings: SettingsSpec): TooltipValueFormatter | undefined {
  const { tooltip } = settings;
  if (tooltip && isTooltipProps(tooltip)) {
    return tooltip.headerFormatter;
  }
}
