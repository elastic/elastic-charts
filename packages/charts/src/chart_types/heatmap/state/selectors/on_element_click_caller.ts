/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { SeriesIdentifier } from '../../../../common/series_id';
import { SettingsSpec } from '../../../../specs';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isClicking } from '../../../../state/utils';
import { Cell, isPickedCells } from '../../layout/types/viewmodel_types';
import { getSpecOrNull } from './heatmap_spec';
import { getPickedShapes } from './picked_shapes';

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
        [getSpecOrNull, getLastClickSelector, getSettingsSpecSelector, getPickedShapes],
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
          if (nextPickedShapesLength > 0 && isClicking(prevClick, lastClick) && settings && settings.onElementClick) {
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
