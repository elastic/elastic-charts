/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_TOOLTIP_SNAP } from '../../../../specs/constants';
import { SettingsSpec, isTooltipProps } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';

/** @internal */
export const getTooltipSnapSelector = createCustomCachedSelector([getSettingsSpecSelector], getTooltipSnap);

function getTooltipSnap(settings: SettingsSpec): boolean {
  const { tooltip } = settings;
  return tooltip && isTooltipProps(tooltip) ? tooltip.snap ?? DEFAULT_TOOLTIP_SNAP : DEFAULT_TOOLTIP_SNAP;
}
