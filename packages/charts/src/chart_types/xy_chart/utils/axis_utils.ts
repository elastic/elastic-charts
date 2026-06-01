/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isHorizontalAxis, isVerticalAxis } from './axis_type_utils';
import { computeXScale, computeYScales } from './scales';
import { ChartType } from '../..';
import type { SmallMultipleScales } from '../../../common/panel_utils';
import { hasSMDomain, getPanelSize } from '../../../common/panel_utils';
import type { TextAlign } from '../../../common/text_utils';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import type { AxisSpec, SettingsSpec, SmallMultiplesSpec } from '../../../specs';
import type { Rotation } from '../../../utils/common';
import { degToRad, getPercentageValue, HorizontalAlignment, Position, VerticalAlignment } from '../../../utils/common';
import type { Dimensions, PerSideDistance, Size } from '../../../utils/dimensions';
import { innerPad, outerPad } from '../../../utils/dimensions';
import type { Range } from '../../../utils/domain';
import type { AxisId } from '../../../utils/ids';
import type { Point } from '../../../utils/point';
import type { AxisStyle, TextAlignment, TextOffset, Theme } from '../../../utils/themes/theme';
import { getExtentBounds, measureAxisStatic } from '../axes/dimensions';
import type { TickLabelBox } from '../axes/tick_labels';
import { getMaxLabelDimensions } from '../axes/tick_labels';
import type { Projection } from '../axes/visible_ticks';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import type { SeriesDomainsAndData } from '../state/utils/types';

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
  multilayerTimeAxis: boolean;
  layout: TickLabelBox;
}

/** @internal */
export interface TickLabelProps {
  x: number;
  y: number;
  textOffsetX: number;
  textOffsetY: number;
  textAlign: TextAlign;
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

function getUserTextOffsets(axisLabelBox: TickLabelBox, tickLabelBox: TickLabelBox, { x, y, reference }: TextOffset) {
  return reference === 'global'
    ? {
        local: { x: 0, y: 0 },
        global: {
          x: getPercentageValue(x, axisLabelBox.bboxWidth, 0),
          y: getPercentageValue(y, axisLabelBox.bboxHeight, 0),
        },
      }
    : {
        local: {
          x: getPercentageValue(x, tickLabelBox.width, 0),
          y: getPercentageValue(y, tickLabelBox.height, 0),
        },
        global: { x: 0, y: 0 },
      };
}

function getHorizontalAlign(
  axisPosition: Position,
  rotation: number,
  alignment: HorizontalAlignment,
): TickLabelProps['horizontalAlign'] {
  if (
    alignment === HorizontalAlignment.Center ||
    alignment === HorizontalAlignment.Right ||
    alignment === HorizontalAlignment.Left
  ) {
    return alignment;
  }

  const isNear = alignment === HorizontalAlignment.Near;

  switch (axisPosition) {
    case Position.Left:
      return isNear ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    case Position.Right:
      return isNear ? HorizontalAlignment.Left : HorizontalAlignment.Right;
    case Position.Top:
      if (Math.abs(rotation) === 90) {
        return rotation === 90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
      }
      return HorizontalAlignment.Center;
    case Position.Bottom:
      if (Math.abs(rotation) === 90) {
        return rotation === -90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
      }
      return HorizontalAlignment.Center;
  }
}

function getVerticalAlign(
  axisPosition: Position,
  rotation: number,
  alignment: VerticalAlignment,
): TickLabelProps['verticalAlign'] {
  if (
    alignment === VerticalAlignment.Middle ||
    alignment === VerticalAlignment.Top ||
    alignment === VerticalAlignment.Bottom
  ) {
    return alignment;
  }

  const isNear = alignment === VerticalAlignment.Near;

  switch (axisPosition) {
    case Position.Top:
      return isNear ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    case Position.Bottom:
      return isNear ? VerticalAlignment.Top : VerticalAlignment.Bottom;
    case Position.Left:
      if (rotation % 180 === 0) {
        return rotation === 0 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
      }
      return VerticalAlignment.Middle;
    case Position.Right:
      if (rotation % 180 === 0) {
        return rotation === 180 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
      }
      return VerticalAlignment.Middle;
  }
}

/** @internal */
export function getAlignedTickLabelPosition(
  textAlignment: TextAlignment,
  axisPosition: Position,
  rotation: number,
  tickPosition: number,
  axisSize: Size,
  paddedTickDimension: number,
  labelBox: TickLabelBox,
  userOffsets: { local: Point; global: Point },
): TickLabelProps {
  const alignment = {
    horizontal: getHorizontalAlign(axisPosition, rotation, textAlignment.horizontal),
    vertical: getVerticalAlign(axisPosition, rotation, textAlignment.vertical),
  };

  const { horizontal: horizontalAlign, vertical: verticalAlign } = alignment;

  const anchor = (() => {
    const axisNetSize = (isVerticalAxis(axisPosition) ? axisSize.width : axisSize.height) - paddedTickDimension;

    if (isHorizontalAxis(axisPosition)) {
      return {
        x: tickPosition,
        y: axisPosition === Position.Top ? axisNetSize : paddedTickDimension,
      };
    }

    return {
      x: axisPosition === Position.Left ? axisNetSize : paddedTickDimension,
      y: tickPosition,
    };
  })();

  const verticalBoxOffset = (() => {
    switch (verticalAlign) {
      case VerticalAlignment.Top:
        return 0;
      case VerticalAlignment.Middle:
        return -labelBox.height / 2;
      case VerticalAlignment.Bottom:
        return -labelBox.height;
    }
  })();

  return {
    horizontalAlign,
    verticalAlign,
    x: anchor.x + userOffsets.global.x,
    y: anchor.y + userOffsets.global.y,
    textAlign: horizontalAlign,
    textOffsetX: userOffsets.local.x,
    textOffsetY: userOffsets.local.y + verticalBoxOffset,
  };
}

/** @internal */
export function getTickLabelPosition(
  { tickLine, tickLabel }: AxisStyle,
  tickPosition: number,
  pos: Position,
  rotation: number,
  axisSize: Size,
  maxLabelBox: TickLabelBox,
  showTicks: boolean,
  textOffset: TextOffset,
  textAlignment: TextAlignment,
  labelBox: TickLabelBox = maxLabelBox,
): TickLabelProps {
  const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
  const labelInnerPadding = innerPad(tickLabel.padding);
  const userOffsets = getUserTextOffsets(maxLabelBox, labelBox, textOffset);
  const paddedTickDimension = tickDimension + labelInnerPadding;

  return getAlignedTickLabelPosition(
    textAlignment,
    pos,
    rotation,
    tickPosition,
    axisSize,
    paddedTickDimension,
    labelBox,
    userOffsets,
  );
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
  multilayerTimeAxis: boolean,
) => {
  const axisLayerCount = timeAxisLayerCount > 0 && multilayerTimeAxis ? timeAxisLayerCount : 1;
  return axisLayerCount * maxLabelBoxGirth;
};

/** @internal */
export function getPosition(
  { chartDimensions }: { chartDimensions: Dimensions },
  chartMargins: PerSideDistance,
  axisStyle: AxisStyle,
  axisSpec: AxisSpec,
  { bboxHeight, bboxWidth }: TickLabelBox,
  smScales: SmallMultipleScales,
  { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum }: PerSideDistance,
  multilayerTimeAxis: boolean,
  containerWidth: number = Infinity,
  containerHeight: number = Infinity,
  smSpec: SmallMultiplesSpec | null = null,
) {
  const { axisTitle, axisPanelTitle, tickLine, tickLabel } = axisStyle;
  const { title, position, hide, timeAxisLayerCount } = axisSpec;
  const tickDimension = shouldShowTicks(tickLine, hide) ? tickLine.size + tickLine.padding : 0;
  const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
  const titleDimension = title ? getTitleDimension(axisTitle) : 0;
  const vertical = isVerticalAxis(position);
  const scaleBand = vertical ? smScales.vertical : smScales.horizontal;

  const hasPanelTitle = smSpec
    ? isVerticalAxis(position)
      ? smSpec.splitVertically
      : smSpec.splitHorizontally
    : hasSMDomain(scaleBand);

  const panelTitleDimension = hasPanelTitle ? getTitleDimension(axisPanelTitle) : 0;

  // cap label girth by the resolved label budget so parallelSize agrees with
  // the axis extent reserved in getAxesDimensions
  const staticBand = measureAxisStatic(axisSpec, axisStyle, Boolean(hasPanelTitle));
  const { labelBudget } = getExtentBounds(position, axisStyle, staticBand, containerWidth, containerHeight);
  const rawLabelGirth = tickLabel.visible ? (vertical ? bboxWidth : bboxHeight) : 0;
  const cappedLabelGirth = Math.min(rawLabelGirth, labelBudget);

  const shownLabelSize = getAllAxisLayersGirth(timeAxisLayerCount, cappedLabelGirth, multilayerTimeAxis);
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
export function isMultilayerTimeAxis(
  { chartType, timeAxisLayerCount, position }: AxisSpec,
  xScaleType: ScaleType,
  rotation: Rotation,
) {
  return (
    chartType === ChartType.XYAxis &&
    timeAxisLayerCount > 0 &&
    isXDomain(position, rotation) &&
    rotation === 0 &&
    xScaleType === ScaleType.Time
  );
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
    multilayerTimeAxis: boolean;
  };
  dimension: TickLabelBox;
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
  container: Dimensions,
  smSpec: SmallMultiplesSpec | null,
): AxisGeometry[] {
  const panel = getPanelSize(smScales);
  return [...visibleTicksSet].reduce(
    (acc: PerSideDistance & { geoms: AxisGeometry[] }, [axisId, { ticks }]: [AxisId, Projection]) => {
      const axisSpec = axisSpecs.get(axisId);
      const labelBox = getMaxLabelDimensions(ticks.map((tick) => tick.layout));
      if (axisSpec) {
        const vertical = isVerticalAxis(axisSpec.position);
        const axisStyle = axesStyles.get(axisId) ?? sharedAxesStyle;
        const multilayerTimeAxis = isMultilayerTimeAxis(axisSpec, scaleConfigs.x.type, settingsSpec.rotation);
        const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = getPosition(
          chartDims,
          chartMargins,
          axisStyle,
          axisSpec,
          labelBox,
          smScales,
          acc,
          multilayerTimeAxis,
          container.width,
          container.height,
          smSpec,
        );
        acc.top += topIncrement;
        acc.bottom += bottomIncrement;
        acc.left += leftIncrement;
        acc.right += rightIncrement;
        acc.geoms.push({
          axis: { id: axisSpec.id, position: axisSpec.position, multilayerTimeAxis },
          anchorPoint: { x: dimensions.left, y: dimensions.top },
          dimension: labelBox,
          visibleTicks: ticks,
          parentSize: { height: dimensions.height, width: dimensions.width },
          size: {
            width: axisSpec.hide ? 0 : vertical ? dimensions.width : panel.width,
            height: axisSpec.hide ? 0 : vertical ? panel.height : dimensions.height,
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
