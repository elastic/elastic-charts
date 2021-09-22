/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../../common/color_library_wrappers';
import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { DebugState, DebugStateLegend } from '../../../../state/types';
import { Position } from '../../../../utils/common';
import { computeLegendSelector } from './compute_legend';
import { geometries } from './geometries';
import { getHighlightedAreaSelector, getHighlightedDataSelector } from './get_highlighted_area';
import { getPickedCells } from './get_picked_cells';

/**
 * Returns a stringified version of the `debugState`
 * @internal
 */
export const getDebugStateSelector = createCustomCachedSelector(
  [geometries, computeLegendSelector, getHighlightedAreaSelector, getPickedCells, getHighlightedDataSelector],
  (geoms, legend, pickedArea, pickedCells, highlightedData): DebugState => {
    return {
      // Common debug state
      legend: getLegendState(legend),
      axes: {
        x: [
          {
            id: 'x',
            title: '',
            position: Position.Left,
            labels: geoms.heatmapViewModel.xValues.map(({ text }) => text),
            values: geoms.heatmapViewModel.xValues.map(({ value }) => value),
            // vertical lines
            gridlines: geoms.heatmapViewModel.gridLines.x.map((line) => ({ x: line.x1, y: line.y2 })),
          },
        ],
        y: [
          {
            id: 'y',
            title: '',
            position: Position.Bottom,
            labels: geoms.heatmapViewModel.yValues.map(({ text }) => text),
            values: geoms.heatmapViewModel.yValues.map(({ value }) => value),
            // horizontal lines
            gridlines: geoms.heatmapViewModel.gridLines.y.map((line) => ({ x: line.x2, y: line.y1 })),
          },
        ],
      },
      // Heatmap debug state
      heatmap: {
        cells: geoms.heatmapViewModel.cells.map(({ x, y, fill, formatted, value }) => ({
          x,
          y,
          fill: RGBATupleToString(fill.color),
          formatted,
          value,
        })),
        selection: {
          area: pickedArea,
          data: highlightedData,
        },
      },
    };
  },
);

function getLegendState(legendItems: LegendItem[]): DebugStateLegend {
  const items = legendItems
    .filter(({ isSeriesHidden }) => !isSeriesHidden)
    .map(({ label: name, color, seriesIdentifiers: [{ key }] }) => ({
      key,
      name,
      color,
    }));

  return { items };
}
