/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPickedShapes } from './picked_shapes';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { ChartType } from '../../../chart_type';
import { isPickedCells } from '../../layout/types/viewmodel_types';

/**
 * Will call the onElementOut listener every time the following preconditions are met:
 * - the onElementOut listener is available
 * - the highlighted geometries list goes from a list of at least one object to an empty one
 * @internal
 */
export function createOnElementOutCaller(): (state: GlobalChartState) => void {
  let prevPickedShapes: number | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      selector = createCustomCachedSelector(
        [getHeatmapSpecSelector, getPickedShapes, getSettingsSpecSelector],
        (spec, pickedShapes, settings): void => {
          if (!spec) {
            return;
          }
          if (!settings.onElementOut) {
            return;
          }
          const nextPickedShapes = isPickedCells(pickedShapes) ? pickedShapes.length : 0;

          if (prevPickedShapes !== null && prevPickedShapes > 0 && nextPickedShapes === 0) {
            settings.onElementOut();
          }
          prevPickedShapes = nextPickedShapes;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
