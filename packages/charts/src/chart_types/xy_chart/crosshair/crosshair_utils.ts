/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnchorPosition } from '../../../components/portal/types';
import { Line, Rect } from '../../../geoms/types';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { isContinuousScale } from '../../../scales/types';
import { TooltipStickTo } from '../../../specs/constants';
import { Rotation } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { Point } from '../../../utils/point';
import { isHorizontalRotation, isVerticalRotation } from '../state/utils/common';

/** @internal */
export const DEFAULT_SNAP_POSITION_BAND = 1;

/** @internal */
export function getSnapPosition(
  value: string | number,
  scale: ScaleBand | ScaleContinuous,
  totalBarsInCluster = 1,
): { band: number; position: number } | undefined {
  const position = scale.scale(value);
  if (Number.isNaN(position)) {
    return;
  }

  if (scale.bandwidth > 0) {
    const band = scale.bandwidth / (1 - scale.barsPadding);

    const halfPadding = (band - scale.bandwidth) / 2;
    return {
      position: position - halfPadding * totalBarsInCluster,
      band: band * totalBarsInCluster,
    };
  }
  return {
    position,
    band: DEFAULT_SNAP_POSITION_BAND,
  };
}

/** @internal */
export function getCursorLinePosition(
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  projectedPointerPosition: { x: number; y: number },
): Line | undefined {
  const { x, y } = projectedPointerPosition;
  if (x < 0 || y < 0) {
    return undefined;
  }
  const { left, top, width, height } = chartDimensions;
  const isHorizontalRotated = isHorizontalRotation(chartRotation);
  if (isHorizontalRotated) {
    const crosshairTop = y + top;
    return {
      x1: left,
      x2: left + width,
      y1: crosshairTop,
      y2: crosshairTop,
    };
  }
  const crosshairLeft = x + left;

  return {
    x1: crosshairLeft,
    x2: crosshairLeft,
    y1: top,
    y2: top + height,
  };
}

/** @internal */
export function getCursorBandPosition(
  chartRotation: Rotation,
  panel: Dimensions,
  cursorPosition: Point,
  invertedValue: {
    value: string | number;
    withinBandwidth: boolean;
  },
  snapEnabled: boolean,
  xScale: ScaleBand | ScaleContinuous,
  totalBarsInCluster?: number,
): Rect | undefined {
  const { top, left, width, height } = panel;
  const { x, y } = cursorPosition;
  const isHorizontalRotated = isHorizontalRotation(chartRotation);
  const chartWidth = isHorizontalRotated ? width : height;
  const chartHeight = isHorizontalRotated ? height : width;

  const isLineOrAreaOnly = !totalBarsInCluster;

  if (x > chartWidth || y > chartHeight || x < 0 || y < 0 || !invertedValue.withinBandwidth) {
    return undefined;
  }

  const snappedPosition = getSnapPosition(invertedValue.value, xScale, isLineOrAreaOnly ? 1 : totalBarsInCluster);
  if (!snappedPosition) {
    return undefined;
  }

  const { position, band } = snappedPosition;
  const bandOffset = xScale.bandwidth > 0 ? band : 0;

  if (isHorizontalRotated) {
    const adjustedLeft = snapEnabled ? position : cursorPosition.x;
    let leftPosition = chartRotation === 0 ? left + adjustedLeft : left + width - adjustedLeft - bandOffset;
    let adjustedWidth = band;
    if (band > 1 && leftPosition + band > left + width) {
      adjustedWidth = left + width - leftPosition;
    } else if (band > 1 && leftPosition < left) {
      adjustedWidth = band - (left - leftPosition);
      leftPosition = left;
    }
    if (isLineOrAreaOnly && isContinuousScale(xScale)) {
      return {
        x: leftPosition,
        width: 0,
        y: top,
        height,
      };
    }
    return {
      x: leftPosition,
      y: top,
      width: adjustedWidth,
      height,
    };
  }
  const adjustedTop = snapEnabled ? position : cursorPosition.x;
  let topPosition = chartRotation === 90 ? top + adjustedTop : height + top - adjustedTop - bandOffset;
  let adjustedHeight = band;
  if (band > 1 && topPosition + band > top + height) {
    adjustedHeight = band - (topPosition + band - (top + height));
  } else if (band > 1 && topPosition < top) {
    adjustedHeight = band - (top - topPosition);
    topPosition = top;
  }
  if (isLineOrAreaOnly && isContinuousScale(xScale)) {
    return {
      x: left,
      width,
      y: topPosition,
      height: 0,
    };
  }
  return {
    y: topPosition,
    x: left,
    width,
    height: adjustedHeight,
  };
}

/** @internal */
export function getTooltipAnchorPosition(
  chartRotation: Rotation,
  cursorBandPosition: Rect,
  cursorPosition: { x: number; y: number },
  panel: Dimensions,
  stickTo: TooltipStickTo = TooltipStickTo.MousePosition,
): AnchorPosition {
  const { x, y, width, height } = cursorBandPosition;
  const isRotated = isVerticalRotation(chartRotation);
  // horizontal movement of cursor
  if (!isRotated) {
    const stickY =
      stickTo === TooltipStickTo.MousePosition
        ? cursorPosition.y + panel.top
        : stickTo === TooltipStickTo.Middle
          ? y + height / 2
          : stickTo === TooltipStickTo.Bottom
            ? y + height
            : y; // TooltipStickTo.Top is also ok with that value
    return {
      x,
      width,
      y: stickY,
      height: 0,
    };
  }
  const stickX =
    stickTo === TooltipStickTo.MousePosition
      ? cursorPosition.x + panel.left
      : stickTo === TooltipStickTo.Right
        ? x + width
        : stickTo === TooltipStickTo.Center
          ? x + width / 2
          : x; // TooltipStickTo.Left
  return {
    x: stickX,
    width: 0,
    y,
    height,
  };
}
