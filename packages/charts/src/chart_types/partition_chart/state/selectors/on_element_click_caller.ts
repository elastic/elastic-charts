/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { getOnElementClickSelector } from '../../../../common/event_handler_selectors';
import { GlobalChartState, PointerStates } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getPartitionSpec } from './partition_spec';
import { getPickedShapesLayerValues } from './picked_shapes';

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
    if (selector === null && state.chartType === ChartType.Partition) {
      selector = createCustomCachedSelector(
        [getPartitionSpec, getLastClickSelector, getSettingsSpecSelector, getPickedShapesLayerValues],
        getOnElementClickSelector(prev),
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
