/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isHorizontalAxis, isVerticalAxis } from './axis_type_utils';
import { computeXScale, computeYScales } from './scales';
import { XScaleType } from './specs';
import { SmallMultipleScales, hasSMDomain, getPanelSize } from '../../../common/panel_utils';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { AxisSpec, SettingsSpec } from '../../../specs';
import {
  degToRad,
  getPercentageValue,
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
import { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import { Projection } from '../state/selectors/visible_ticks';
import { SeriesDomainsAndData } from '../state/utils/types';

type TickValue = number | string;

/** @internal */
export type TextDirection = 'rtl' | 'ltr';

/** @internal */
export interface AxisTick {
  value: TickValue;
  domainClampedValue: TickValue;
  label: string;
  position: number;
  domainClampedPosition: number;
  layer?: number;
  detailedLayer: number;
  showGrid: boolean;
  direction: TextDirection;
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
    {
      groupId,
      integersOnly,
      maximumFractionDigits: mfd,
      position,
    }: Pick<AxisSpec, 'groupId' | 'integersOnly' | 'maximumFractionDigits' | 'position'>,
    range: Range,
  ): ScaleContinuous | ScaleBand | null => {
    // TODO: remove this fallback when integersOnly is removed
    const maximumFractionDigits = mfd ?? (integersOnly ? 0 : undefined);

    return isXDomain(position, chartRotation)
      ? computeXScale({ xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, maximumFractionDigits })
      : computeYScales({ yDomains, range, maximumFractionDigits }).get(groupId) ?? null;
  };
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
  alignment: HorizontalAlignment,
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
  alignment: VerticalAlignment,
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

/** @internal */
export function getTickLabelPosition(
  { tickLine, tickLabel }: AxisStyle,
  tickPosition: number,
  pos: Position,
  rotation: number,
  axisSize: Size,
  tickDimensions: TickLabelBounds,
  showTicks: boolean,
  textOffset: TextOffset,
  textAlignment: TextAlignment,
): TickLabelProps {
  const { maxLabelBboxWidth, maxLabelTextWidth, maxLabelBboxHeight, maxLabelTextHeight } = tickDimensions;
  const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
  const labelInnerPadding = innerPad(tickLabel.padding);
  const horizontalAlign = getHorizontalAlign(pos, rotation, textAlignment.horizontal);
  const verticalAlign = getVerticalAlign(pos, rotation, textAlignment.vertical);
  const userOffsets = getUserTextOffsets(tickDimensions, textOffset);
  const paddedTickDimension = tickDimension + labelInnerPadding;
  const axisNetSize = (isVerticalAxis(pos) ? axisSize.width : axisSize.height) - paddedTickDimension;
  const labelBoxHalfGirth = isHorizontalAxis(pos) ? maxLabelBboxHeight / 2 : maxLabelBboxWidth / 2;
  const labelHalfWidth = maxLabelTextWidth / 2;
  return {
    horizontalAlign,
    verticalAlign,
    x: pos === Position.Left ? axisNetSize : pos === Position.Right ? paddedTickDimension : tickPosition,
    y: pos === Position.Top ? axisNetSize : pos === Position.Bottom ? paddedTickDimension : tickPosition,
    offsetX: userOffsets.global.x + (isHorizontalAxis(pos) ? 0 : horizontalOffsetMultiplier[pos] * labelBoxHalfGirth),
    offsetY: userOffsets.global.y + (isVerticalAxis(pos) ? 0 : verticalOffsetMultiplier[pos] * labelBoxHalfGirth),
    textOffsetX:
      userOffsets.local.x +
      (isHorizontalAxis(pos) && rotation === 0 ? 0 : labelHalfWidth * horizontalOffsetMultiplier[horizontalAlign]),
    textOffsetY: userOffsets.local.y + (maxLabelTextHeight / 2) * verticalOffsetMultiplier[verticalAlign],
  };
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
export const getAllAxisLayersGirth = (
  timeAxisLayerCount: number,
  maxLabelBoxGirth: number,
  axisHorizontal: boolean,
  axisTimeScale: boolean,
) => {
  const axisLayerCount = timeAxisLayerCount > 0 && axisHorizontal && axisTimeScale ? timeAxisLayerCount : 1;
  return axisLayerCount * maxLabelBoxGirth;
};

/** @internal */
export function getPosition(
  { chartDimensions }: { chartDimensions: Dimensions },
  chartMargins: PerSideDistance,
  { axisTitle, axisPanelTitle, tickLine, tickLabel }: AxisStyle,
  { title, position, hide, timeAxisLayerCount }: AxisSpec,
  { maxLabelBboxHeight, maxLabelBboxWidth }: TickLabelBounds,
  smScales: SmallMultipleScales,
  { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum }: PerSideDistance,
  scaleConfigs: ScaleConfigs,
) {
  const tickDimension = shouldShowTicks(tickLine, hide) ? tickLine.size + tickLine.padding : 0;
  const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
  const titleDimension = title ? getTitleDimension(axisTitle) : 0;
  const vertical = isVerticalAxis(position);
  const timeScale = scaleConfigs.x.type === 'time';
  const scaleBand = vertical ? smScales.vertical : smScales.horizontal;
  const panelTitleDimension = hasSMDomain(scaleBand) ? getTitleDimension(axisPanelTitle) : 0;
  const maxLabelBboxGirth = tickLabel.visible ? (vertical ? maxLabelBboxWidth : maxLabelBboxHeight) : 0;
  const shownLabelSize = getAllAxisLayersGirth(timeAxisLayerCount, maxLabelBboxGirth, !vertical, timeScale);
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
export function shouldShowTicks({ visible }: AxisStyle['tickLine'], axisHidden: boolean): boolean {
  return !axisHidden && visible;
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
    scaleType?: XScaleType;
  };
  dimension: TickLabelBounds;
  visibleTicks: AxisTick[];
}

/** @internal */
export function getAxesGeometries(
  chartDims: { chartDimensions: Dimensions; leftMargin: number },
  { chartPaddings, chartMargins, axes: sharedAxesStyle }: Theme,
  axisSpecs: Map<AxisId, AxisSpec>,
  axesStyles: Map<AxisId, AxisStyle | null>,
  smScales: SmallMultipleScales,
  visibleTicksSet: Map<AxisId, Projection>,
  scaleConfigs: ScaleConfigs,
  settingsSpec: SettingsSpec,
): AxisGeometry[] {
  const panel = getPanelSize(smScales);
  return [...visibleTicksSet].reduce(
    (acc: PerSideDistance & { geoms: AxisGeometry[] }, [axisId, { ticks, labelBox }]: [AxisId, Projection]) => {
      const axisSpec = axisSpecs.get(axisId);
      if (axisSpec) {
        const vertical = isVerticalAxis(axisSpec.position);
        const xDomain = isXDomain(axisSpec.position, settingsSpec.rotation);
        const scaleType = xDomain ? scaleConfigs.x.type : undefined;
        const axisStyle = axesStyles.get(axisId) ?? sharedAxesStyle;
        const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = getPosition(
          chartDims,
          chartMargins,
          axisStyle,
          axisSpec,
          labelBox,
          smScales,
          acc,
          scaleConfigs,
        );
        acc.top += topIncrement;
        acc.bottom += bottomIncrement;
        acc.left += leftIncrement;
        acc.right += rightIncrement;
        acc.geoms.push({
          axis: { id: axisSpec.id, position: axisSpec.position, scaleType },
          anchorPoint: { x: dimensions.left, y: dimensions.top },
          dimension: labelBox,
          visibleTicks: ticks,
          parentSize: { height: dimensions.height, width: dimensions.width },
          size: {
            width: labelBox.isHidden ? 0 : vertical ? dimensions.width : panel.width,
            height: labelBox.isHidden ? 0 : vertical ? panel.height : dimensions.height,
          },
        });
      } else {
        throw new Error(`Cannot compute scale for axis spec ${axisId}`); // todo move this feedback as upstream as possible
      }
      return acc;
    },
    { geoms: [], top: 0, bottom: chartPaddings.bottom, left: chartDims.leftMargin, right: chartPaddings.right },
  ).geoms;
}
