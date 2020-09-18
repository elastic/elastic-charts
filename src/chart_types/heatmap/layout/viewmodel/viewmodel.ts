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

import { max as d3Max, extent as d3Extent } from 'd3-array';
import { interpolateHcl } from 'd3-interpolate';
import { scaleBand, scaleLinear, scaleQuantile, scaleQuantize, scaleThreshold } from 'd3-scale';

import { ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { SettingsSpec } from '../../../../specs';
import { niceTimeFormatter } from '../../../../utils/data/formatters';
import { Pixels } from '../../../partition_chart/layout/types/geometry_types';
import { Box, TextMeasure } from '../../../partition_chart/layout/types/types';
import { stringToRGB } from '../../../partition_chart/layout/utils/color_library_wrappers';
import { HeatmapSpec } from '../../specs';
import { getPredicateFn } from '../../utils/commons';
import { Config } from '../types/config_types';
import {
  Cell,
  ColorScaleType,
  PickDragFunction,
  PickDragShapeFunction,
  ShapeViewModel,
} from '../types/viewmodel_types';
import { getGridCellHeight } from './grid';

export interface HeatmapCellDatum {
  x: string | number;
  y: string | number;
  value: number;
  originalIndex: number;
}
interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  // unique set of column values
  xValues: Array<string | number>;
  // unique set of row values
  yValues: Array<string | number>;
  extent: [number, number];
}

export interface TextBox extends Box {
  value: string | number;
  x: number;
  y: number;
}

const Y_LABEL_PADDING = 8;

/** @internal */
export function shapeViewModel(
  textMeasure: TextMeasure,
  spec: HeatmapSpec,
  config: Config,
  settingsSpec: SettingsSpec,
): ShapeViewModel {
  const {
    data,
    valueAccessor,
    xAccessor,
    yAccessor,
    xSortPredicate,
    ySortPredicate,
    colorScale: colorScaleSpec,
    xScaleType,
  } = spec;

  const gridStrokeWidth = config.grid.stroke.width ?? 1;

  const { xDomain = {} } = settingsSpec;

  const isXAxisTimeScale = xScaleType === ScaleType.Time;

  let isXValueValid = (x: string | number) => true;
  const minDate: Date | null = xDomain.min ? new Date(xDomain.min) : null;
  const maxDate: Date | null = xDomain.max ? new Date(xDomain.max) : null;

  // time scale with custom boundaries
  if (xScaleType === ScaleType.Time && (minDate || maxDate)) {
    isXValueValid = (v: number | string) => {
      const dateV = new Date(v);
      let isValid = false;
      if (minDate) {
        isValid = dateV >= minDate;
      }
      if (maxDate) {
        isValid = dateV <= maxDate;
      }
      return isValid;
    };
  }

  const resultData = data.reduce<HeatmapTable>(
    (acc, curr, index) => {
      const x = xAccessor(curr);

      if (!isXValueValid(x)) {
        return acc;
      }

      const y = yAccessor(curr);
      const value = valueAccessor(curr);

      // compute the data domain extent
      const [min, max] = acc.extent;
      acc.extent = [Math.min(min, value), Math.max(max, value)];

      acc.table.push({
        x,
        y,
        value: valueAccessor(curr),
        originalIndex: index,
      });

      if (!acc.xValues.includes(x)) {
        acc.xValues.push(x);
      }
      if (!acc.yValues.includes(y)) {
        acc.yValues.push(y);
      }

      return acc;
    },
    {
      table: [],
      xValues: [],
      yValues: [],
      extent: [+Infinity, -Infinity],
    },
  );

  const { table, yValues, extent } = resultData;
  let { xValues } = resultData;

  // sort values by their predicates
  xValues.sort(getPredicateFn(xSortPredicate));
  yValues.sort(getPredicateFn(ySortPredicate));

  // compute the color scale based domain and colors
  const { ranges = extent } = spec;
  const colorRange = spec.colors ?? ['green', 'red'];

  const colorScale = {
    type: colorScaleSpec,
  } as ColorScaleType;

  if (colorScale.type === ScaleType.Quantize) {
    colorScale.config = scaleQuantize<string>()
      .domain(d3Extent(ranges) as [number, number])
      .range(colorRange);
  } else if (colorScale.type === ScaleType.Quantile) {
    colorScale.config = scaleQuantile<string>()
      .domain(ranges)
      .range(colorRange);
  } else if (colorScale.type === ScaleType.Threshold) {
    colorScale.config = scaleThreshold<number, string>()
      .domain(ranges)
      .range(colorRange);
  } else {
    colorScale.config = scaleLinear<string>()
      .domain(ranges)
      .interpolate(interpolateHcl)
      .range(colorRange);
  }

  // measure the text width of all rows values to get the grid area width
  const boxedYValues = yValues.map<Box & { value: string | number }>((value) => {
    return {
      text: String(value),
      value,
      ...config.yAxisLabel,
    };
  });
  const measuredYValues = textMeasure(config.yAxisLabel.fontSize, boxedYValues);
  const maxTextWidth = (d3Max(measuredYValues, ({ width }) => width) || 0) + Y_LABEL_PADDING;
  const maxGridAreaWidth = config.width - maxTextWidth;

  // compute the grid area height removing the bottom axis
  const maxTextHeight = config.yAxisLabel.fontSize;
  const maxGridAreaHeight = config.height - maxTextHeight;

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

  if (isXAxisTimeScale) {
    const result = [];
    const timePoint = minDate?.getTime();
    while (timePoint < maxDate?.getTime()) {
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

  // compute the position of each row label
  const textYValues = boxedYValues.map<TextBox>((d) => {
    return {
      ...d,
      x: maxTextWidth,
      y: cellHeight / 2 + (yScale(d.value) || 0),
    };
  });

  // compute the position of each column label
  let textXValues: Array<TextBox> = [];
  if (isXAxisTimeScale) {
    const domain = xDomain ? [xDomain.min, xDomain.max] : d3Extent<number>(xValues as number[]);
    const formatter = niceTimeFormatter(domain as [number, number]);

    const timeScale = new ScaleContinuous({ type: ScaleType.Time, domain, range: [maxTextWidth, maxGridAreaWidth] });
    textXValues = timeScale.ticks().map<TextBox>((value) => {
      return {
        text: formatter(value),
        value,
        ...config.xAxisLabel,
        x: maxTextWidth + (timeScale.pureScale(value) || 0) + cellWidth / 2,
        y: maxGridAreaHeight + config.xAxisLabel.fontSize / 2,
      };
    });
  } else {
    // TODO remove overlapping labels or scale better the columns labels
    textXValues = xValues.map<TextBox>((value) => {
      return {
        text: String(value),
        value,
        ...config.xAxisLabel,
        x: maxTextWidth + (xScale(value) || 0) + cellWidth / 2,
        y: maxGridAreaHeight + config.xAxisLabel.fontSize / 2,
      };
    });
  }

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

  const pickQuads = (x: Pixels, y: Pixels): Array<Cell> => {
    if (x < maxTextWidth || y < 0) {
      return [];
    }
    if (x > maxTextWidth + config.width || y > config.height) {
      return [];
    }
    const xValue = xInvertedScale(x - maxTextWidth);
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
   * Return selected cells based on drag selection.
   * @param start
   * @param end
   */
  const pickDragArea: PickDragFunction = ([start, end]) => {
    const result: Cell[] = [];

    const startX = Math.min(start.x, end.x);
    const startY = Math.min(start.y, end.y);

    const endX = Math.max(start.x, end.x);
    const endY = Math.max(start.y, end.y);

    const [startPoint] = pickQuads(startX, startY);
    result.push(startPoint);

    let { x, y } = startPoint;
    x += cellWidth + maxTextWidth;

    while (y <= endY) {
      while (x <= endX) {
        result.push(pickQuads(x, y)[0]);
        x += cellWidth;
      }
      // move to the next line
      x = startPoint.x + maxTextWidth;
      y += cellHeight;
    }

    return result;
  };

  /**
   * Resolves coordinates and metrics of the selected rect area.
   * @param start
   * @param end
   */
  const pickDragShape: PickDragShapeFunction = ([start, end]) => {
    const startX = Math.min(start.x, end.x);
    const startY = Math.min(start.y, end.y);

    const endX = Math.max(start.x, end.x);
    const endY = Math.max(start.y, end.y);

    const [startPoint] = pickQuads(startX, startY);
    const [endPoint] = pickQuads(endX, endY);

    if (startPoint === undefined || endPoint === undefined) {
      return;
    }

    return {
      x: startPoint.x + maxTextWidth,
      y: startPoint.y,
      width: Math.abs(endPoint.x - startPoint.x) + cellWidth,
      height: Math.abs(endPoint.y - startPoint.y) + cellHeight,
    };
  };

  const xLines = [];
  for (let i = 0; i < xValues.length + 1; i++) {
    const x = maxTextWidth + i * cellWidth;
    xLines.push({ x1: x, y1: maxHeight, x2: x, y2: 0 });
  }
  const yLines = [];
  for (let i = 0; i < yValues.length + 1; i++) {
    const y = i * cellHeight;
    yLines.push({ x1: maxTextWidth, y1: y, x2: maxGridAreaWidth + maxTextWidth, y2: y });
  }

  return {
    config,
    heatmapViewModel: {
      gridOrigin: {
        x: maxTextWidth,
        y: 0,
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
    colorScale,
  };
}

function getCellKey(x: string | number, y: string | number) {
  return [String(x), String(y)].join('&_&');
}
