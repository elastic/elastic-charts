/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { ProjectedValues, SettingsSpec } from '../../../../specs';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isClicking } from '../../../../state/utils';
import { IndexedGeometry, GeometryValue } from '../../../../utils/geometry';
import { XYChartSeriesIdentifier } from '../../utils/series';
import { getProjectedScaledValues } from './get_projected_scaled_values';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnClickCaller(): (state: GlobalChartState) => void {
  let prevClick: PointerState | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector) {
      return selector(state);
    }
    if (state.chartType !== ChartType.XYAxis) {
      return;
    }
    selector = createCustomCachedSelector(
      [getLastClickSelector, getSettingsSpecSelector, getHighlightedGeomsSelector, getProjectedScaledValues],
      (
        lastClick: PointerState | null,
        { onElementClick, onProjectionClick }: SettingsSpec,
        indexedGeometries: IndexedGeometry[],
        values,
      ): void => {
        if (!isClicking(prevClick, lastClick)) {
          return;
        }
        const elementClickFired = tryFiringOnElementClick(indexedGeometries, onElementClick);
        if (!elementClickFired) {
          tryFiringOnProjectionClick(values, onProjectionClick);
        }
        prevClick = lastClick;
      },
    );
  };
}

function tryFiringOnElementClick(
  indexedGeometries: IndexedGeometry[],
  onElementClick: SettingsSpec['onElementClick'],
): boolean {
  if (indexedGeometries.length === 0 || !onElementClick) {
    return false;
  }

  const elements = indexedGeometries.map<[GeometryValue, XYChartSeriesIdentifier]>(({ value, seriesIdentifier }) => [
    value,
    seriesIdentifier,
  ]);
  onElementClick(elements);
  return true;
}

function tryFiringOnProjectionClick(
  values: ProjectedValues | undefined,
  onProjectionClick: SettingsSpec['onProjectionClick'],
): boolean {
  if (values === undefined || !onProjectionClick) {
    return false;
  }
  onProjectionClick(values);
  return true;
}
