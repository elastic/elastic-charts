/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './labels';
import type { TextAlign } from '../../../../common/text_utils';
import {
  degToRad,
  getPercentageValue,
  HorizontalAlignment,
  Position,
  VerticalAlignment,
} from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { innerPad } from '../../../../utils/dimensions';
import type { Point } from '../../../../utils/point';
import type { AxisStyle, TextAlignment, TextOffset } from '../../../../utils/themes/theme';
import { isHorizontalAxis } from '../../utils/axis_type_utils';

/** @internal */
export interface TickLabelProps {
  center: Point;
  horizontalAlign: ResolvedHorizontalAlign;
  verticalAlign: ResolvedVerticalAlign;
  textAlign: TextAlign;
}

/** @internal */
export type ResolvedHorizontalAlign = Extract<
  HorizontalAlignment,
  typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Center | typeof HorizontalAlignment.Right
>;
/** @internal */
export type ResolvedVerticalAlign = Extract<
  VerticalAlignment,
  typeof VerticalAlignment.Top | typeof VerticalAlignment.Middle | typeof VerticalAlignment.Bottom
>;

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
  position: Position,
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
  const flip = (h: ResolvedHorizontalAlign): ResolvedHorizontalAlign =>
    h === HorizontalAlignment.Left ? HorizontalAlignment.Right : HorizontalAlignment.Left;

  switch (position) {
    case Position.Left:
      return isNear ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    case Position.Right:
      return isNear ? HorizontalAlignment.Left : HorizontalAlignment.Right;
    case Position.Top:
    case Position.Bottom: {
      // At rotations that are a multiple of 90° the rotated bbox is symmetric along the axis
      // there is no preferred corner and the bbox is centered on the tick.
      if (rotation % 90 === 0) return HorizontalAlignment.Center;
      const positive = rotation > 0;
      const nearCorner: ResolvedHorizontalAlign =
        position === Position.Bottom
          ? positive
            ? HorizontalAlignment.Left
            : HorizontalAlignment.Right
          : positive
            ? HorizontalAlignment.Right
            : HorizontalAlignment.Left;
      return isNear ? nearCorner : flip(nearCorner);
    }
  }
}

function getVerticalAlign(position: Position, rotation: number, alignment: VerticalAlignment): ResolvedVerticalAlign {
  if (
    alignment === VerticalAlignment.Middle ||
    alignment === VerticalAlignment.Top ||
    alignment === VerticalAlignment.Bottom
  ) {
    return alignment;
  }

  const isNear = alignment === VerticalAlignment.Near;
  const flip = (v: ResolvedVerticalAlign): ResolvedVerticalAlign =>
    v === VerticalAlignment.Top ? VerticalAlignment.Bottom : VerticalAlignment.Top;

  switch (position) {
    case Position.Top:
      return isNear ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    case Position.Bottom:
      return isNear ? VerticalAlignment.Top : VerticalAlignment.Bottom;
    case Position.Left:
    case Position.Right: {
      // Symmetric to the horizontal case: at ±90° (and 0°/180°) the rotated bbox is symmetric
      // along the axis, so the bbox is centered on the tick.
      if (rotation % 90 === 0) return VerticalAlignment.Middle;
      const positive = rotation > 0;
      const nearCorner: ResolvedVerticalAlign =
        position === Position.Left
          ? positive
            ? VerticalAlignment.Bottom
            : VerticalAlignment.Top
          : positive
            ? VerticalAlignment.Top
            : VerticalAlignment.Bottom;
      return isNear ? nearCorner : flip(nearCorner);
    }
  }
}

/** @internal */
export function rotateVector({ x, y }: Point, rotation: number): Point {
  if (rotation === 0) return { x, y };
  const radians = degToRad(rotation);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function getAnchor(
  position: number,
  tickSize: number,
  horizontalAlignment: ResolvedHorizontalAlign,
  verticalAlignment: ResolvedVerticalAlign,
  axisPosition: Position,
  axisSize: Size,
  labelBox: TickLabelBox,
  maxLabelBox: TickLabelBox,
): Point {
  const horizontal =
    horizontalAlignment === HorizontalAlignment.Left ? 0 : horizontalAlignment === HorizontalAlignment.Right ? 1 : 0.5;
  const vertical =
    verticalAlignment === VerticalAlignment.Top ? 0 : verticalAlignment === VerticalAlignment.Bottom ? 1 : 0.5;

  if (isHorizontalAxis(axisPosition)) {
    const x = position + (0.5 - horizontal) * labelBox.bboxWidth;
    const bandHeight = maxLabelBox.bboxHeight;
    if (axisPosition === Position.Bottom) {
      const innerY = tickSize;
      const top = innerY + vertical * (bandHeight - labelBox.bboxHeight);
      return { x, y: top + labelBox.bboxHeight / 2 };
    } else {
      const innerY = axisSize.height - tickSize;
      const bottom = innerY - (1 - vertical) * (bandHeight - labelBox.bboxHeight);
      return { x, y: bottom - labelBox.bboxHeight / 2 };
    }
  } else {
    const y = position + (0.5 - vertical) * labelBox.bboxHeight;
    const bandWidth = maxLabelBox.bboxWidth;
    if (axisPosition === Position.Left) {
      const innerX = axisSize.width - tickSize;
      const bboxRight = innerX - (1 - horizontal) * (bandWidth - labelBox.bboxWidth);
      return { x: bboxRight - labelBox.bboxWidth / 2, y };
    } else {
      const innerX = tickSize;
      const bboxLeft = innerX + horizontal * (bandWidth - labelBox.bboxWidth);
      return { x: bboxLeft + labelBox.bboxWidth / 2, y };
    }
  }
}
/** @internal */
export function getTickLabelPosition(
  { tickLine, tickLabel }: AxisStyle,
  tickPosition: number,
  position: Position,
  rotation: number,
  axisSize: Size,
  maxLabelBox: TickLabelBox,
  showTicks: boolean,
  textOffset: TextOffset,
  textAlignment: TextAlignment,
  labelBox: TickLabelBox = maxLabelBox,
): TickLabelProps {
  const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
  const userOffsets = getUserTextOffsets(maxLabelBox, labelBox, textOffset);
  const paddedTickDimension = tickDimension + innerPad(tickLabel.padding);

  const horizontalAlign = getHorizontalAlign(position, rotation, textAlignment.horizontal);
  const verticalAlign = getVerticalAlign(position, rotation, textAlignment.vertical);

  const anchor = getAnchor(
    tickPosition,
    paddedTickDimension,
    horizontalAlign,
    verticalAlign,
    position,
    axisSize,
    labelBox,
    maxLabelBox,
  );

  const local = rotateVector(userOffsets.local, rotation);
  const center: Point = {
    x: anchor.x + userOffsets.global.x + local.x,
    y: anchor.y + userOffsets.global.y + local.y,
  };

  return {
    center,
    horizontalAlign,
    verticalAlign,
    textAlign: horizontalAlign,
  };
}
