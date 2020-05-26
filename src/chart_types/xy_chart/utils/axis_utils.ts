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
 * under the License. */

import { XDomain } from '../domains/x_domain';
import { YDomain } from '../domains/y_domain';
import {
  AxisSpec,
  CompleteBoundedDomain,
  DomainRange,
  LowerBoundedDomain,
  TickFormatter,
  UpperBoundedDomain,
  AxisStyle,
  TickFormatterOptions,
} from './specs';
import { Position, Rotation, Range } from '../../../utils/commons';
import { AxisConfig, Theme } from '../../../utils/themes/theme';
import { Dimensions, Margins } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { ScaleType } from '../../../scales';
import { BBox, BBoxCalculator } from '../../../utils/bbox/bbox_calculator';
import { getSpecsById } from '../state/utils';
import { AxisTicksDimensions, TickLabelProps, AxisLinePosition, AxisTick } from '../axes/types';
import { BaseScale, getContinuousScale, getOrdinalScale } from '../../../scales/base';
import { PrimitiveValue } from '../../partition_chart/layout/utils/group_by_rollup';

/**
 * Compute the ticks values and identify max width and height of the labels
 * so we can compute the max space occupied by the axis component.
 * @param axisSpec the spec of the axis
 * @param xDomain the x domain associated
 * @param yDomain the y domain array
 * @param totalBarsInCluster the total number of grouped series
 * @param bboxCalculator an instance of the boundingbox calculator
 * @param chartRotation the rotation of the chart
 * @internal
 */
export function computeAxisTicksDimensions(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  bboxCalculator: BBoxCalculator,
  chartRotation: Rotation,
  axisConfig: AxisConfig,
): AxisTicksDimensions | null {
  if (axisSpec.hide) {
    return null;
  }
  const scale = getScaleForAxisSpec(axisSpec, xDomain, yDomain, chartRotation, [0, 1]);
  if (!scale) {
    throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
  }

  const tickLabelPadding = getAxisTickLabelPadding(axisConfig.tickLabelStyle.padding, axisSpec.style);

  return computeTickDimensions(
    scale.ticks(),
    axisSpec.tickFormat,
    bboxCalculator,
    axisConfig,
    tickLabelPadding,
    axisSpec.tickLabelRotation,
    {
      timeZone: xDomain.timeZone,
    },
  );
}

/** @internal */
export function getAxisTickLabelPadding(axisConfigTickLabelPadding: number, axisSpecStyle?: AxisStyle): number {
  if (axisSpecStyle && axisSpecStyle.tickLabelPadding !== undefined) {
    return axisSpecStyle.tickLabelPadding;
  }
  return axisConfigTickLabelPadding;
}

/** @internal */
export function isYDomain(position: Position, chartRotation: Rotation): boolean {
  const isStraightRotation = chartRotation === 0 || chartRotation === 180;
  if (isVerticalAxis(position)) {
    return isStraightRotation;
  }

  return !isStraightRotation;
}

/** @internal */
export function getScaleForAxisSpec(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  chartRotation: Rotation,
  range: Range,
  isHistogram = false,
  barsPadding?: number,
  maxTicks?: number,
): BaseScale<number> | BaseScale<NonNullable<PrimitiveValue>> | null {
  const axisIsYDomain = isYDomain(axisSpec.position, chartRotation);

  if (axisIsYDomain) {
    const domain = yDomain.find((domain) => domain.groupId === axisSpec.groupId);
    if (!domain) {
      return null;
    }
    return getContinuousScale(domain.scaleType, range, domain.domain, maxTicks, xDomain.timeZone);
  } else {
    const { scaleType, domain, isBandScale, minInterval, timeZone } = xDomain;
    if (scaleType === ScaleType.Ordinal) {
      return getOrdinalScale(range, domain, barsPadding);
    } else {
      const [min, max] = domain;
      const count = Math.ceil((max - min) / minInterval);
      const maxWidth = range[1] - range[0];
      if (!isHistogram && isBandScale && maxWidth / count >= 1) {
        const filledDomain = [];
        for (let i = 0; i <= count; i++) {
          filledDomain.push(min + i * minInterval);
        }
        return getOrdinalScale(range, filledDomain);
      } else {
        const cDomain = isHistogram ? [domain[0], domain[1] + minInterval] : domain;
        return getContinuousScale(scaleType, range, cDomain, maxTicks, timeZone);
      }
    }
  }
}

/** @internal */
export function computeRotatedLabelDimensions(unrotatedDims: BBox, degreesRotation: number): BBox {
  const { width, height } = unrotatedDims;

  const radians = (degreesRotation * Math.PI) / 180;

  const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));

  return {
    width: rotatedWidth,
    height: rotatedHeight,
  };
}

/** @internal */
export const getMaxBboxDimensions = (
  bboxCalculator: BBoxCalculator,
  fontSize: number,
  fontFamily: string,
  tickLabelRotation: number,
  tickLabelPadding: number,
) => (
  acc: { [key: string]: number },
  tickLabel: string,
): {
  maxLabelBboxWidth: number;
  maxLabelBboxHeight: number;
  maxLabelTextWidth: number;
  maxLabelTextHeight: number;
} => {
  const bbox = bboxCalculator.compute(tickLabel, tickLabelPadding, fontSize, fontFamily);

  const rotatedBbox = computeRotatedLabelDimensions(bbox, tickLabelRotation);

  const width = Math.ceil(rotatedBbox.width);
  const height = Math.ceil(rotatedBbox.height);
  const labelWidth = Math.ceil(bbox.width);
  const labelHeight = Math.ceil(bbox.height);

  const prevWidth = acc.maxLabelBboxWidth;
  const prevHeight = acc.maxLabelBboxHeight;
  const prevLabelWidth = acc.maxLabelTextWidth;
  const prevLabelHeight = acc.maxLabelTextHeight;
  return {
    maxLabelBboxWidth: prevWidth > width ? prevWidth : width,
    maxLabelBboxHeight: prevHeight > height ? prevHeight : height,
    maxLabelTextWidth: prevLabelWidth > labelWidth ? prevLabelWidth : labelWidth,
    maxLabelTextHeight: prevLabelHeight > labelHeight ? prevLabelHeight : labelHeight,
  };
};

function computeTickDimensions(
  tickValues: any[],
  tickFormat: TickFormatter,
  bboxCalculator: BBoxCalculator,
  { tickLabelStyle: { fontFamily, fontSize } }: AxisConfig,
  tickLabelPadding: number,
  tickLabelRotation = 0,
  tickFormatOptions?: TickFormatterOptions,
) {
  const tickLabels = tickValues.map((d) => {
    return tickFormat(d, tickFormatOptions);
  });

  const bbox = tickLabels.reduce(
    getMaxBboxDimensions(bboxCalculator, fontSize, fontFamily, tickLabelRotation, tickLabelPadding),
    { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 },
  );
  return {
    tickValues,
    tickLabels,
    ...bbox,
  };
}

/**
 * Gets the computed x/y coordinates & alignment properties for an axis tick label.
 * @param isVerticalAxis if the axis is vertical (in contrast to horizontal)
 * @param tickLabelRotation degree of rotation of the tick label
 * @param tickSize length of tick line
 * @param tickPadding amount of padding between label and tick line
 * @param tickPosition position of tick relative to axis line origin and other ticks along it
 * @param position position of where the axis sits relative to the visualization
 * @param axisTicksDimensions computed axis dimensions and values (from computeTickDimensions)
 * @internal
 */
export function getTickLabelProps(
  tickLabelRotation: number,
  tickSize: number,
  tickPadding: number,
  tickPosition: number,
  position: Position,
  axisPosition: Dimensions,
  axisTickDimensions: Pick<AxisTicksDimensions, 'maxLabelBboxWidth' | 'maxLabelBboxHeight'>,
): TickLabelProps {
  const { maxLabelBboxWidth, maxLabelBboxHeight } = axisTickDimensions;
  const isRotated = tickLabelRotation !== 0;
  if (isVerticalAxis(position)) {
    const isLeftAxis = position === Position.Left;
    const x = isLeftAxis ? axisPosition.width - tickSize - tickPadding : tickSize + tickPadding;
    const offsetX = isLeftAxis ? -maxLabelBboxWidth / 2 : maxLabelBboxWidth / 2;
    return {
      x,
      y: tickPosition,
      offsetX,
      offsetY: 0,
      align: isRotated ? 'center' : isLeftAxis ? 'right' : 'left',
      verticalAlign: 'middle',
    };
  }

  const isAxisTop = position === Position.Top;

  return {
    x: tickPosition,
    y: isAxisTop ? axisPosition.height - tickSize - tickPadding : tickSize + tickPadding,
    offsetX: 0,
    offsetY: isAxisTop ? -maxLabelBboxHeight / 2 : maxLabelBboxHeight / 2,
    align: 'center',
    verticalAlign: isRotated ? 'middle' : isAxisTop ? 'bottom' : 'top',
  };
}

/** @internal */
export function getVerticalAxisTickLineProps(
  position: Position,
  axisWidth: number,
  tickSize: number,
  tickPosition: number,
): AxisLinePosition {
  const isLeftAxis = position === Position.Left;
  const y = tickPosition;
  const x1 = isLeftAxis ? axisWidth : 0;
  const x2 = isLeftAxis ? axisWidth - tickSize : tickSize;

  return [x1, y, x2, y];
}

/** @internal */
export function getHorizontalAxisTickLineProps(
  position: Position,
  axisHeight: number,
  tickSize: number,
  tickPosition: number,
): AxisLinePosition {
  const isTopAxis = position === Position.Top;
  const x = tickPosition;
  const y1 = isTopAxis ? axisHeight - tickSize : 0;
  const y2 = isTopAxis ? axisHeight : tickSize;

  return [x, y1, x, y2];
}

/** @internal */
export function getVerticalAxisGridLineProps(tickPosition: number, chartWidth: number): AxisLinePosition {
  return [0, tickPosition, chartWidth, tickPosition];
}

/** @internal */
export function getHorizontalAxisGridLineProps(tickPosition: number, chartHeight: number): AxisLinePosition {
  return [tickPosition, 0, tickPosition, chartHeight];
}

/**
 * Get the min and the max range value to compute the axis scale.
 * Depends on the orientation of the axis (left/right,top/bottom)
 * @internal
 * @param axisPosition the axis position
 * @param chartRotation the chart rotation
 * @param chartDimensions the chart dimensions
 * @returns the Range
 */
export function getMinMaxRange(axisPosition: Position, chartRotation: Rotation, chartDimensions: Dimensions): Range {
  const { width, height } = chartDimensions;
  switch (axisPosition) {
    case Position.Bottom:
    case Position.Top:
      return getBottomTopAxisMinMaxRange(chartRotation, width);
    case Position.Left:
    case Position.Right:
      return getLeftAxisMinMaxRange(chartRotation, height);
  }
}

/**
 * The the min/max range for an horizontal axis
 * @param chartRotation the chart rotation
 * @param width the width of the chart
 * @returns the Range
 */
function getBottomTopAxisMinMaxRange(chartRotation: Rotation, width: number): Range {
  switch (chartRotation) {
    case 0: // dealing with x domain
    case 90: // dealing with y domain (the y domain is lying horizontally)
      return [0, width];
    case 180: // dealing with x domain
    case -90: // dealing with y domain (the y domain is lying horizontally)
      return [width, 0];
  }
}
/**
 * The the min/max range for a vertical axis
 * @param chartRotation the chart rotation
 * @param height the height of the chart
 * @returns the Range
 */
function getLeftAxisMinMaxRange(chartRotation: Rotation, height: number): Range {
  switch (chartRotation) {
    case 0: // dealing with y domain
    case -90: // dealing with x domain (the x domain is lying vertically)
      return [height, 0];
    case 180: // dealing with y domain
    case 90: // dealing with x domain (the x domain is lying vertically)
      return [0, height];
  }
}

/** @internal */
export function getAvailableTicks(
  { showDuplicatedTicks, tickFormat }: AxisSpec,
  scale: BaseScale<number> | BaseScale<NonNullable<PrimitiveValue>>,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const ticks = scale.ticks();
  return ticks.reduce<{ ticks: AxisTick[]; lastTickLabel: string | null }>(
    (acc, tick) => {
      const scaledValue =
        typeof tick === 'number'
          ? (scale as BaseScale<number>).scale(tick)
          : (scale as BaseScale<NonNullable<PrimitiveValue>>).scale(tick);
      if (scaledValue === null) {
        return acc;
      }
      const label = tickFormat(tick, tickFormatOptions);

      // hide duplicated consecutive labels
      const differFromLastLabel = label !== acc.lastTickLabel;
      if (differFromLastLabel || showDuplicatedTicks) {
        acc.ticks.push({
          value: tick,
          label,
          position: scaledValue,
        });
      }

      acc.lastTickLabel = label;
      return acc;
    },
    { ticks: [], lastTickLabel: null },
  ).ticks;
}

/** @internal */
export function getVisibleTicks(allTicks: AxisTick[], axisSpec: AxisSpec, axisDim: AxisTicksDimensions): AxisTick[] {
  // We sort the ticks by position so that we can incrementally compute previousOccupiedSpace
  allTicks.sort((a: AxisTick, b: AxisTick) => a.position - b.position);

  const { showOverlappingTicks, showOverlappingLabels } = axisSpec;
  const { maxLabelBboxHeight, maxLabelBboxWidth } = axisDim;

  const requiredSpace = isVerticalAxis(axisSpec.position) ? maxLabelBboxHeight / 2 : maxLabelBboxWidth / 2;

  let previousOccupiedSpace = 0;
  const visibleTicks = [];
  for (let i = 0; i < allTicks.length; i++) {
    const { position } = allTicks[i];

    if (i === 0) {
      visibleTicks.push(allTicks[i]);
      previousOccupiedSpace = position + requiredSpace;
    } else if (position - requiredSpace >= previousOccupiedSpace) {
      visibleTicks.push(allTicks[i]);
      previousOccupiedSpace = position + requiredSpace;
    } else {
      // still add the tick but without a label
      if (showOverlappingTicks || showOverlappingLabels) {
        const overlappingTick = {
          ...allTicks[i],
          label: showOverlappingLabels ? allTicks[i].label : '',
        };
        visibleTicks.push(overlappingTick);
      }
    }
  }
  return visibleTicks;
}

/** @internal */
export function getAxisPosition(
  chartDimensions: Dimensions,
  chartMargins: Margins,
  axisTitleHeight: number,
  axisSpec: AxisSpec,
  axisDim: AxisTicksDimensions,
  cumTopSum: number,
  cumBottomSum: number,
  cumLeftSum: number,
  cumRightSum: number,
) {
  const { position, tickSize, tickPadding } = axisSpec;
  const { maxLabelBboxHeight, maxLabelBboxWidth } = axisDim;
  const { top, left, height, width } = chartDimensions;
  const dimensions = {
    top,
    left,
    width,
    height,
  };
  let topIncrement = 0;
  let bottomIncrement = 0;
  let leftIncrement = 0;
  let rightIncrement = 0;

  if (isVerticalAxis(position)) {
    const dimWidth = maxLabelBboxWidth + tickSize + tickPadding + axisTitleHeight;
    if (position === Position.Left) {
      leftIncrement = dimWidth + chartMargins.left;
      dimensions.left = cumLeftSum + chartMargins.left;
    } else {
      rightIncrement = dimWidth + chartMargins.right;
      dimensions.left = left + width + cumRightSum;
    }
    dimensions.width = dimWidth;
  } else {
    const dimHeight = maxLabelBboxHeight + tickSize + tickPadding + axisTitleHeight;
    if (position === Position.Top) {
      topIncrement = dimHeight + chartMargins.top;
      dimensions.top = cumTopSum + chartMargins.top;
    } else {
      bottomIncrement = dimHeight + chartMargins.bottom;
      dimensions.top = top + height + cumBottomSum;
    }
    dimensions.height = dimHeight;
  }

  return { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement };
}

/** @internal */
export function isVerticalAxis(axisPosition: Position) {
  return axisPosition === Position.Left || axisPosition === Position.Right;
}

/** @internal */
export function isHorizontalAxis(axisPosition: Position) {
  return axisPosition === Position.Top || axisPosition === Position.Bottom;
}

/** @internal */
export function isVerticalGrid(axisPosition: Position) {
  return isHorizontalAxis(axisPosition);
}

/** @internal */
export function isHorizontalGrid(axisPosition: Position) {
  return isVerticalAxis(axisPosition);
}

/** @internal */
export function getAxisTicksPositions(
  computedChartDims: {
    chartDimensions: Dimensions;
    leftMargin: number;
  },
  chartTheme: Theme,
  chartRotation: Rotation,
  axisSpecs: AxisSpec[],
  axisDimensions: Map<AxisId, AxisTicksDimensions>,
  xDomain: XDomain,
  yDomain: YDomain[],
  isHistogramModeOn: boolean,
  barsPadding?: number,
): {
  axisPositions: Map<AxisId, Dimensions>;
  axisTicks: Map<AxisId, AxisTick[]>;
  axisVisibleTicks: Map<AxisId, AxisTick[]>;
  axisGridLinesPositions: Map<AxisId, AxisLinePosition[]>;
} {
  const { chartPaddings, chartMargins } = chartTheme;
  const axisPositions: Map<AxisId, Dimensions> = new Map();
  const axisVisibleTicks: Map<AxisId, AxisTick[]> = new Map();
  const axisTicks: Map<AxisId, AxisTick[]> = new Map();
  const axisGridLinesPositions: Map<AxisId, AxisLinePosition[]> = new Map();
  const { chartDimensions } = computedChartDims;
  let cumTopSum = 0;
  let cumBottomSum = chartPaddings.bottom;
  let cumLeftSum = computedChartDims.leftMargin;
  let cumRightSum = chartPaddings.right;

  axisDimensions.forEach((axisDim, id) => {
    const axisSpec = getSpecsById<AxisSpec>(axisSpecs, id);

    // Consider refactoring this so this condition can be tested
    // Given some of the values that get passed around, maybe re-write as a reduce instead of forEach?
    if (!axisSpec) {
      return;
    }
    // get the axis ranges
    const range = getMinMaxRange(axisSpec.position, chartRotation, chartDimensions);

    // get the axis scale

    const scale = getScaleForAxisSpec(
      axisSpec,
      xDomain,
      yDomain,
      chartRotation,
      range,
      isHistogramModeOn,
      barsPadding,
      axisSpec.ticks,
    );

    if (!scale) {
      throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
    }

    const allTicks = getAvailableTicks(axisSpec, scale);
    const visibleTicks = getVisibleTicks(allTicks, axisSpec, axisDim);

    if (axisSpec.showGridLines) {
      const isVertical = isVerticalAxis(axisSpec.position);
      const gridLines = visibleTicks.map(
        (tick: AxisTick): AxisLinePosition => {
          return computeAxisGridLinePositions(isVertical, tick.position, chartDimensions);
        },
      );
      axisGridLinesPositions.set(id, gridLines);
    }

    const { fontSize, padding } = chartTheme.axes.axisTitleStyle;

    const axisTitleHeight = axisSpec.title !== undefined ? fontSize + padding : 0;
    const axisPosition = getAxisPosition(
      chartDimensions,
      chartMargins,
      axisTitleHeight,
      axisSpec,
      axisDim,
      cumTopSum,
      cumBottomSum,
      cumLeftSum,
      cumRightSum,
    );

    cumTopSum += axisPosition.topIncrement;
    cumBottomSum += axisPosition.bottomIncrement;
    cumLeftSum += axisPosition.leftIncrement;
    cumRightSum += axisPosition.rightIncrement;
    axisPositions.set(id, axisPosition.dimensions);
    axisVisibleTicks.set(id, visibleTicks);
    axisTicks.set(id, allTicks);
  });
  return {
    axisPositions,
    axisTicks,
    axisVisibleTicks,
    axisGridLinesPositions,
  };
}

/** @internal */
export function computeAxisGridLinePositions(
  isVerticalAxis: boolean,
  tickPosition: number,
  chartDimensions: Dimensions,
): AxisLinePosition {
  const positions = isVerticalAxis
    ? getVerticalAxisGridLineProps(tickPosition, chartDimensions.width)
    : getHorizontalAxisGridLineProps(tickPosition, chartDimensions.height);

  return positions;
}

/** @internal */
export function isLowerBound(domain: Partial<CompleteBoundedDomain>): domain is LowerBoundedDomain {
  return domain.min != null;
}

/** @internal */
export function isUpperBound(domain: Partial<CompleteBoundedDomain>): domain is UpperBoundedDomain {
  return domain.max != null;
}

/** @internal */
export function isCompleteBound(domain: Partial<CompleteBoundedDomain>): domain is CompleteBoundedDomain {
  return domain.max != null && domain.min != null;
}

/** @internal */
export function isBounded(domain: Partial<CompleteBoundedDomain>): domain is DomainRange {
  return domain.max != null || domain.min != null;
}

/** @internal */
export const isDuplicateAxis = (
  { position, title }: AxisSpec,
  { tickLabels }: AxisTicksDimensions,
  tickMap: Map<AxisId, AxisTicksDimensions>,
  specs: AxisSpec[],
): boolean => {
  const firstTickLabel = tickLabels[0];
  const lastTickLabel = tickLabels.slice(-1)[0];

  let hasDuplicate = false;
  tickMap.forEach(({ tickLabels: axisTickLabels }, axisId) => {
    if (
      !hasDuplicate &&
      axisTickLabels &&
      tickLabels.length === axisTickLabels.length &&
      firstTickLabel === axisTickLabels[0] &&
      lastTickLabel === axisTickLabels.slice(-1)[0]
    ) {
      const spec = getSpecsById<AxisSpec>(specs, axisId);

      if (spec && spec.position === position && title === spec.title) {
        hasDuplicate = true;
      }
    }
  });

  return hasDuplicate;
};
