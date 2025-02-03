/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import { getPartitionSpec } from './partition_spec';
import { getPickedShapesLayerValues } from './picked_shapes';
import { ChartType } from '../../../chart_type';
import { getOnElementOutSelector } from '../../../../common/event_handler_selectors';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/**
 * Will call the onElementOut listener every time the following preconditions are met:
 * - the onElementOut listener is available
 * - the highlighted geometries list goes from a list of at least one object to an empty one
 * @internal
 */
export function createOnElementOutCaller(): (state: GlobalChartState) => void {
  const prev: { pickedShapes: number | null } = { pickedShapes: null };
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Partition) {
      selector = createCustomCachedSelector(
        [getPartitionSpec, getPickedShapesLayerValues, getSettingsSpecSelector],
        getOnElementOutSelector(prev),
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
