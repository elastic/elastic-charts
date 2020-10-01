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

import { bisectLeft } from 'd3-array';
import { scaleBand, scaleQuantize } from 'd3-scale';

import { ChartTypes } from '../../..';
import { ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { SettingsSpec } from '../../../../specs';
import { Dimensions } from '../../../../utils/dimensions';
import { Pixels } from '../../../partition_chart/layout/types/geometry_types';
import { Box, TextMeasure } from '../../../partition_chart/layout/types/types';
import { stringToRGB } from '../../../partition_chart/layout/utils/color_library_wrappers';
import { HeatmapSpec } from '../../specs';
import { HeatmapTable } from '../../state/selectors/compute_chart_dimensions';
import { ColorScaleType } from '../../state/selectors/get_color_scale';
import { Config } from '../types/config_types';
import { Cell, PickDragFunction, PickDragShapeFunction, ShapeViewModel } from '../types/viewmodel_types';
import { getGridCellHeight } from './grid';

export interface HeatmapCellDatum {
  x: string | number;
  y: string | number;
  value: number;
  originalIndex: number;
}

export interface TextBox extends Box {
  value: string | number;
  x: number;
  y: number;
}

function getTicksPerWidth(width: number) {
  if (width <= 100) {
    return 0;
  }
  if (width > 100 && width <= 200) {
    return 1;
  }
  if (width > 200 && width <= 300) {
    return 2;
  }
  if (width > 300 && width <= 500) {
    return 3;
  }
  if (width > 500 && width < 700) {
    return 5;
  }
  return 10;
}

/** @internal */
export function shapeViewModel(
  textMeasure: TextMeasure,
  spec: HeatmapSpec,
  config: Config,
  settingsSpec: SettingsSpec,
  chartDimensions: Dimensions,
  heatmapTable: HeatmapTable,
  colorScale: ColorScaleType,
): ShapeViewModel {
  const { xScaleType } = spec;

  const gridStrokeWidth = config.grid.stroke.width ?? 1;

  const isXAxisTimeScale = xScaleType === ScaleType.Time;

  const { table, yValues } = heatmapTable;
  const { xDomain } = heatmapTable;

  // measure the text width of all rows values to get the grid area width
  const boxedYValues = yValues.map<Box & { value: string | number }>((value) => {
    return {
      text: config.yAxisLabel.formatter(value),
      value,
      ...config.yAxisLabel,
    };
  });

  const maxGridAreaWidth = chartDimensions.width;
  const maxGridAreaHeight = chartDimensions.height;

  // compute the grid cell height
  const gridCellHeight = getGridCellHeight(yValues, config);
  const maxHeight = gridCellHeight * yValues.length;

  // compute the pageSize: how many rows can be fitted into the current panel height
  const pageSize: number =
    gridCellHeight > 0 && maxHeight > maxGridAreaHeight
      ? Math.floor(maxGridAreaHeight / gridCellHeight)
      : yValues.length;

  // compute the scale for the rows positions
  const yScale = scaleBand<string | number>()
    .domain(yValues)
    .range([0, maxHeight]);

  const yInvertedScale = scaleQuantize<string | number>()
    .domain([0, maxHeight])
    .range(yValues);

  let xValues = xDomain.domain;

  const timeScale =
    xDomain.scaleType === ScaleType.Time
      ? new ScaleContinuous(
          {
            type: ScaleType.Time,
            domain: xDomain.domain,
            range: [0, maxGridAreaWidth],
          },
          {
            ticks: getTicksPerWidth(chartDimensions.width),
            timeZone: 'UTC',
          },
        )
      : null;

  if (timeScale) {
    const result = [];
    let timePoint = xDomain.domain[0];
    while (timePoint < xDomain.domain[1]) {
      result.push(timePoint);
      timePoint += xDomain.minInterval;
    }

    xValues = result;
  }

  // compute the scale for the columns positions
  const xScale = scaleBand<string | number>()
    .domain(xValues)
    .range([0, maxGridAreaWidth]);

  const xInvertedScale = scaleQuantize<string | number>()
    .domain([0, maxGridAreaWidth])
    .range(xValues);

  // compute the cell width (can be smaller then the available size depending on config
  const cellWidth =
    config.cell.maxWidth !== 'fill' && xScale.bandwidth() > config.cell.maxWidth
      ? config.cell.maxWidth
      : xScale.bandwidth();

  // compute the cell height (we already computed the max size for that)
  const cellHeight = yScale.bandwidth();

  const getTextValue = (
    formatter: (v: any, options: any) => string,
    scaleCallback: (x: any) => number | undefined | null = xScale,
  ) => (value: any): TextBox => {
    return {
      text: formatter(value, { timeZone: 'UTC' }),
      value,
      ...config.xAxisLabel,
      x: chartDimensions.left + (scaleCallback(value) || 0),
      y: cellHeight * pageSize + config.xAxisLabel.fontSize / 2 + config.xAxisLabel.padding,
    };
  };

  // compute the position of each column label
  let textXValues: Array<TextBox> = [];
  if (timeScale) {
    textXValues = timeScale
      .ticks()
      .map<TextBox>(getTextValue(config.xAxisLabel.formatter, (x: any) => timeScale.scale(x)));
  } else {
    // TODO remove overlapping labels or scale better the columns labels
    textXValues = xValues.map<TextBox>((textBox: any) => {
      const textValue = getTextValue(config.xAxisLabel.formatter)(textBox);
      return {
        ...textValue,
        x: chartDimensions.left + (xScale(textBox) || 0) + xScale.bandwidth() / 2,
      };
    });
  }

  const { padding } = config.yAxisLabel;
  const rightPadding = typeof padding === 'number' ? padding : padding.right ?? 0;

  // compute the position of each row label
  const textYValues = boxedYValues.map<TextBox>((d) => {
    return {
      ...d,
      // position of the Y labels
      x: chartDimensions.left - rightPadding,
      y: cellHeight / 2 + (yScale(d.value) || 0),
    };
  });

  // compute each available cell position, color and value
  const cellMap = table.reduce<Record<string, Cell>>((acc, d) => {
    const x = xScale(String(d.x));
    const y = yScale(String(d.y))! + gridStrokeWidth;
    const yIndex = yValues.indexOf(d.y);
    const color = colorScale.config(d.value);
    if (x === undefined || y === undefined || yIndex === -1) {
      return acc;
    }
    const cellKey = getCellKey(d.x, d.y);
    acc[cellKey] = {
      x:
        (config.cell.maxWidth !== 'fill' ? x + xScale.bandwidth() / 2 - config.cell.maxWidth / 2 : x) + gridStrokeWidth,
      y,
      yIndex,
      width: cellWidth - gridStrokeWidth * 2,
      height: cellHeight - gridStrokeWidth * 2,
      datum: d,
      fill: {
        color: stringToRGB(color),
      },
      stroke: {
        color: stringToRGB(config.cell.border.stroke),
        width: config.cell.border.strokeWidth,
      },
      value: d.value,
      formatted: spec.valueFormatter(d.value),
    };
    return acc;
  }, {});

  /**
   * Returns selected elements based on coordinates.
   * @param x
   * @param y
   */
  const pickQuads = (x: Pixels, y: Pixels): Array<Cell> | TextBox => {
    if (x > 0 && x < chartDimensions.left && y > chartDimensions.top && y < chartDimensions.height) {
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
    if (x > chartDimensions.width + chartDimensions.left || y > chartDimensions.height) {
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
   * Resolves coordinates and metrics of the selected rect area.
   * @param start
   * @param end
   */
  const pickDragShape: PickDragShapeFunction = ([start, end]) => {
    const startX = Math.max(Math.min(start.x, end.x), chartDimensions.left) - chartDimensions.left;
    const startY = Math.min(start.y, end.y);

    const endX = Math.min(Math.max(start.x, end.x), chartDimensions.width + cellWidth) - chartDimensions.left;
    const endY = Math.min(Math.max(start.y, end.y), maxHeight - chartDimensions.top - cellHeight);

    const startXValue = Math.floor(startX / cellWidth) * cellWidth;
    const startYValue = Math.floor(startY / cellHeight) * cellHeight;

    const endXValue = Math.floor(endX / cellWidth) * cellWidth;
    const endYValue = Math.floor(endY / cellHeight) * cellHeight;

    return {
      x: startXValue + chartDimensions.left,
      y: startYValue,
      width: Math.abs(endXValue - startXValue) + cellWidth,
      height: Math.abs(endYValue - startYValue) + cellHeight,
    };
  };

  /**
   * Return selected cells and X,Y ranges based on the drag selection.
   */
  const pickDragArea: PickDragFunction = (bound) => {
    const result = {
      cells: [] as Cell[],
      x: new Set(),
      y: new Set(),
    };

    const shape = pickDragShape(bound);

    let { x, y } = shape;

    while (y < shape.height + shape.y) {
      result.y.add(yInvertedScale(y - chartDimensions.top));
      while (x <= shape.width + shape.x) {
        const xValue = xInvertedScale(x - chartDimensions.left);
        result.x.add(xValue);
        const [cell] = pickQuads(x, y);
        if (cell) {
          result.cells.push(cell);
        }
        x += cellWidth + config.grid.stroke.width;
        // set value to close the time range
        result.x.add(xInvertedScale(x - chartDimensions.left));
      }
      // move to the next line
      x = shape.x;
      y += cellHeight;
    }

    const xArr = [...result.x];

    if (timeScale) {
      // extend the range in case the right boundary has been selected
      const maxValue = xArr[xArr.length - 1] as number;
      if (maxValue === xValues[xValues.length - 1]) {
        xArr.push(maxValue + xDomain.minInterval);
      }
    }

    return {
      ...result,
      x: isXAxisTimeScale ? [xArr[0], xArr[xArr.length - 1]] : xArr,
      y: [...result.y],
      chartType: ChartTypes.Heatmap,
    };
  };

  /**
   * Resolves rect area based on provided X and Y ranges
   * @param x
   * @param y
   */
  const pickHighlightedArea = (x: any[], y: any[]) => {
    let xStart = 0;
    let width = 0;
    if (xDomain.scaleType === ScaleType.Time) {
      const [start, end] = x;
      try {
        // find X coordinated based on the time range
        const leftIndex = bisectLeft(xValues, start);
        let rightIndex = bisectLeft(xValues, end);

        const isOutOfRange = rightIndex >= xValues.length - 1;

        rightIndex = isOutOfRange ? xValues.length - 1 : rightIndex;

        const startFromScale = xScale(xValues[leftIndex]);
        const endFromScale = xScale(xValues[rightIndex]);

        xStart = startFromScale! + chartDimensions.left;

        // extend the range in case the right boundary has been selected
        width = endFromScale! - startFromScale! + (isOutOfRange ? cellWidth : 0);
      } catch {
        throw new Error("Couldn't resolve the time range");
      }
    }

    // resolve Y coordinated making sure the order is correct
    const { y: yStart, height } = y.reduce(
      (acc, current, i) => {
        if (i === 0) {
          acc.y = yScale(current);
        }
        acc.height += cellHeight;
        return acc;
      },
      { y: 0, height: 0 },
    );

    return {
      x: xStart,
      y: yStart,
      width,
      height,
    };
  };

  // vertical lines
  const xLines = [];
  for (let i = 0; i < xValues.length + 1; i++) {
    const x = chartDimensions.left + i * cellWidth;
    const y1 = chartDimensions.top;
    const y2 = cellHeight * pageSize;
    xLines.push({ x1: x, y1, x2: x, y2 });
  }
  // horizontal lines
  const yLines = [];
  for (let i = 0; i < pageSize + 1; i++) {
    const y = i * cellHeight;
    yLines.push({ x1: chartDimensions.left, y1: y, x2: chartDimensions.width + chartDimensions.left, y2: y });
  }

  return {
    config,
    heatmapViewModel: {
      gridOrigin: {
        x: chartDimensions.left,
        y: chartDimensions.top,
      },
      gridLines: {
        x: xLines,
        y: yLines,
        stroke: {
          color: stringToRGB(config.grid.stroke.color),
          width: gridStrokeWidth,
        },
      },
      pageSize,
      cells: Object.values(cellMap),
      xValues: textXValues,
      yValues: textYValues,
    },
    pickQuads,
    pickDragArea,
    pickDragShape,
    pickHighlightedArea,
  };
}

function getCellKey(x: string | number, y: string | number) {
  return [String(x), String(y)].join('&_&');
}
