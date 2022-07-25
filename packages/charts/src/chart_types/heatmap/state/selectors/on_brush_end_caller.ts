/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { OutputSelector } from 'reselect';

import { ChartType } from '../../..';
import { HeatmapBrushEvent, SettingsSpec } from '../../../../specs/settings';
import { DragState, GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { DragCheckProps, hasDragged } from '../../../../utils/events';
import { HeatmapSpec } from '../../specs';
import { getPickedCells } from './get_picked_cells';
import { getSpecOrNull } from './heatmap_spec';
import { isBrushEndProvided } from './is_brush_available';

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 * @internal
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let prevProps: DragCheckProps | null = null;
  let selector: OutputSelector<
    GlobalChartState,
    void,
    (res1: DragState | null, res2: HeatmapSpec | null, res3: SettingsSpec, res4: HeatmapBrushEvent | null) => void
  > | null = null;

  return (state) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      if (!isBrushEndProvided(state)) {
        selector = null;
        prevProps = null;
        return;
      }
      selector = createCustomCachedSelector(
        [getLastDragSelector, getSpecOrNull, getSettingsSpecSelector, getPickedCells],
        (lastDrag, spec, { onBrushEnd }, pickedCells): void => {
          const nextProps: DragCheckProps = {
            lastDrag,
            onBrushEnd,
          };
          if (!spec || !onBrushEnd || pickedCells === null) {
            return;
          }
          if (lastDrag !== null && hasDragged(prevProps, nextProps)) {
            onBrushEnd(pickedCells);
          }
          prevProps = nextProps;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
