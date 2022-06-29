/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleBand } from 'd3-scale';

import { Radian } from '../../../../common/geometry';
import { extent } from '../../../../common/math';
import { rotate2, sub2, Vec2 } from '../../../../common/vectors';
import { screenspaceMarkerScaleCompressor } from '../../../../solvers/screenspace_marker_scale_compressor';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad, isFiniteNumber } from '../../../../utils/common';
import { Dimensions, horizontalPad, innerPad, outerPad, pad, Size } from '../../../../utils/dimensions';
import { isHorizontalLegend } from '../../../../utils/legend';
import { AxisStyle, HeatmapStyle } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { HeatmapCellDatum, isRasterTimeScale } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs/heatmap';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

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
  xAxisTickCadence: number;
  xLabelRotation: number;
};

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [getParentDimension, getLegendSizeSelector, getHeatmapTableSelector, getChartThemeSelector, getHeatmapSpecSelector],
  (
    container,
    legendSize,
    { yValues, xValues },
    { heatmap, axes: { axisTitle: axisTitleStyle } },
    { xAxisTitle, yAxisTitle, xAxisLabelFormatter, yAxisLabelFormatter, xScale },
  ): ChartElementSizes => {
    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

      const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
      const yAxisWidth = getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure);

      const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
      const xAxisSize = getXAxisSize(
        !isRasterTimeScale(xScale),
        heatmap.xAxisLabel,
        xAxisLabelFormatter,
        xValues,
        textMeasure,
        container.width - legendWidth - heatmap.grid.stroke.width / 2, // we should consider also the grid width
        [
          yAxisTitleHorizontalSize + yAxisWidth,
          0, // this can be used if we have a right Y axis
        ],
      );

      const availableHeightForGrid =
        container.height - xAxisTitleVerticalSize - xAxisSize.height - legendHeight - heatmap.grid.stroke.width / 2;

      const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
      const fullHeatmapHeight = rowHeight * yValues.length;

      const visibleNumberOfRows =
        rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
          ? Math.floor(availableHeightForGrid / rowHeight)
          : yValues.length;

      const grid: Dimensions = {
        width: xAxisSize.width,
        height: visibleNumberOfRows * rowHeight - heatmap.grid.stroke.width / 2,
        left: container.left + xAxisSize.left,
        top: container.top + heatmap.grid.stroke.width / 2,
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

      return {
        grid,
        yAxis,
        xAxis,
        visibleNumberOfRows,
        fullHeatmapHeight,
        rowHeight,
        xAxisTickCadence: xAxisSize.tickCadence,
        xLabelRotation: xAxisSize.minRotation,
      };
    });
  },
);

function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  style: HeatmapStyle['yAxisLabel'],
  formatter: HeatmapSpec['yAxisLabelFormatter'],
  textMeasure: TextMeasure,
): number {
  if (!style.visible) {
    return 0;
  }
  if (typeof style.width === 'number' && isFiniteNumber(style.width)) {
    return style.width;
  }
  // account for the space required to show the longest Y axis label
  const longestLabelWidth = yValues.reduce<number>((acc, value) => {
    const { width } = textMeasure(formatter(value), style, style.fontSize);
    return Math.max(width + horizontalPad(style.padding), acc);
  }, 0);

  return style.width === 'auto' ? longestLabelWidth : Math.min(longestLabelWidth, style.width.max);
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
  isCategoricalScale: boolean,
  style: HeatmapStyle['xAxisLabel'],
  formatter: HeatmapSpec['xAxisLabelFormatter'],
  labels: (string | number)[],
  textMeasure: TextMeasure,
  containerWidth: number,
  surroundingSpace: [number, number],
): Size & { right: number; left: number; tickCadence: number; minRotation: Radian } {
  if (!style.visible) {
    return {
      height: 0,
      width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
      left: surroundingSpace[0],
      right: surroundingSpace[1],
      tickCadence: NaN,
      minRotation: 0,
    };
  }
  const isRotated = style.rotation !== 0;
  const normalizedScale = scaleBand<NonNullable<PrimitiveValue>>().domain(labels).range([0, 1]);

  const alignment = isRotated ? 'right' : isCategoricalScale ? 'center' : 'left';
  const alignmentOffset = isCategoricalScale ? normalizedScale.bandwidth() / 2 : 0;
  const scale = (d: NonNullable<PrimitiveValue>) => (normalizedScale(d) ?? 0) + alignmentOffset;

  // use positive angle from 0 to 90 only
  const rotationRad = degToRad(style.rotation);

  const measuredLabels = labels.map((label) => ({
    ...textMeasure(formatter(label), style, style.fontSize),
    label,
  }));

  // don't filter ticks if categorical scale or with rotated labels
  if (isCategoricalScale || isRotated) {
    const maxLabelBBox = measuredLabels.reduce(
      (acc, curr) => {
        return {
          height: Math.max(acc.height, curr.height),
          width: Math.max(acc.width, curr.width),
        };
      },
      { height: 0, width: 0 },
    );
    const compressedScale = computeCompressedScale(
      style,
      scale,
      measuredLabels,
      containerWidth,
      surroundingSpace,
      alignment,
      rotationRad,
    );
    const scaleStep = compressedScale.width / labels.length;
    // this optimal rotation is computed on a suboptimal compressed scale, it can be further enhanced with a monotonic hill climber
    const optimalRotation =
      scaleStep > maxLabelBBox.width ? 0 : Math.asin(Math.min(maxLabelBBox.height / scaleStep, 1));
    // if the current requested rotation is not at least bigger then the optimal one, recalculate the compression
    // using the optimal one forcing the rotation to be without overlaps
    const { width, height, left, right, minRotation } = {
      ...(rotationRad !== 0 && optimalRotation > rotationRad
        ? computeCompressedScale(
            style,
            scale,
            measuredLabels,
            containerWidth,
            surroundingSpace,
            alignment,
            optimalRotation,
          )
        : compressedScale),
      minRotation: isRotated ? Math.max(optimalRotation, rotationRad) : 0,
    };

    const validCompression = isFiniteNumber(width);
    return {
      height: validCompression ? height : 0,
      width: validCompression ? width : Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
      left: validCompression ? left : surroundingSpace[0],
      right: validCompression ? right : surroundingSpace[1],
      tickCadence: validCompression ? 1 : NaN,
      minRotation,
    };
  }

  // TODO refactor and move to monotonic hill climber and no mutations
  // reduce the tick cadence on time scale to avoid overlaps and overflows
  let tickCadence = 1;
  let dimension = computeCompressedScale(
    style,
    scale,
    measuredLabels,
    containerWidth,
    surroundingSpace,
    alignment,
    rotationRad,
  );

  for (let i = 1; i < measuredLabels.length; i++) {
    if ((!dimension.overlaps && !dimension.overflow.right) || !isFiniteNumber(dimension.width)) {
      break;
    }
    dimension = computeCompressedScale(
      style,
      scale,
      measuredLabels.filter((_, index) => index % (i + 1) === 0),
      containerWidth,
      surroundingSpace,
      alignment,
      rotationRad,
    );
    tickCadence++;
  }

  // hide the axis because there is no space for labels
  if (!isFiniteNumber(dimension.width)) {
    return {
      // hide the whole axis
      height: 0,
      width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
      left: surroundingSpace[0],
      right: surroundingSpace[1],
      // hide all ticks
      tickCadence: NaN,
      minRotation: rotationRad,
    };
  }

  return {
    ...dimension,
    tickCadence,
    minRotation: rotationRad,
  };
}

function computeCompressedScale(
  style: HeatmapStyle['xAxisLabel'],
  scale: (d: NonNullable<PrimitiveValue>) => number,
  labels: Array<Size & { label: number | NonNullable<PrimitiveValue> }>,
  containerWidth: number,
  surroundingSpace: [number, number],
  alignment: 'left' | 'right' | 'center',
  rotation: Radian,
): Size & { left: number; right: number; overlaps: boolean; overflow: { left: boolean; right: boolean } } {
  const { itemsPerSideSize, domainPositions, hMax } = labels.reduce<{
    wMax: number;
    hMax: number;
    itemsPerSideSize: [number, number][];
    domainPositions: number[];
  }>(
    (acc, { width, height, label }) => {
      // rotate the label box coordinates
      const labelRect: Vec2[] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ];

      const rotationOrigin: Vec2 =
        alignment === 'right' ? [width, height / 2] : alignment === 'left' ? [0, height / 2] : [width / 2, height / 2];

      const rotatedVectors = labelRect.map((vector) => rotate2(rotation, sub2(vector, rotationOrigin)));

      // find the rotated bounding box
      const x = extent(rotatedVectors.map((v) => v[0]));
      const y = extent(rotatedVectors.map((v) => v[1]));
      acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
      acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));

      // describe the item width as the left and right vector size from the rotation origin
      acc.itemsPerSideSize.push([Math.abs(x[0]), Math.abs(x[1])]);

      // use a categorical scale with labels aligned to the center to compute the domain position
      const domainPosition = scale(label);
      acc.domainPositions.push(domainPosition);
      return acc;
    },
    { wMax: -Infinity, hMax: -Infinity, itemsPerSideSize: [], domainPositions: [] },
  );

  // account for the left and right space (Y axes, overflows etc)
  const globalDomainPositions = [0, ...domainPositions, 1];
  const globalItemWidth: [number, number][] = [[surroundingSpace[0], 0], ...itemsPerSideSize, [0, surroundingSpace[1]]];

  const { scaleMultiplier, bounds } = screenspaceMarkerScaleCompressor(
    globalDomainPositions,
    globalItemWidth,
    containerWidth,
  );

  // check label overlaps using the computed compressed scale
  const overlaps = itemsPerSideSize.some(([, rightSide], i) => {
    if (i >= itemsPerSideSize.length - 2) {
      return false;
    }
    const currentItemRightSide = domainPositions[i] * scaleMultiplier + rightSide + pad(style.padding, 'right');
    const nextItemLeftSize =
      domainPositions[i + 1] * scaleMultiplier - itemsPerSideSize[i + 1][0] - pad(style.padding, 'left');
    return currentItemRightSide > nextItemLeftSize;
  });

  const leftMargin = isFiniteNumber(bounds[0])
    ? globalItemWidth[bounds[0]][0] - scaleMultiplier * globalDomainPositions[bounds[0]]
    : 0;
  const rightMargin = isFiniteNumber(bounds[1]) ? globalItemWidth[bounds[1]][1] : 0;

  return {
    // the horizontal space
    width: scaleMultiplier,
    right: rightMargin,
    left: leftMargin,
    // the height represent the height of the max rotated bbox plus the padding and the vertical position of the rotation origin
    height: hMax + pad(style.padding, 'top') + style.fontSize / 2,
    overlaps,
    overflow: {
      // true if a label exist protrude to the left making the scale shrink from the left
      // the current check is based on the way we construct globalItemWidth and globalDomainPositions
      left: bounds[0] !== 0,
      // true if a label exist protrude to the right making the scale shrink from the right
      // the current check is based on the way we construct globalItemWidth and globalDomainPositions
      right: bounds[1] !== globalDomainPositions.length - 1,
    },
  };
}
