import { XDomain } from '../domains/x_domain';
import { YDomain } from '../domains/y_domain';
import { computeXScale, computeYScales } from './scales';
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
import { Position, Rotation } from '../../../utils/commons';
import { AxisConfig, Theme } from '../../../utils/themes/theme';
import { Dimensions, Margins } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { Scale } from '../../../scales';
import { BBox, BBoxCalculator } from '../../../utils/bbox/bbox_calculator';
import { getSpecsById } from '../state/utils';

export type AxisLinePosition = [number, number, number, number];

export interface AxisTick {
  value: number | string;
  label: string;
  position: number;
}

export interface AxisTicksDimensions {
  tickValues: string[] | number[];
  tickLabels: string[];
  maxLabelBboxWidth: number;
  maxLabelBboxHeight: number;
  maxLabelTextWidth: number;
  maxLabelTextHeight: number;
}

export interface TickLabelProps {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  align: string;
  verticalAlign: string;
}

/**
 * Compute the ticks values and identify max width and height of the labels
 * so we can compute the max space occupied by the axis component.
 * @param axisSpec the spec of the axis
 * @param xDomain the x domain associated
 * @param yDomain the y domain array
 * @param totalBarsInCluster the total number of grouped series
 * @param bboxCalculator an instance of the boundingbox calculator
 * @param chartRotation the rotation of the chart
 */
export function computeAxisTicksDimensions(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  totalBarsInCluster: number,
  bboxCalculator: BBoxCalculator,
  chartRotation: Rotation,
  axisConfig: AxisConfig,
  barsPadding?: number,
  enableHistogramMode?: boolean,
): AxisTicksDimensions | null {
  if (axisSpec.hide) {
    return null;
  }

  const scale = getScaleForAxisSpec(
    axisSpec,
    xDomain,
    yDomain,
    totalBarsInCluster,
    chartRotation,
    0,
    1,
    barsPadding,
    enableHistogramMode,
  );
  if (!scale) {
    throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
  }

  const tickLabelPadding = getAxisTickLabelPadding(axisConfig.tickLabelStyle.padding, axisSpec.style);

  const dimensions = computeTickDimensions(
    scale,
    axisSpec.tickFormat,
    bboxCalculator,
    axisConfig,
    tickLabelPadding,
    axisSpec.tickLabelRotation,
    {
      timeZone: xDomain.timeZone,
    },
  );

  return {
    ...dimensions,
  };
}

export function getAxisTickLabelPadding(axisConfigTickLabelPadding: number, axisSpecStyle?: AxisStyle): number {
  if (axisSpecStyle && axisSpecStyle.tickLabelPadding !== undefined) {
    return axisSpecStyle.tickLabelPadding;
  }
  return axisConfigTickLabelPadding;
}

export function isYDomain(position: Position, chartRotation: Rotation): boolean {
  const isStraightRotation = chartRotation === 0 || chartRotation === 180;
  if (isVerticalAxis(position)) {
    return isStraightRotation;
  }

  return !isStraightRotation;
}

export function getScaleForAxisSpec(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  totalBarsInCluster: number,
  chartRotation: Rotation,
  minRange: number,
  maxRange: number,
  barsPadding?: number,
  enableHistogramMode?: boolean,
): Scale | null {
  const axisIsYDomain = isYDomain(axisSpec.position, chartRotation);
  const range: [number, number] = [minRange, maxRange];
  if (axisIsYDomain) {
    const yScales = computeYScales({
      yDomains: yDomain,
      range,
      ticks: axisSpec.ticks,
      integersOnly: axisSpec.integersOnly,
    });
    if (yScales.has(axisSpec.groupId)) {
      return yScales.get(axisSpec.groupId)!;
    }
    return null;
  } else {
    return computeXScale({
      xDomain,
      totalBarsInCluster,
      range,
      barsPadding,
      enableHistogramMode,
      ticks: axisSpec.ticks,
      integersOnly: axisSpec.integersOnly,
    });
  }
}

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
  scale: Scale,
  tickFormat: TickFormatter,
  bboxCalculator: BBoxCalculator,
  axisConfig: AxisConfig,
  tickLabelPadding: number,
  tickLabelRotation = 0,
  tickFormatOptions?: TickFormatterOptions,
) {
  const tickValues = scale.ticks();
  const tickLabels = tickValues.map((d) => {
    return tickFormat(d, tickFormatOptions);
  });

  const {
    tickLabelStyle: { fontFamily, fontSize },
  } = axisConfig;

  const {
    maxLabelBboxWidth,
    maxLabelBboxHeight,
    maxLabelTextWidth,
    maxLabelTextHeight,
  } = tickLabels.reduce(
    getMaxBboxDimensions(bboxCalculator, fontSize, fontFamily, tickLabelRotation, tickLabelPadding),
    { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 },
  );

  return {
    tickValues,
    tickLabels,
    maxLabelBboxWidth,
    maxLabelBboxHeight,
    maxLabelTextWidth,
    maxLabelTextHeight,
  };
}

/**
 * The Konva api sets the top right corner of a shape as the default origin of rotation.
 * In order to apply rotation to tick labels while preserving their relative position to the axis,
 * we compute offsets to apply to the Text element as well as adjust the x/y coordinates to adjust
 * for these offsets.
 */
export function centerRotationOrigin(
  axisTicksDimensions: {
    maxLabelBboxWidth: number;
    maxLabelBboxHeight: number;
    maxLabelTextWidth: number;
    maxLabelTextHeight: number;
  },
  coordinates: { x: number; y: number },
): { x: number; y: number; offsetX: number; offsetY: number } {
  const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth, maxLabelTextHeight } = axisTicksDimensions;

  const offsetX = maxLabelTextWidth / 2;
  const offsetY = maxLabelTextHeight / 2;
  const x = coordinates.x + maxLabelBboxWidth / 2;
  const y = coordinates.y + maxLabelBboxHeight / 2;

  return { offsetX, offsetY, x, y };
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

export function getVerticalAxisGridLineProps(tickPosition: number, chartWidth: number): AxisLinePosition {
  return [0, tickPosition, chartWidth, tickPosition];
}

export function getHorizontalAxisGridLineProps(tickPosition: number, chartHeight: number): AxisLinePosition {
  return [tickPosition, 0, tickPosition, chartHeight];
}

export function getMinMaxRange(
  axisPosition: Position,
  chartRotation: Rotation,
  chartDimensions: Dimensions,
): {
  minRange: number;
  maxRange: number;
} {
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

function getBottomTopAxisMinMaxRange(chartRotation: Rotation, width: number) {
  switch (chartRotation) {
    case 0:
      // dealing with x domain
      return { minRange: 0, maxRange: width };
    case 90:
      // dealing with y domain
      return { minRange: 0, maxRange: width };
    case -90:
      // dealing with y domain
      return { minRange: width, maxRange: 0 };
    case 180:
      // dealing with x domain
      return { minRange: width, maxRange: 0 };
  }
}
function getLeftAxisMinMaxRange(chartRotation: Rotation, height: number) {
  switch (chartRotation) {
    case 0:
      // dealing with y domain
      return { minRange: height, maxRange: 0 };
    case 90:
      // dealing with x domain
      return { minRange: 0, maxRange: height };
    case -90:
      // dealing with x domain
      return { minRange: height, maxRange: 0 };
    case 180:
      // dealing with y domain
      return { minRange: 0, maxRange: height };
  }
}
export function getAvailableTicks(
  axisSpec: AxisSpec,
  scale: Scale,
  totalBarsInCluster: number,
  enableHistogramMode: boolean,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const ticks = scale.ticks();
  const isSingleValueScale = scale.domain[0] - scale.domain[1] === 0;
  const hasAdditionalTicks = enableHistogramMode && scale.bandwidth > 0;

  if (hasAdditionalTicks) {
    const lastComputedTick = ticks[ticks.length - 1];

    if (!isSingleValueScale) {
      const penultimateComputedTick = ticks[ticks.length - 2];
      const computedTickDistance = lastComputedTick - penultimateComputedTick;
      const numTicks = scale.minInterval / computedTickDistance;

      for (let i = 1; i <= numTicks; i++) {
        ticks.push(i * computedTickDistance + lastComputedTick);
      }
    }
  }
  const shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;

  const band = scale.bandwidth / (1 - scale.barsPadding);
  const halfPadding = (band - scale.bandwidth) / 2;
  const offset = enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2;

  if (isSingleValueScale && hasAdditionalTicks) {
    const firstTickValue = ticks[0];
    const firstTick = {
      value: firstTickValue,
      label: axisSpec.tickFormat(firstTickValue, tickFormatOptions),
      position: scale.scale(firstTickValue) + offset,
    };

    const lastTickValue = firstTickValue + scale.minInterval;
    const lastTick = {
      value: lastTickValue,
      label: axisSpec.tickFormat(lastTickValue, tickFormatOptions),
      position: scale.bandwidth + halfPadding * 2,
    };

    return [firstTick, lastTick];
  }
  return ticks.map((tick) => {
    return {
      value: tick,
      label: axisSpec.tickFormat(tick, tickFormatOptions),
      position: scale.scale(tick) + offset,
    };
  });
}
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

export function isVerticalAxis(axisPosition: Position) {
  return axisPosition === Position.Left || axisPosition === Position.Right;
}

export function isHorizontalAxis(axisPosition: Position) {
  return axisPosition === Position.Top || axisPosition === Position.Bottom;
}

export function isVerticalGrid(axisPosition: Position) {
  return isHorizontalAxis(axisPosition);
}

export function isHorizontalGrid(axisPosition: Position) {
  return isVerticalAxis(axisPosition);
}

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
  totalGroupsCount: number,
  enableHistogramMode: boolean,
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
    const minMaxRanges = getMinMaxRange(axisSpec.position, chartRotation, chartDimensions);

    const scale = getScaleForAxisSpec(
      axisSpec,
      xDomain,
      yDomain,
      totalGroupsCount,
      chartRotation,
      minMaxRanges.minRange,
      minMaxRanges.maxRange,
      barsPadding,
      enableHistogramMode,
    );

    if (!scale) {
      throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
    }
    const tickFormatOptions = {
      timeZone: xDomain.timeZone,
    };

    const allTicks = getAvailableTicks(axisSpec, scale, totalGroupsCount, enableHistogramMode, tickFormatOptions);
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

export function isLowerBound(domain: Partial<CompleteBoundedDomain>): domain is LowerBoundedDomain {
  return domain.min != null;
}

export function isUpperBound(domain: Partial<CompleteBoundedDomain>): domain is UpperBoundedDomain {
  return domain.max != null;
}

export function isCompleteBound(domain: Partial<CompleteBoundedDomain>): domain is CompleteBoundedDomain {
  return domain.max != null && domain.min != null;
}

export function isBounded(domain: Partial<CompleteBoundedDomain>): domain is DomainRange {
  return domain.max != null || domain.min != null;
}

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
