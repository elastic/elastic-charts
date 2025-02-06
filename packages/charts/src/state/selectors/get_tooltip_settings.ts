/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 're-reselect';

import { getInternalIsTooltipVisibleSelector } from './get_internal_is_tooltip_visible';
import { getSettingsSpecSelector } from './get_settings_spec';
import { getTooltipSpecSelector } from './get_tooltip_spec';
import type { TooltipProps } from '../../specs';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const getChartId: Selector<GlobalChartState, string> = ({ chartId }) => chartId;

/** @internal */
const getTooltipSettingsSingleton = createCustomCachedSelector([getChartId], (): Record<string, never> => ({}));

/** @internal */
export const getTooltipSettings = createCustomCachedSelector(
  [getTooltipSettingsSingleton, getTooltipSpecSelector, getSettingsSpecSelector, getInternalIsTooltipVisibleSelector],
  (settingsBase, tooltip, { externalPointerEvents }, { isExternal }): TooltipProps => {
    if (!isExternal) return tooltip;

    return Object.assign(settingsBase, {
      ...tooltip,
      ...externalPointerEvents.tooltip,
    });
  },
);
