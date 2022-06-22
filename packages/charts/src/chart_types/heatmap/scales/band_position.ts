/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../geoms/types';
import { ScaleBand } from '../../../scales';
import { isContinuousScale } from '../../../scales/types';
import { Rotation } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { Point } from '../../../utils/point';
import { DEFAULT_SNAP_POSITION_BAND } from '../../xy_chart/crosshair/crosshair_utils';
import { isHorizontalRotation } from '../../xy_chart/state/utils/common';

/** @internal */
export function getHeatmapSnapPosition(
  value: string | number,
  scale: ScaleBand,
  totalBarsInCluster = 1,
): { band: number; position: number } | undefined {
  const position = scale.pureScale(value);
  if (Number.isNaN(position)) {
    return;
  }

  if (scale.bandwidth > 0) {
    const band = scale.bandwidth / (1 - scale.barsPadding);

    const halfPadding = 0;
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
export function getHeatmapCursorBandPosition(
  chartRotation: Rotation,
  panel: Dimensions,
  cursorPosition: Point,
  invertedValue: {
    value: any;
    withinBandwidth: boolean;
  },
  snapEnabled: boolean,
  xScale: ScaleBand,
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

  const snappedPosition = getHeatmapSnapPosition(invertedValue.value, xScale, 1);
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
