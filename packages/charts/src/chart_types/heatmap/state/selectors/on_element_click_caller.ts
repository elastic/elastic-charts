/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Selector } from '@reduxjs/toolkit';

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPickedShapes } from './picked_shapes';
import { ChartType } from '../../..';
import type { SeriesIdentifier } from '../../../../common/series_id';
import type { SettingsSpec } from '../../../../specs';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { PointerState } from '../../../../state/pointer_states';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isClicking } from '../../../../state/utils/is_clicking';
import type { Cell } from '../../layout/types/viewmodel_types';
import { isPickedCells } from '../../layout/types/viewmodel_types';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnElementClickCaller(): (state: GlobalChartState) => void {
  let prevClick: PointerState | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      selector = createCustomCachedSelector(
        [getHeatmapSpecSelector, getLastClickSelector, getSettingsSpecSelector, getPickedShapes],
        (spec, lastClick: PointerState | null, settings: SettingsSpec, pickedShapes): void => {
          if (!spec) {
            return;
          }
          if (!settings.onElementClick) {
            return;
          }
          if (!isPickedCells(pickedShapes)) {
            return;
          }
          const nextPickedShapesLength = pickedShapes.length;
          if (nextPickedShapesLength > 0 && isClicking(prevClick, lastClick)) {
            const elements = pickedShapes.map<[Cell, SeriesIdentifier]>((value) => [
              value,
              {
                specId: spec.id,
                key: `spec{${spec.id}}`,
              },
            ]);
            settings.onElementClick(elements);
          }
          prevClick = lastClick;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
