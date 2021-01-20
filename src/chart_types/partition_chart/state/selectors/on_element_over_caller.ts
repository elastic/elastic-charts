/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import createCachedSelector from 're-reselect';
import { Selector } from 'react-redux';

import { ChartTypes } from '../../..';
import { SeriesIdentifier } from '../../../../common/series_id';
import { LayerValue } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getPickedShapesLayerValues } from './picked_shapes';
import { getPieSpec } from './pie_spec';

function isOverElement(prevPickedShapes: Array<Array<LayerValue>> = [], nextPickedShapes: Array<Array<LayerValue>>) {
  if (nextPickedShapes.length === 0) {
    return;
  }
  if (nextPickedShapes.length !== prevPickedShapes.length) {
    return true;
  }
  return !nextPickedShapes.every((nextPickedShapeValues, index) => {
    const prevPickedShapeValues = prevPickedShapes[index];
    if (prevPickedShapeValues === null) {
      return false;
    }
    if (prevPickedShapeValues.length !== nextPickedShapeValues.length) {
      return false;
    }
    return nextPickedShapeValues.every((layerValue, i) => {
      const prevPickedValue = prevPickedShapeValues[i];
      if (!prevPickedValue) {
        return false;
      }
      return layerValue.value === prevPickedValue.value && layerValue.groupByRollup === prevPickedValue.groupByRollup;
    });
  });
}

/**
 * Will call the onElementOver listener every time the following preconditions are met:
 * - the onElementOver listener is available
 * - we have a new set of highlighted geometries on our state
 * @internal
 */
export function createOnElementOverCaller(): (state: GlobalChartState) => void {
  let prevPickedShapes: Array<Array<LayerValue>> = [];
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.Partition) {
      selector = createCachedSelector(
        [getPieSpec, getPickedShapesLayerValues, getSettingsSpecSelector],
        (pieSpec, nextPickedShapes, settings): void => {
          if (!pieSpec) {
            return;
          }
          if (!settings.onElementOver) {
            return;
          }

          if (isOverElement(prevPickedShapes, nextPickedShapes)) {
            const elements = nextPickedShapes.map<[Array<LayerValue>, SeriesIdentifier]>((values) => [
              values,
              {
                specId: pieSpec.id,
                key: `spec{${pieSpec.id}}`,
              },
            ]);
            settings.onElementOver(elements);
          }
          prevPickedShapes = nextPickedShapes;
        },
      )({
        keySelector: getChartIdSelector,
      });
    }
    if (selector) {
      selector(state);
    }
  };
}
