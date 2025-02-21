/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from '@reduxjs/toolkit';

import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { PointerPosition } from './get_projected_pointer_position';
import { ChartType } from '../../..';
import { PointerEventType, PointerEvent, PointerOverEvent } from '../../../../specs';
import { PointerUpdateTrigger } from '../../../../specs/pointer_update_trigger';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isNil } from '../../../../utils/common';
import { ComputedScales } from '../utils/types';

const getPointerEventSelector = createCustomCachedSelector(
  [
    getChartIdSelector,
    getOrientedProjectedPointerPositionSelector,
    computeSeriesGeometriesSelector,
    getGeometriesIndexKeysSelector,
  ],
  (chartId, orientedProjectedPointerPosition, seriesGeometries, geometriesIndexKeys): PointerEvent =>
    getPointerEvent(chartId, orientedProjectedPointerPosition, seriesGeometries.scales, geometriesIndexKeys),
);

function getPointerEvent(
  chartId: string,
  orientedProjectedPointerPosition: PointerPosition,
  { xScale, yScales }: ComputedScales,
  geometriesIndexKeys: any[],
): PointerEvent {
  // update the cursorBandPosition based on chart configuration
  if (!xScale) {
    return { chartId, type: PointerEventType.Out };
  }
  const { x, y, verticalPanelValue, horizontalPanelValue } = orientedProjectedPointerPosition;
  if (x === -1 || y === -1) {
    return { chartId, type: PointerEventType.Out };
  }
  const xValue = xScale.invertWithStep(x, geometriesIndexKeys).value;
  if (isNil(xValue) || Number.isNaN(xValue)) {
    return { chartId, type: PointerEventType.Out };
  }
  return {
    chartId,
    type: PointerEventType.Over,
    unit: xScale.unit,
    scale: xScale.type,
    x: xValue,
    y: [...yScales.entries()].map(([groupId, yScale]) => {
      return { value: yScale.invert(y), groupId };
    }),
    smVerticalValue: verticalPanelValue,
    smHorizontalValue: horizontalPanelValue,
  };
}

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

/** @internal */
export function createOnPointerMoveCaller(): (state: GlobalChartState) => void {
  let prevPointerEvent: PointerEvent | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      selector = createCustomCachedSelector(
        [getSettingsSpecSelector, getPointerEventSelector, getChartIdSelector],
        ({ onPointerUpdate, pointerUpdateTrigger }, nextPointerEvent, chartId): void => {
          if (prevPointerEvent === null) {
            prevPointerEvent = { chartId, type: PointerEventType.Out };
          }
          const tempPrev = { ...prevPointerEvent };
          // we have to update the prevPointerEvents before possibly calling the onPointerUpdate
          // to avoid a recursive loop of calls caused by the impossibility to update the prevPointerEvent
          prevPointerEvent = nextPointerEvent;

          if (onPointerUpdate && hasPointerEventChanged(tempPrev, nextPointerEvent, pointerUpdateTrigger))
            onPointerUpdate(nextPointerEvent);
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
