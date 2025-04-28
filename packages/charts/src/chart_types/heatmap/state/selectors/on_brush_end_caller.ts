/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { OutputSelector } from '@reduxjs/toolkit';

import { getPickedCells } from './get_picked_cells';
import { isBrushEndProvided } from './is_brush_available';
import { ChartType } from '../../..';
import type { HeatmapBrushEvent, SettingsSpec } from '../../../../specs/settings';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { DragState } from '../../../../state/pointer_states';
import { getKeyPressedSelector } from '../../../../state/selectors/get_key_pressed';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { DragCheckProps } from '../../../../utils/events';
import { hasDragged } from '../../../../utils/events';
import type { KeyPressed } from '../../../../utils/keys';

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 * @internal
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let prevProps: DragCheckProps | null = null;
  let selector: OutputSelector<
    Array<(state: GlobalChartState) => GlobalChartState>,
    void,
    (res1: DragState | null, res2: SettingsSpec, res3: HeatmapBrushEvent | null, res4: KeyPressed) => void
  > | null = null;

  return (state) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      if (!isBrushEndProvided(state)) {
        selector = null;
        prevProps = null;
        return;
      }
      selector = createCustomCachedSelector(
        [getLastDragSelector, getSettingsSpecSelector, getPickedCells, getKeyPressedSelector],
        (lastDrag, { onBrushEnd }, pickedCells, keyPressed): void => {
          const nextProps: DragCheckProps = {
            lastDrag,
            onBrushEnd,
          };
          if (!onBrushEnd || pickedCells === null) {
            return;
          }
          if (lastDrag !== null && hasDragged(prevProps, nextProps)) {
            onBrushEnd(pickedCells, { keyPressed });
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
