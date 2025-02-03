/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import { getPickedShapesLayerValues } from './picked_shapes';
import { getWordcloudSpecSelector } from './wordcloud_spec';
import { getOnElementOverSelector } from '../../../../common/event_handler_selectors';
import { LayerValue } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { ChartType } from '../../../chart_type';

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
    if (selector === null && state.chartType === ChartType.Wordcloud) {
      selector = createCustomCachedSelector(
        [getWordcloudSpecSelector, getPickedShapesLayerValues, getSettingsSpecSelector],
        getOnElementOverSelector(prev),
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
