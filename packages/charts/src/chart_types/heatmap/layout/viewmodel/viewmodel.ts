/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bisectLeft } from 'd3-array';
import { ScaleBand, scaleBand, scaleQuantize } from 'd3-scale';

import { colorToRgba } from '../../../../common/color_library_wrappers';
import { fillTextColor } from '../../../../common/fill_text_color';
import { Pixels } from '../../../../common/geometry';
import { getPanelSize, getPerPanelMap, SmallMultipleScales, SmallMultiplesDatum } from '../../../../common/panel_utils';
import { Box, Font, maximiseFontSize } from '../../../../common/text_utils';
import { ScaleType } from '../../../../scales/constants';
import { LinearScale, OrdinalScale, RasterTimeScale } from '../../../../specs';
import { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { addIntervalToTime, roundDateToESInterval } from '../../../../utils/chrono/elasticsearch';
import { clamp, Datum, isFiniteNumber } from '../../../../utils/common';
import { innerPad, pad } from '../../../../utils/dimensions';
import { Logger } from '../../../../utils/logger';
import { HeatmapStyle, Theme, Visible } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { ChartDimensions } from '../../../xy_chart/utils/dimensions';
import { HeatmapSpec } from '../../specs';
import { ChartElementSizes } from '../../state/selectors/compute_chart_element_sizes';
import { ColorScale } from '../../state/selectors/get_color_scale';
import { HeatmapTable } from '../../state/selectors/get_heatmap_table';
import {
  Cell,
  GridCell,
  PickCursorBand,
  PickDragFunction,
  PickDragShapeFunction,
  PickHighlightedArea,
  ShapeViewModel,
  TextBox,
} from '../types/viewmodel_types';
import { BaseDatum } from './../../../xy_chart/utils/specs';

/** @public */
export interface HeatmapCellDatum extends SmallMultiplesDatum {
  x: NonNullable<PrimitiveValue>;
  y: NonNullable<PrimitiveValue>;
  value: number;
  originalIndex: number;
}

function getValuesInRange(
  values: NonNullable<PrimitiveValue>[],
  startValue: NonNullable<PrimitiveValue>,
  endValue: NonNullable<PrimitiveValue>,
) {
  const startIndex = values.indexOf(startValue);
  const endIndex = Math.min(values.indexOf(endValue) + 1, values.length);
  return values.slice(startIndex, endIndex);
}

/** @internal */
export function shapeViewModel<D extends BaseDatum = Datum>(
  textMeasure: TextMeasure,
  spec: HeatmapSpec<D>,
  { heatmap: heatmapTheme, axes: { axisTitle }, background }: Theme,
  { chartDimensions }: ChartDimensions,
  elementSizes: ChartElementSizes,
  heatmapTable: HeatmapTable,
  colorScale: ColorScale,
  smScales: SmallMultipleScales,
  bandsToHide: Array<[number, number]>,
): ShapeViewModel {
  const gridStrokeWidth = heatmapTheme.grid.stroke.width ?? 1;

  const { table, yValues, xValues } = heatmapTable;

  // measure the text width of all rows values to get the grid area width
  const boxedYValues = yValues.map<Box & { value: NonNullable<PrimitiveValue> }>((value) => ({
    text: spec.yAxisLabelFormatter(value),
    value,
    isValue: false,
    ...heatmapTheme.yAxisLabel,
  }));

  const panelSize = getPanelSize(smScales);
  // compute the scale for the rows positions
  // const yScale = scaleBand<NonNullable<PrimitiveValue>>().domain(yValues).range([0, elementSizes.fullHeatmapHeight]);
  const yScale = scaleBand<NonNullable<PrimitiveValue>>().domain(yValues).range([0, panelSize.height]);

  const yInvertedScale = scaleQuantize<NonNullable<PrimitiveValue>>()
    // .domain([0, elementSizes.fullHeatmapHeight])
    .domain([0, panelSize.height])
    .range(yValues);

  // compute the scale for the columns positions
  // const xScale = scaleBand<NonNullable<PrimitiveValue>>().domain(xValues).range([0, chartDimensions.width]);
  const xScale = scaleBand<NonNullable<PrimitiveValue>>().domain(xValues).range([0, panelSize.width]);

  // const xInvertedScale = scaleQuantize<NonNullable<PrimitiveValue>>().domain([0, chartDimensions.width]).range(xValues);
  const xInvertedScale = scaleQuantize<NonNullable<PrimitiveValue>>().domain([0, panelSize.width]).range(xValues);

  // compute the cell width, can be smaller then the available size depending on config
  const cellWidth =
    heatmapTheme.cell.maxWidth !== 'fill' && xScale.bandwidth() > heatmapTheme.cell.maxWidth
      ? heatmapTheme.cell.maxWidth
      : xScale.bandwidth();

  // compute the cell height, we already computed the max size for that
  const cellHeight = yScale.bandwidth();

  // compute the position of each column label
  const textXValues = getXTicks(spec, heatmapTheme.xAxisLabel, xScale, heatmapTable.xValues);

  const { padding } = heatmapTheme.yAxisLabel;

  // compute the position of each row label
  const textYValues = boxedYValues.map<TextBox>((d) => {
    return {
      ...d,
      // position of the Y labels
      x: -pad(padding, 'right'),
      y: cellHeight / 2 + (yScale(d.value) || 0),
      align: 'right',
    };
  });

  const cellWidthInner = cellWidth - gridStrokeWidth;
  const cellHeightInner = cellHeight - gridStrokeWidth;

  if (colorToRgba(background.color)[3] < 1) {
    Logger.expected(
      'Text contrast requires a opaque background color, using fallbackColor',
      'an opaque color',
      background.color,
    );
  }

  // compute each available cell position, color and value
  const cellMap = table.reduce<Record<string, Cell>>((acc, d) => {
    const x = xScale(String(d.x));
    const y = yScale(String(d.y));
    const yIndex = yValues.indexOf(d.y);

    if (!isFiniteNumber(x) || !isFiniteNumber(y) || yIndex === -1) {
      return acc;
    }
    const cellBackgroundColor = colorScale(d.value);
    const cellKey = getCellKey(d.x, d.y);

    const formattedValue = spec.valueFormatter(d.value);

    const fontSize = maximiseFontSize(
      textMeasure,
      formattedValue,
      heatmapTheme.cell.label,
      heatmapTheme.cell.label.minFontSize,
      heatmapTheme.cell.label.maxFontSize,
      // adding 3px padding per side to avoid that text touches the edges
      cellWidthInner - 6,
      cellHeightInner - 6,
    );

    acc[cellKey] = {
      x:
        (heatmapTheme.cell.maxWidth !== 'fill' ? x + xScale.bandwidth() / 2 - heatmapTheme.cell.maxWidth / 2 : x) +
        gridStrokeWidth / 2,
      y: y + gridStrokeWidth / 2,
      yIndex,
      width: cellWidthInner,
      height: cellHeightInner,
      datum: d,
      fill: {
        color: colorToRgba(cellBackgroundColor),
      },
      stroke: {
        color: colorToRgba(heatmapTheme.cell.border.stroke),
        width: heatmapTheme.cell.border.strokeWidth,
      },
      value: d.value,
      visible: !isValueInRanges(d.value, bandsToHide),
      formatted: formattedValue,
      fontSize,
      textColor: fillTextColor(background.fallbackColor, cellBackgroundColor, background.color),
    };
    return acc;
  }, {});

  /**
   * Returns the corresponding x & y values of grid cell from the x & y positions
   * @param x
   * @param y
   */
  const pickGridCell = (x: Pixels, y: Pixels): GridCell | undefined => {
    if (x < chartDimensions.left || y < chartDimensions.top) return undefined;
    if (x > chartDimensions.width + chartDimensions.left || y > chartDimensions.top + chartDimensions.height)
      return undefined;

    const xValue = xInvertedScale(x - chartDimensions.left);
    const yValue = yInvertedScale(y);

    if (xValue === undefined || yValue === undefined) return undefined;

    return { x: xValue, y: yValue };
  };

  /**
   * Returns selected elements based on coordinates.
   * @param x
   * @param y
   */
  const pickQuads = (x: Pixels, y: Pixels): Array<Cell> | TextBox => {
    if (
      x > 0 &&
      x < chartDimensions.left &&
      y > chartDimensions.top &&
      y < chartDimensions.top + chartDimensions.height
    ) {
      // look up for a Y axis elements
      const yLabelKey = yInvertedScale(y);
      const yLabelValue = textYValues.find((v) => v.value === yLabelKey);
      if (yLabelValue) {
        return yLabelValue;
      }
    }

    if (x < chartDimensions.left || y < chartDimensions.top) {
      return [];
    }
    if (x > chartDimensions.width + chartDimensions.left || y > chartDimensions.top + chartDimensions.height) {
      return [];
    }
    const xValue = xInvertedScale(x - chartDimensions.left);
    const yValue = yInvertedScale(y);
    if (xValue === undefined || yValue === undefined) {
      return [];
    }
    const cellKey = getCellKey(xValue, yValue);
    const cell = cellMap[cellKey];
    if (cell) {
      return [cell];
    }
    return [];
  };

  /**
   * Return selected cells and X,Y ranges based on the drag selection.
   */
  const pickDragArea: PickDragFunction = (bound) => {
    const [start, end] = bound;

    const { left, top, width } = chartDimensions;
    const topLeft = [Math.min(start.x, end.x) - left, Math.min(start.y, end.y) - top];
    const bottomRight = [Math.max(start.x, end.x) - left, Math.max(start.y, end.y) - top];

    const startX = xInvertedScale(clamp(topLeft[0], 0, width));
    const endX = xInvertedScale(clamp(bottomRight[0], 0, width));
    const startY = yInvertedScale(clamp(topLeft[1], 0, panelSize.height - 1));
    const endY = yInvertedScale(clamp(bottomRight[1], 0, panelSize.height - 1));

    const allXValuesInRange: Array<NonNullable<PrimitiveValue>> = getValuesInRange(xValues, startX, endX);
    const allYValuesInRange: Array<NonNullable<PrimitiveValue>> = getValuesInRange(yValues, startY, endY);
    const invertedXValues: Array<NonNullable<PrimitiveValue>> =
      isRasterTimeScale(spec.xScale) && typeof endX === 'number'
        ? [startX, addIntervalToTime(endX, spec.xScale.interval, spec.timeZone)]
        : [...allXValuesInRange];
    const cells: Cell[] = [];

    allXValuesInRange.forEach((x) => {
      allYValuesInRange.forEach((y) => {
        const cellKey = getCellKey(x, y);
        cells.push(cellMap[cellKey]);
      });
    });

    return {
      cells: cells.filter(Boolean),
      x: invertedXValues,
      y: allYValuesInRange,
    };
  };

  /**
   * Resolves rect area based on provided X and Y ranges
   * @param x
   * @param y
   */
  const pickHighlightedArea: PickHighlightedArea = (
    x: Array<NonNullable<PrimitiveValue>>,
    y: Array<NonNullable<PrimitiveValue>>,
  ) => {
    const startValue = x[0];
    const endValue = x[x.length - 1];

    const leftIndex =
      typeof startValue === 'number' ? bisectLeft(xValues as number[], startValue) : xValues.indexOf(startValue);
    const rightIndex =
      typeof endValue === 'number' ? bisectLeft(xValues as number[], endValue) : xValues.indexOf(endValue) + 1;

    const isRightOutOfRange = rightIndex > xValues.length - 1 || rightIndex < 0;
    const isLeftOutOfRange = leftIndex > xValues.length - 1 || leftIndex < 0;

    const startFromScale = xScale(isLeftOutOfRange ? xValues[0] : xValues[leftIndex]);
    const endFromScale = xScale(isRightOutOfRange ? xValues[xValues.length - 1] : xValues[rightIndex]);

    if (startFromScale === undefined || endFromScale === undefined) {
      return null;
    }

    const xStart = chartDimensions.left + startFromScale;

    // extend the range in case the right boundary has been selected
    const width = endFromScale - startFromScale + (isRightOutOfRange || isLeftOutOfRange ? cellWidth : 0);

    // resolve Y coordinated making sure the order is correct
    const { y: yStart, totalHeight } = y
      .filter((v) => yValues.includes(v))
      .reduce(
        (acc, current, i) => {
          if (i === 0) {
            acc.y = yScale(current) || 0;
          }
          acc.totalHeight += cellHeight;
          return acc;
        },
        { y: 0, totalHeight: 0 },
      );
    return {
      x: xStart,
      y: yStart,
      width,
      height: totalHeight,
    };
  };

  /**
   * Resolves coordinates and metrics of the selected rect area.
   */
  const pickDragShape: PickDragShapeFunction = (bound) => {
    const area = pickDragArea(bound);
    return pickHighlightedArea(area.x, area.y);
  };

  const pickCursorBand: PickCursorBand = (x) => {
    // TODO for Linear scale we need to round the numerical interval. see also https://github.com/elastic/elastic-charts/issues/1701
    const roundedValue =
      isRasterTimeScale(spec.xScale) && isFiniteNumber(x)
        ? roundDateToESInterval(x, spec.xScale.interval, 'start', spec.timeZone)
        : x;

    const index = xValues.indexOf(roundedValue);
    return index < 0
      ? undefined
      : {
          width: cellWidth,
          x: chartDimensions.left + (xScale(xValues[index]) ?? NaN),
          y: chartDimensions.top,
          height: chartDimensions.height,
        };
  };

  // ordered left-right vertical lines
  const xLines = Array.from({ length: xValues.length + 1 }, (d, i) => {
    const xAxisExtension = i % elementSizes.xAxisTickCadence === 0 ? 5 : 0;
    return {
      x1: i * cellWidth,
      x2: i * cellWidth,
      y1: 0,
      y2: panelSize.height + xAxisExtension,
    };
  });

  // horizontal lines
  const yLines = Array.from({ length: elementSizes.visibleNumberOfRows + 1 }, (d, i) => ({
    x1: 0,
    x2: panelSize.width,
    y1: i * cellHeight,
    y2: i * cellHeight,
  }));

  const cells = Object.values(cellMap);
  const tableMinFontSize = cells.reduce((acc, { fontSize }) => Math.min(acc, fontSize), Infinity);
  // TODO introduce missing styles into axes.axisTitle
  const axisTitleFont: Visible & Font & { fontSize: Pixels } = {
    visible: axisTitle.visible,
    fontFamily: axisTitle.fontFamily,
    fontStyle: axisTitle.fontStyle ?? 'normal',
    fontVariant: 'normal',
    fontWeight: 'bold',
    textColor: axisTitle.fill,
    fontSize: axisTitle.fontSize,
  };

  return {
    theme: heatmapTheme,
    heatmapViewModels: getPerPanelMap(smScales, (anchor, h, v) => {
      const primaryColumn = smScales.vertical.domain[0] === v;
      const primaryRow = smScales.horizontal.domain[0] === h;

      return {
        anchor,
        panelSize,
        gridOrigin: {
          x: anchor.x + chartDimensions.left,
          y: anchor.y + chartDimensions.top,
        },
        gridLines: {
          x: xLines,
          y: yLines,
          stroke: {
            color: colorToRgba(heatmapTheme.grid.stroke.color),
            width: gridStrokeWidth,
          },
        },
        pageSize: elementSizes.visibleNumberOfRows,
        cells,
        cellFontSize: (cell: Cell) => (heatmapTheme.cell.label.useGlobalMinFontSize ? tableMinFontSize : cell.fontSize),
        xValues: textXValues,
        yValues: textYValues,
        primaryColumn,
        primaryRow,
        titles: [
          primaryColumn && {
            origin: {
              x: panelSize.width / 2,
              y:
                chartDimensions.top +
                chartDimensions.height +
                elementSizes.xAxis.height +
                innerPad(axisTitle.padding) +
                axisTitle.fontSize / 2,
            },
            ...axisTitleFont,
            text: spec.xAxisTitle,
            rotation: 0,
          },
          primaryRow && {
            origin: {
              x: -elementSizes.yAxis.left - innerPad(axisTitle.padding) - axisTitle.fontSize / 2,
              y: chartDimensions.top + panelSize.height / 2,
            },
            ...axisTitleFont,
            text: spec.yAxisTitle,
            rotation: -90,
          },
        ].filter(Boolean),
      };
    }),
    pickGridCell,
    pickQuads,
    pickDragArea,
    pickDragShape,
    pickHighlightedArea,
    pickCursorBand,
  };
}

function getCellKey(x: NonNullable<PrimitiveValue>, y: NonNullable<PrimitiveValue>) {
  return [String(x), String(y)].join('&_&');
}

/** @internal */
export function isValueInRanges(value: number, ranges: Array<[number, number]>) {
  return ranges.some(([min, max]) => min <= value && value < max);
}

/** @internal */
export function isRasterTimeScale(scale: RasterTimeScale | OrdinalScale | LinearScale): scale is RasterTimeScale {
  return scale.type === ScaleType.Time;
}

function getXTicks(
  spec: HeatmapSpec,
  style: HeatmapStyle['xAxisLabel'],
  scale: ScaleBand<NonNullable<PrimitiveValue>>,
  values: NonNullable<PrimitiveValue>[],
): Array<TextBox> {
  const isTimeScale = isRasterTimeScale(spec.xScale);
  const isRotated = style.rotation !== 0;
  return values.map<TextBox>((value) => {
    return {
      text: spec.xAxisLabelFormatter(value),
      value,
      isValue: false,
      ...style,
      y: style.fontSize / 2 + pad(style.padding, 'top'),
      x: (scale(value) ?? 0) + (isTimeScale ? 0 : scale.bandwidth() / 2),
      align: isRotated ? 'right' : isTimeScale ? 'left' : 'center',
    };
  });
}
