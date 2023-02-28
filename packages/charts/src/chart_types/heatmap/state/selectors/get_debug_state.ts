/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartElementSizesSelector } from './compute_chart_element_sizes';
import { computeLegendSelector } from './compute_legend';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHighlightedAreaSelector, getHighlightedDataSelector } from './get_highlighted_area';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { RGBATupleToString } from '../../../../common/color_library_wrappers';
import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { DebugState, DebugStateLegend } from '../../../../state/types';
import { Position } from '../../../../utils/common';

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
    getHeatmapSpecSelector,
  ],
  (
    geoms,
    legend,
    pickedArea,
    highlightedData,
    { heatmap },
    { xAxisTickCadence },
    { xAxisTitle, yAxisTitle },
  ): DebugState => {
    const [heatmapViewModel] = geoms.heatmapViewModels;

    const xAxisValues = heatmapViewModel.xValues.filter((_, i) => i % xAxisTickCadence === 0);
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
            gridlines: heatmapViewModel.gridLines.x.map((line) => ({ x: line.x1, y: line.y2 })),
            ...(xAxisTitle ? { title: xAxisTitle } : {}),
          },
        ],
        y: [
          {
            id: 'y',
            position: Position.Bottom,
            labels: heatmapViewModel.yValues.map(({ text }) => text),
            values: heatmapViewModel.yValues.map(({ value }) => value),
            // horizontal lines
            gridlines: heatmapViewModel.gridLines.y.map((line) => ({ x: line.x2, y: line.y1 })),
            ...(yAxisTitle ? { title: yAxisTitle } : {}),
          },
        ],
      },
      // Heatmap debug state
      heatmap: {
        cells: geoms.heatmapViewModels.flatMap(({ cells }) =>
          cells.map((cell) => ({
            x: cell.x,
            y: cell.y,
            datum: cell.datum,
            fill: RGBATupleToString(cell.fill.color),
            formatted: cell.formatted,
            value: cell.value,
            valueShown: heatmap.cell.label.visible && Number.isFinite(heatmapViewModel.cellFontSize(cell)),
          })),
        ),
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
