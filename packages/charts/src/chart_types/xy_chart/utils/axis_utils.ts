/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../../scales';
import { SettingsSpec } from '../../../specs';
import {
  degToRad,
  getPercentageValue,
  getUniqueValues,
  HorizontalAlignment,
  Position,
  Rotation,
  VerticalAlignment,
} from '../../../utils/common';
import { Dimensions, innerPad, outerPad, PerSideDistance, Size } from '../../../utils/dimensions';
import { Range } from '../../../utils/domain';
import { AxisId } from '../../../utils/ids';
import { Point } from '../../../utils/point';
import { AxisStyle, TextAlignment, TextOffset, Theme } from '../../../utils/themes/theme';
import { XDomain, YDomain } from '../domains/types';
import { MIN_STROKE_WIDTH } from '../renderer/canvas/primitives/line';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';
import { getSpecsById } from '../state/utils/spec';
import { SeriesDomainsAndData } from '../state/utils/types';
import { isHorizontalAxis, isVerticalAxis } from './axis_type_utils';
import { getPanelSize, hasSMDomain } from './panel';
import { computeXScale, computeYScales } from './scales';
import { AxisSpec, TickFormatter, TickFormatterOptions } from './specs';

type TickValue = number | string;

/** @internal */
export interface AxisTick {
  value: TickValue;
  label: string;
  axisTickLabel: string;
  position: number;
}

/** @internal */
export interface TickLabelBounds {
  maxLabelBboxWidth: number;
  maxLabelBboxHeight: number;
  maxLabelTextWidth: number;
  maxLabelTextHeight: number;
  isHidden: boolean;
}

interface TickLabelProps {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  textOffsetX: number;
  textOffsetY: number;
  horizontalAlign: Extract<
    HorizontalAlignment,
    typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Center | typeof HorizontalAlignment.Right
  >;
  verticalAlign: Extract<
    VerticalAlignment,
    typeof VerticalAlignment.Top | typeof VerticalAlignment.Middle | typeof VerticalAlignment.Bottom
  >;
}

/** @internal */
export const defaultTickFormatter = (tick: unknown) => `${tick}`;

/** @internal */
export function isXDomain(position: Position, chartRotation: Rotation): boolean {
  return isHorizontalAxis(position) === (chartRotation % 180 === 0);
}

/** @internal */
export function getScaleForAxisSpec(
  { xDomain, yDomains }: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>,
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  totalBarsInCluster: number,
  barsPadding?: number,
  enableHistogramMode?: boolean,
) {
  return (
    { groupId, integersOnly, position }: Pick<AxisSpec, 'groupId' | 'integersOnly' | 'position'>,
    range: Range,
  ): Scale<number | string> | null =>
    isXDomain(position, chartRotation)
      ? computeXScale({ xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, integersOnly })
      : computeYScales({ yDomains, range, integersOnly }).get(groupId) ?? null;
}

/** @internal */
export function computeRotatedLabelDimensions(unrotatedDims: Size, degreesRotation: number): Size {
  const { width, height } = unrotatedDims;
  const radians = degToRad(degreesRotation);
  const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
  return { width: rotatedWidth, height: rotatedHeight };
}

function getUserTextOffsets(dimensions: TickLabelBounds, { x, y, reference }: TextOffset) {
  return reference === 'global'
    ? {
        local: { x: 0, y: 0 },
        global: {
          x: getPercentageValue(x, dimensions.maxLabelBboxWidth, 0),
          y: getPercentageValue(y, dimensions.maxLabelBboxHeight, 0),
        },
      }
    : {
        local: {
          x: getPercentageValue(x, dimensions.maxLabelTextWidth, 0),
          y: getPercentageValue(y, dimensions.maxLabelTextHeight, 0),
        },
        global: { x: 0, y: 0 },
      };
}

const horizontalOffsetMultiplier = {
  [HorizontalAlignment.Left]: -1,
  [HorizontalAlignment.Right]: 1,
  [HorizontalAlignment.Center]: 0,
};

const verticalOffsetMultiplier = {
  [VerticalAlignment.Top]: -1,
  [VerticalAlignment.Bottom]: 1,
  [VerticalAlignment.Middle]: 0,
};

function getHorizontalAlign(
  position: Position,
  rotation: number,
  alignment: HorizontalAlignment = HorizontalAlignment.Near,
): Exclude<HorizontalAlignment, typeof HorizontalAlignment.Far | typeof HorizontalAlignment.Near> {
  if (
    alignment === HorizontalAlignment.Center ||
    alignment === HorizontalAlignment.Right ||
    alignment === HorizontalAlignment.Left
  ) {
    return alignment;
  }

  if (Math.abs(rotation) === 90) {
    if (position === Position.Top) {
      return rotation === 90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    } else if (position === Position.Bottom) {
      return rotation === -90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    }
  } else {
    if (position === Position.Left) {
      return alignment === HorizontalAlignment.Near ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    } else if (position === Position.Right) {
      return alignment === HorizontalAlignment.Near ? HorizontalAlignment.Left : HorizontalAlignment.Right;
    }
  }

  return HorizontalAlignment.Center; // fallback for near/far on top/bottom axis
}

function getVerticalAlign(
  position: Position,
  rotation: number,
  alignment: VerticalAlignment = VerticalAlignment.Middle,
): Exclude<VerticalAlignment, typeof VerticalAlignment.Far | typeof VerticalAlignment.Near> {
  if (
    alignment === VerticalAlignment.Middle ||
    alignment === VerticalAlignment.Top ||
    alignment === VerticalAlignment.Bottom
  ) {
    return alignment;
  }

  if (rotation % 180 === 0) {
    if (position === Position.Left) {
      return rotation === 0 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    } else if (position === Position.Right) {
      return rotation === 180 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    }
  } else {
    if (position === Position.Top) {
      return alignment === VerticalAlignment.Near ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    } else if (position === Position.Bottom) {
      return alignment === VerticalAlignment.Near ? VerticalAlignment.Top : VerticalAlignment.Bottom;
    }
  }

  return VerticalAlignment.Middle; // fallback for near/far on left/right axis
}

/**
 * Gets the computed x/y coordinates & alignment properties for an axis tick label.
 * @internal
 */
export function getTickLabelProps(
  { tickLine, tickLabel }: AxisStyle,
  tickPosition: number,
  position: Position,
  rotation: number,
  axisSize: Size,
  tickDimensions: TickLabelBounds,
  showTicks: boolean,
  textOffset: TextOffset,
  textAlignment?: TextAlignment,
): TickLabelProps {
  const { maxLabelBboxWidth, maxLabelTextWidth, maxLabelBboxHeight, maxLabelTextHeight } = tickDimensions;
  const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
  const labelInnerPadding = innerPad(tickLabel.padding);
  const isLeftAxis = position === Position.Left;
  const isAxisTop = position === Position.Top;
  const horizontalAlign = getHorizontalAlign(position, rotation, textAlignment?.horizontal);
  const verticalAlign = getVerticalAlign(position, rotation, textAlignment?.vertical);

  const userOffsets = getUserTextOffsets(tickDimensions, textOffset);
  const textOffsetX =
    (isHorizontalAxis(position) && rotation === 0
      ? 0
      : (maxLabelTextWidth / 2) * horizontalOffsetMultiplier[horizontalAlign]) + userOffsets.local.x;
  const textOffsetY = (maxLabelTextHeight / 2) * verticalOffsetMultiplier[verticalAlign] + userOffsets.local.y;
  const rest = { textOffsetX, textOffsetY, horizontalAlign, verticalAlign };
  return isVerticalAxis(position)
    ? {
        x: isLeftAxis ? axisSize.width - tickDimension - labelInnerPadding : tickDimension + labelInnerPadding,
        y: tickPosition,
        offsetX: (isLeftAxis ? -1 : 1) * (maxLabelBboxWidth / 2) + userOffsets.global.x,
        offsetY: userOffsets.global.y,
        ...rest,
      }
    : {
        x: tickPosition,
        y: isAxisTop ? axisSize.height - tickDimension - labelInnerPadding : tickDimension + labelInnerPadding,
        offsetX: userOffsets.global.x,
        offsetY: (isAxisTop ? -maxLabelBboxHeight / 2 : maxLabelBboxHeight / 2) + userOffsets.global.y,
        ...rest,
      };
}

function axisMinMax(axisPosition: Position, chartRotation: Rotation, { width, height }: Size): [number, number] {
  const horizontal = isHorizontalAxis(axisPosition);
  const flipped = horizontal
    ? chartRotation === -90 || chartRotation === 180
    : chartRotation === 90 || chartRotation === 180;
  return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}

/** @internal */
export function getAvailableTicks(
  axisSpec: AxisSpec,
  scale: Scale<number | string>,
  totalBarsInCluster: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  rotationOffset: number,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const ticks = scale.ticks();
  const isSingleValueScale = scale.domain[0] === scale.domain[1];
  const makeRaster = enableHistogramMode && scale.bandwidth > 0;
  const ultimateTick = ticks[ticks.length - 1];
  const penultimateTick = ticks[ticks.length - 2];
  if (makeRaster && !isSingleValueScale && typeof penultimateTick === 'number' && typeof ultimateTick === 'number') {
    const computedTickDistance = ultimateTick - penultimateTick;
    const numTicks = scale.minInterval / computedTickDistance;
    for (let i = 1; i <= numTicks; i++) ticks.push(i * computedTickDistance + ultimateTick);
  }
  const shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
  const band = scale.bandwidth / (1 - scale.barsPadding);
  const halfPadding = (band - scale.bandwidth) / 2;
  const offset =
    (enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2) + (scale.isSingleValue() ? 0 : rotationOffset);
  const tickFormatter = axisSpec.tickFormat ?? fallBackTickFormatter;
  const labelFormatter = axisSpec.labelFormat ?? tickFormatter;
  const firstTickValue = ticks[0];
  if (makeRaster && isSingleValueScale && typeof firstTickValue === 'number') {
    const firstLabel = tickFormatter(firstTickValue, tickFormatOptions);
    const firstTick = {
      value: firstTickValue,
      label: firstLabel,
      axisTickLabel: labelFormatter(firstTickValue, tickFormatOptions),
      position: (scale.scale(firstTickValue) ?? 0) + offset,
    };
    const lastTickValue = firstTickValue + scale.minInterval;
    const lastLabel = tickFormatter(lastTickValue, tickFormatOptions);
    const lastTick = {
      value: lastTickValue,
      label: lastLabel,
      axisTickLabel: labelFormatter(lastTickValue, tickFormatOptions),
      position: scale.bandwidth + halfPadding * 2,
    };
    return [firstTick, lastTick];
  } else {
    return enableDuplicatedTicks(axisSpec, scale, offset, fallBackTickFormatter, tickFormatOptions);
  }
}

/** @internal */
export function enableDuplicatedTicks(
  axisSpec: AxisSpec,
  scale: Scale<number | string>,
  offset: number,
  fallBackTickFormatter: TickFormatter,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const allTicks: AxisTick[] = scale.ticks().map((tick) => ({
    value: tick,
    // TODO handle empty string tick formatting
    label: (axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    axisTickLabel: (axisSpec.labelFormat ?? axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    position: (scale.scale(tick) ?? 0) + offset,
  }));
  return axisSpec.showDuplicatedTicks ? allTicks : getUniqueValues(allTicks, 'axisTickLabel', true);
}

/** @internal */
export function getVisibleTicks(allTicks: AxisTick[], axisSpec: AxisSpec, axisDim: TickLabelBounds): AxisTick[] {
  const { ticksForCulledLabels, showOverlappingLabels, position } = axisSpec;
  const requiredSpace = isVerticalAxis(position) ? axisDim.maxLabelBboxHeight / 2 : axisDim.maxLabelBboxWidth / 2;
  return showOverlappingLabels
    ? allTicks
    : [...allTicks]
        .sort((a: AxisTick, b: AxisTick) => a.position - b.position)
        .reduce(
          (prev, tick) => {
            const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace;
            if (tickLabelFits || ticksForCulledLabels) {
              prev.visibleTicks.push(tickLabelFits ? tick : { ...tick, axisTickLabel: '' });
              if (tickLabelFits) prev.occupiedSpace = tick.position + requiredSpace;
            }
            return prev;
          },
          { visibleTicks: [] as AxisTick[], occupiedSpace: -Infinity },
        ).visibleTicks;
}

/** @internal */
export function getTitleDimension({
  visible,
  fontSize,
  padding,
}: AxisStyle['axisTitle'] | AxisStyle['axisPanelTitle']): number {
  return visible && fontSize > 0 ? innerPad(padding) + fontSize + outerPad(padding) : 0;
}

/** @internal */
export function getPosition(
  { chartDimensions }: { chartDimensions: Dimensions },
  chartMargins: PerSideDistance,
  { axisTitle, axisPanelTitle, tickLine, tickLabel }: AxisStyle,
  { title, position, hide }: AxisSpec,
  { maxLabelBboxHeight, maxLabelBboxWidth }: TickLabelBounds,
  smScales: SmallMultipleScales,
  { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum }: PerSideDistance,
) {
  const tickDimension = shouldShowTicks(tickLine, hide) ? tickLine.size + tickLine.padding : 0;
  const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
  const titleDimension = title ? getTitleDimension(axisTitle) : 0;
  const vertical = isVerticalAxis(position);
  const scaleBand = vertical ? smScales.vertical : smScales.horizontal;
  const panelTitleDimension = hasSMDomain(scaleBand) ? getTitleDimension(axisPanelTitle) : 0;
  const shownLabelSize = tickLabel.visible ? (vertical ? maxLabelBboxWidth : maxLabelBboxHeight) : 0;
  const parallelSize = labelPaddingSum + shownLabelSize + tickDimension + titleDimension + panelTitleDimension;
  return {
    leftIncrement: position === Position.Left ? parallelSize + chartMargins.left : 0,
    rightIncrement: position === Position.Right ? parallelSize + chartMargins.right : 0,
    topIncrement: position === Position.Top ? parallelSize + chartMargins.top : 0,
    bottomIncrement: position === Position.Bottom ? parallelSize + chartMargins.bottom : 0,
    dimensions: {
      left:
        position === Position.Left
          ? chartMargins.left + cumLeftSum
          : chartDimensions.left + (position === Position.Right ? chartDimensions.width + cumRightSum : 0),
      top:
        position === Position.Top
          ? chartMargins.top + cumTopSum
          : chartDimensions.top + (position === Position.Bottom ? chartDimensions.height + cumBottomSum : 0),
      width: vertical ? parallelSize : chartDimensions.width,
      height: vertical ? chartDimensions.height : parallelSize,
    },
  };
}

/** @internal */
export function shouldShowTicks({ visible, strokeWidth, size }: AxisStyle['tickLine'], axisHidden: boolean): boolean {
  return !axisHidden && visible && size > 0 && strokeWidth >= MIN_STROKE_WIDTH;
}

/** @internal */
export interface AxisGeometry {
  anchorPoint: Point;
  size: Size;
  parentSize: Size;
  axis: {
    id: AxisId;
    position: Position;
    panelTitle?: string; // defined later per panel
    secondary?: boolean; // defined later per panel
  };
  dimension: TickLabelBounds;
  ticks: AxisTick[];
  visibleTicks: AxisTick[];
}

/** @internal */
export function getAxesGeometries(
  chartDims: { chartDimensions: Dimensions; leftMargin: number },
  { chartPaddings, chartMargins, axes: sharedAxesStyle }: Theme,
  chartRotation: Rotation,
  axisSpecs: AxisSpec[],
  axisDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  xDomain: XDomain,
  yDomains: YDomain[],
  smScales: SmallMultipleScales,
  totalGroupsCount: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  barsPadding?: number,
): AxisGeometry[] {
  const panel = getPanelSize(smScales);
  const scaleFunction = getScaleForAxisSpec(
    { xDomain, yDomains },
    { rotation: chartRotation },
    totalGroupsCount,
    barsPadding,
    enableHistogramMode,
  );
  return [...axisDimensions].reduce(
    (acc: PerSideDistance & { geoms: AxisGeometry[] }, [axisId, axisDim]: [string, TickLabelBounds]) => {
      const axisSpec = getSpecsById<AxisSpec>(axisSpecs, axisId);
      if (axisSpec) {
        const scale = scaleFunction(axisSpec, axisMinMax(axisSpec.position, chartRotation, panel));
        if (!scale) throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);

        const vertical = isVerticalAxis(axisSpec.position);
        const allTicks = getAvailableTicks(
          axisSpec,
          scale,
          totalGroupsCount,
          enableHistogramMode,
          vertical ? fallBackTickFormatter : defaultTickFormatter,
          enableHistogramMode && ((vertical && chartRotation === -90) || (!vertical && chartRotation === 180))
            ? scale.step // TODO: Find the true cause of the this offset error
            : 0,
          { timeZone: xDomain.timeZone },
        );
        const axisStyle = axesStyles.get(axisId) ?? sharedAxesStyle;
        const axisPositionData = getPosition(chartDims, chartMargins, axisStyle, axisSpec, axisDim, smScales, acc);
        const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = axisPositionData;

        acc.top += topIncrement;
        acc.bottom += bottomIncrement;
        acc.left += leftIncrement;
        acc.right += rightIncrement;
        acc.geoms.push({
          axis: { id: axisSpec.id, position: axisSpec.position },
          anchorPoint: { x: dimensions.left, y: dimensions.top },
          dimension: axisDim,
          ticks: allTicks,
          visibleTicks: getVisibleTicks(allTicks, axisSpec, axisDim),
          parentSize: { height: dimensions.height, width: dimensions.width },
          size: axisDim.isHidden
            ? { width: 0, height: 0 }
            : {
                width: vertical ? dimensions.width : panel.width,
                height: vertical ? panel.height : dimensions.height,
              },
        });
      }
      return acc;
    },
    { geoms: [], top: 0, bottom: chartPaddings.bottom, left: chartDims.leftMargin, right: chartPaddings.right },
  ).geoms;
}
