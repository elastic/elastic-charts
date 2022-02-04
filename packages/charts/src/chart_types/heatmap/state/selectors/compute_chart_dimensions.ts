/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { extent } from '../../../../common/math';
import { cutToLength } from '../../../../common/text_utils';
import { transformA2, Vec2 } from '../../../../common/vectors';
import { screenspaceMarkerScaleCompressor } from '../../../../solvers/screenspace_marker_scale_compressor';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad } from '../../../../utils/common';
import { Dimensions, horizontalPad, innerPad, outerPad, pad } from '../../../../utils/dimensions';
import { isHorizontalLegend } from '../../../../utils/legend';
import { AxisStyle, HeatmapStyle } from '../../../../utils/themes/theme';
import { limitXAxisLabelRotation } from '../../layout/viewmodel/default_constaints';
import { HeatmapCellDatum } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs/heatmap';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { getXAxisRightOverflow } from './get_x_axis_right_overflow';

/** @internal */
export interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  yValues: Array<string | number>;
  xValues: Array<string | number>;
  xNumericExtent: [number, number];
  extent: [number, number];
}

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export type ChartElementSizes = {
  yAxis: Dimensions;
  xAxis: Dimensions;
  grid: Dimensions;
  fullHeatmapHeight: number;
  rowHeight: number;
  visibleNumberOfRows: number;
};
/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [
    getParentDimension,
    getLegendSizeSelector,
    getHeatmapTableSelector,
    getChartThemeSelector,
    getXAxisRightOverflow,
    getHeatmapSpecSelector,
  ],
  (
    container,
    legendSize,

    { yValues, xValues },
    { heatmap, axes: { axisTitle: axisTitleStyle } },
    rightOverflow,
    { xAxisTitle, yAxisTitle, xAxisLabelFormatter },
  ): ChartElementSizes => {
    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

      const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
      const yAxisWidth = getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, textMeasure);

      const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');

      const xAxisSize = getXAxisSize(
        heatmap.xAxisLabel,
        xAxisLabelFormatter,
        xValues,
        textMeasure,
        container.width - legendWidth,
        [
          yAxisTitleHorizontalSize + yAxisWidth + rightOverflow,
          0, // fill this if you need a right Y axis
        ],
      );

      const availableHeightForGrid = container.height - xAxisTitleVerticalSize - xAxisSize.height - legendHeight;

      const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
      const fullHeatmapHeight = rowHeight * yValues.length;

      const visibleNumberOfRows =
        rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
          ? Math.floor(availableHeightForGrid / rowHeight)
          : yValues.length;

      const grid: Dimensions = {
        width: xAxisSize.width,
        height: visibleNumberOfRows * rowHeight,
        left: container.left + (container.width - legendWidth) - xAxisSize.width,
        top: container.top,
      };

      const yAxis: Dimensions = {
        width: yAxisWidth,
        height: grid.height,
        top: grid.top,
        left: grid.left - yAxisWidth,
      };

      const xAxis: Dimensions = {
        width: grid.width,
        height: xAxisSize.height,
        top: grid.top + grid.height,
        left: grid.left,
      };

      return { grid, yAxis, xAxis, visibleNumberOfRows, fullHeatmapHeight, rowHeight };
    });
  },
);

function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  style: HeatmapStyle['yAxisLabel'],
  textMeasure: TextMeasure,
) {
  if (!style.visible) {
    return 0;
  }
  // account for the space required to show the longest Y axis label
  const longestLabelWidth = yValues.reduce<number>((acc, value) => {
    const { width } = textMeasure(`${value}`, style, style.fontSize);
    return Math.max(width, acc);
  }, 0);

  const labelsWidth =
    style.width === 'auto'
      ? longestLabelWidth
      : typeof style.width === 'number'
      ? style.width
      : Math.max(longestLabelWidth, style.width.max);

  return labelsWidth + horizontalPad(style.padding);
}

function getTextSizeDimension(
  text: string,
  style: AxisStyle['axisTitle'],
  textMeasure: TextMeasure,
  param: 'height' | 'width',
): number {
  if (!style.visible || text === '') {
    return 0;
  }
  const textPadding = innerPad(style.padding) + outerPad(style.padding);
  if (param === 'height') {
    return style.fontSize + textPadding;
  }

  const textBox = textMeasure(
    text,
    {
      fontFamily: style.fontFamily,
      fontVariant: 'normal',
      fontWeight: 'bold',
      fontStyle: style.fontStyle ?? 'normal',
    },
    style.fontSize,
  );
  return textBox.width + textPadding;
}

function getGridCellHeight(rows: number, grid: HeatmapStyle['grid'], height: number): number {
  if (rows === 0) {
    return height; // TODO check if this can be just 0
  }
  const stretchedHeight = height / rows;

  if (stretchedHeight < grid.cellHeight.min) {
    return grid.cellHeight.min;
  }
  if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
    return grid.cellHeight.max;
  }

  return stretchedHeight;
}

function getXAxisSize(
  style: HeatmapStyle['xAxisLabel'],
  formatter: HeatmapSpec['xAxisLabelFormatter'],
  labels: (string | number)[],
  textMeasure: TextMeasure,
  containerWidth: number,
  surroundingSpace: [number, number],
) {
  const rotationRad = degToRad(limitXAxisLabelRotation(style.rotation));
  const { itemWidths, domainPositions, hMax } = labels.reduce<{
    wMax: number;
    hMax: number;
    itemWidths: [number, number][];
    domainPositions: number[];
  }>(
    (acc, label) => {
      // use formatted and optionally limited labels{
      const text = cutToLength(formatter(label), style.overflow ? style.maxTextLength : Infinity);
      const { width, height } = textMeasure(text, style, style.fontSize);

      // rotate the label coordinates
      const labelRect: Vec2[] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ];
      const rotatedVectors = transformA2(labelRect, rotationRad, [0, height / 2]);

      // find the rotated bounding box
      const x = extent(rotatedVectors.map((v) => v[0]));
      const y = extent(rotatedVectors.map((v) => v[1]));
      acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
      acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));

      // describe the item width as the left and right vector size from the rotation origin
      acc.itemWidths.push([Math.abs(x[0]), Math.abs(x[1])]);

      // use a categorical scale with labels aligned to the center to compute the domain position
      const domainPosition = labels.indexOf(label) / labels.length + 1 / labels.length / 2;
      acc.domainPositions.push(domainPosition);
      return acc;
    },
    { wMax: -Infinity, hMax: -Infinity, itemWidths: [], domainPositions: [] },
  );
  return {
    // the horizontal space
    width: screenspaceMarkerScaleCompressor(
      [0, ...domainPositions, 1], // account for the left and right space (Y axis, Legend etc)
      [[surroundingSpace[0], 0], ...itemWidths, [0, surroundingSpace[1]]],
      containerWidth,
    ).scaleMultiplier,
    // the height represent the height of the max rotated bbox plus the padding and the vertical position of the rotation origin
    height: style.visible ? hMax + pad(style.padding, 'top') + style.fontSize / 2 : 0,
  };
}
