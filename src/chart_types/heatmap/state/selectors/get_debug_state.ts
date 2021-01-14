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

import { LegendItem } from '../../../../commons/legend';
import { Line } from '../../../../geoms/types';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { DebugState, DebugStateLegend } from '../../../../state/types';
import { RGBtoString } from '../../../partition_chart/layout/utils/color_library_wrappers';
import { Cell } from '../../layout/types/viewmodel_types';
import { computeLegendSelector } from './compute_legend';
import { geometries } from './geometries';
import { getHighlightedAreaSelector } from './get_highlighted_area';

type CellDebug = Pick<Cell, 'value' | 'formatted' | 'x' | 'y'> & { fill: string };

interface DebugStateAxis {
  labels: string[];
  gridlines: Line[];
}

interface DebugStateAxes {
  x: DebugStateAxis;
  y: DebugStateAxis;
}

export type HeatmapDebugState = Pick<DebugState, 'legend'> & {
  cells: CellDebug[];
  selectedArea: { x: number; y: number; width: number; height: number } | null;
  axes: DebugStateAxes;
};

/**
 * Returns a stringified version of the `debugState`
 * @internal
 */
export const getDebugStateSelector = createCachedSelector(
  [geometries, computeLegendSelector, getHighlightedAreaSelector],
  (geoms, legend, pickedArea): HeatmapDebugState => {
    return {
      legend: getLegendState(legend),
      axes: {
        x: {
          labels: geoms.heatmapViewModel.xValues.map(({ text }) => text),
          gridlines: geoms.heatmapViewModel.gridLines.x,
        },
        y: {
          labels: geoms.heatmapViewModel.yValues.map(({ text }) => text),
          gridlines: geoms.heatmapViewModel.gridLines.y,
        },
      },
      cells: geoms.heatmapViewModel.cells.map(({ x, y, fill, formatted, value }) => ({
        x,
        y,
        fill: RGBtoString(fill.color),
        formatted,
        value,
      })),
      selectedArea: pickedArea,
    };
  },
)(getChartIdSelector);

function getLegendState(legendItems: LegendItem[]): DebugStateLegend {
  const items = legendItems
    .filter(({ isSeriesHidden }) => !isSeriesHidden)
    .map(({ label: name, color, seriesIdentifier: { key } }) => ({
      key,
      name,
      color,
    }));

  return { items };
}
