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
import { ChartType } from '../../..';
import { SeriesIdentifier } from '../../../../common/series_id';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { Cell, isPickedCells } from '../../layout/types/viewmodel_types';

function isOverElement(prev: Cell[], next: Cell[]) {
  if (next.length === 0) {
    return;
  }
  if (next.length !== prev.length) {
    return true;
  }
  return !next.every((nextCell, index) => {
    const prevCell = prev[index];
    if (prevCell === null) {
      return false;
    }
    return nextCell.value === prevCell.value && nextCell.x === prevCell.x && nextCell.y === prevCell.y;
  });
}

/**
 * Will call the onElementOver listener every time the following preconditions are met:
 * - the onElementOver listener is available
 * - we have a new set of highlighted geometries on our state
 * @internal
 */
export function createOnElementOverCaller(): (state: GlobalChartState) => void {
  let prevPickedShapes: Cell[] = [];
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      selector = createCustomCachedSelector(
        [getHeatmapSpecSelector, getPickedShapes, getSettingsSpecSelector],
        (spec, nextPickedShapes, settings): void => {
          if (!spec) {
            return;
          }
          if (!settings.onElementOver) {
            return;
          }
          if (!isPickedCells(nextPickedShapes)) {
            return;
          }

          if (isOverElement(prevPickedShapes, nextPickedShapes)) {
            const elements = nextPickedShapes.map<[Cell, SeriesIdentifier]>((value) => [
              value,
              {
                specId: spec.id,
                key: `spec{${spec.id}}`,
              },
            ]);
            settings.onElementOver(elements);
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
