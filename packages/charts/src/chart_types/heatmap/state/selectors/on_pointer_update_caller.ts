/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPickedGridCell } from './picked_shapes';
import { PointerUpdateTrigger } from '../../../../specs/pointer_update_trigger';
import { SettingsSpec } from '../../../../specs/settings';
import { PointerEvent, PointerEventType, PointerOverEvent } from '../../../../specs/settings_types';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { ChartType } from '../../../chart_type';

function isSameEventValue(a: PointerOverEvent, b: PointerOverEvent, changeTrigger: PointerUpdateTrigger) {
  const checkX = changeTrigger === PointerUpdateTrigger.X || changeTrigger === PointerUpdateTrigger.Both;
  const checkY = changeTrigger === PointerUpdateTrigger.Y || changeTrigger === PointerUpdateTrigger.Both;
  return (
    (!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
    (!checkY || a.y.every((y, i) => y.value === b.y[i]?.value))
  );
}

const hasPointerEventChanged = (prev: PointerEvent, next: PointerEvent | null, changeTrigger: PointerUpdateTrigger) =>
  next?.type !== prev.type ||
  (prev.type === PointerEventType.Over &&
    next?.type === PointerEventType.Over &&
    !isSameEventValue(prev, next, changeTrigger));

/**
 * Will call the onPointerUpdate listener every time the following preconditions are met:
 * - the onPointerUpdate listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnPointerUpdateCaller(): (state: GlobalChartState) => void {
  let prevPointerEvent: PointerEvent | null = null;

  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      selector = createCustomCachedSelector(
        [
          getHeatmapSpecSelector,
          getSettingsSpecSelector,
          getActivePointerPosition,
          getPickedGridCell,
          getChartIdSelector,
        ],
        (spec, settings: SettingsSpec, currentPointer, gridCell, chartId): void => {
          if (!spec) {
            return;
          }

          if (prevPointerEvent === null) {
            prevPointerEvent = { chartId, type: PointerEventType.Out };
          }
          const tempPrev = { ...prevPointerEvent };
          const nextPointerEvent: PointerEvent = gridCell
            ? {
                chartId: state.chartId,
                type: currentPointer.x === -1 && currentPointer.y === -1 ? PointerEventType.Out : PointerEventType.Over,
                scale: spec.xScale.type,
                x: gridCell.x,
                y: [{ value: gridCell.y, groupId: '' }],
                smHorizontalValue: null,
                smVerticalValue: null,
              }
            : { chartId, type: PointerEventType.Out };
          // we have to update the prevPointerEvents before possibly calling the onPointerUpdate
          // to avoid a recursive loop of calls caused by the impossibility to update the prevPointerEvent
          prevPointerEvent = nextPointerEvent;

          if (
            settings.onPointerUpdate &&
            hasPointerEventChanged(tempPrev, nextPointerEvent, settings.pointerUpdateTrigger)
          ) {
            settings.onPointerUpdate(nextPointerEvent);
          }
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
