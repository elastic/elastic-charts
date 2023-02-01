/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import { getSpecOrNull } from './goal_spec';
import { getPickedShapesLayerValues } from './picked_shapes';
import { ChartType } from '../../..';
import { getOnElementOverSelector } from '../../../../common/event_handler_selectors';
import { LayerValue } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/**
 * Will call the onElementOver listener every time the following preconditions are met:
 * - the onElementOver listener is available
 * - we have a new set of highlighted geometries on our state
 * @internal
 */
export function createOnElementOverCaller(): (state: GlobalChartState) => void {
  const prev: { pickedShapes: LayerValue[][] } = { pickedShapes: [] };
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Goal) {
      selector = createCustomCachedSelector(
        [getSpecOrNull, getPickedShapesLayerValues, getSettingsSpecSelector],
        getOnElementOverSelector(prev),
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
