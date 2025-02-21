/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Selector } from '@reduxjs/toolkit';

import { getPickedShapesLayerValues } from './picked_shapes';
import { getWordcloudSpecSelector } from './wordcloud_spec';
import { ChartType } from '../../..';
import { getOnElementClickSelector } from '../../../../common/event_handler_selectors';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { PointerStates } from '../../../../state/pointer_states';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnElementClickCaller(): (state: GlobalChartState) => void {
  const prev: { click: PointerStates['lastClick'] } = { click: null };
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Wordcloud) {
      selector = createCustomCachedSelector(
        [getWordcloudSpecSelector, getLastClickSelector, getSettingsSpecSelector, getPickedShapesLayerValues],
        getOnElementClickSelector(prev),
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
