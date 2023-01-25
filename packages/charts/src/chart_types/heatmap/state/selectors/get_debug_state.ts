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
import { getChartThemeSelector } from './../../../../state/selectors/get_chart_theme';
import { computeChartElementSizesSelector } from './compute_chart_element_sizes';
import { computeLegendSelector } from './compute_legend';
import { getHighlightedAreaSelector, getHighlightedDataSelector } from './get_highlighted_area';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';

/**
 * Returns a stringified version of the `debugState`
 * @internal
 */
export const getDebugStateSelector = createCustomCachedSelector(
  [
    getPerPanelHeatmapGeometries,
    computeLegendSelector,
    getHighlightedAreaSelector,
    getHighlightedDataSelector,
    getChartThemeSelector,
    computeChartElementSizesSelector,
  ],
  (geoms, legend, pickedArea, highlightedData, { heatmap }, { xAxisTickCadence }): DebugState => {
    const xAxisValues = geoms.heatmapViewModels[0].xValues.filter((_, i) => i % xAxisTickCadence === 0);
    return {
      // Common debug state
      legend: getLegendState(legend),
      axes: {
        x: [
          {
            id: 'x',
            position: Position.Left,
            labels: xAxisValues.map(({ text }) => text),
            values: xAxisValues.map(({ value }) => value),
            // vertical lines
            gridlines: geoms.heatmapViewModels[0].gridLines.x.map((line) => ({ x: line.x1, y: line.y2 })),
          },
        ],
        y: [
          {
            id: 'y',
            position: Position.Bottom,
            labels: geoms.heatmapViewModels[0].yValues.map(({ text }) => text),
            values: geoms.heatmapViewModels[0].yValues.map(({ value }) => value),
            // horizontal lines
            gridlines: geoms.heatmapViewModels[0].gridLines.y.map((line) => ({ x: line.x2, y: line.y1 })),
          },
        ],
      },
      // Heatmap debug state
      heatmap: {
        cells: geoms.heatmapViewModels[0].cells.map((cell) => ({
          x: cell.x,
          y: cell.y,
          fill: RGBATupleToString(cell.fill.color),
          formatted: cell.formatted,
          value: cell.value,
          valueShown: heatmap.cell.label.visible && Number.isFinite(geoms.heatmapViewModels[0].cellFontSize(cell)),
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
