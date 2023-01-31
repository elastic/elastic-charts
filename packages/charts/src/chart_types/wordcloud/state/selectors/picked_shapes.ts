/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { geometries } from './geometries';
import { LayerValue } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { WordcloudViewModel } from '../../layout/types/viewmodel_types';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [geometries, getCurrentPointerPosition],
  (geoms, pointerPosition): WordcloudViewModel[] => {
    const picker = geoms.pickQuads;
    const { chartCenter } = geoms;
    const x = pointerPosition.x - chartCenter.x;
    const y = pointerPosition.y - chartCenter.y;
    return picker(x, y);
  },
);

/** @internal */
export const getPickedShapesLayerValues = createCustomCachedSelector(
  [getPickedShapes],
  (pickedShapes): Array<Array<LayerValue>> => {
    const elements = pickedShapes.map<Array<LayerValue>>((model) => {
      const values: Array<LayerValue> = [];
      values.push({
        smAccessorValue: '',
        groupByRollup: 'Word count',
        value: model.data.length,
        sortIndex: 0,
        path: [],
        depth: 0,
      });
      return values.reverse();
    });
    return elements;
  },
);
