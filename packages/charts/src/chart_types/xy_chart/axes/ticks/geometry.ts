/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './labels';
import type { TextAlign } from '../../../../common/text_utils';
import { getPercentageValue, HorizontalAlignment, Position, VerticalAlignment } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { innerPad } from '../../../../utils/dimensions';
import type { AxisStyle, TextAlignment, TextOffset } from '../../../../utils/themes/theme';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';

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
      if (rotation % 180 !== 0) {
        return rotation > 0 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
      }
      return HorizontalAlignment.Center;
    case Position.Bottom:
      if (rotation % 180 !== 0) {
        return rotation > 0 ? HorizontalAlignment.Left : HorizontalAlignment.Right;
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
      if (rotation % 180 === 0) {
        return isNear ? VerticalAlignment.Bottom : VerticalAlignment.Top;
      }
      return VerticalAlignment.Middle;
    case Position.Bottom:
      if (rotation % 180 === 0) {
        return rotation === 0 ? VerticalAlignment.Top : VerticalAlignment.Bottom;
      }
      return VerticalAlignment.Middle;
    case Position.Left:
      return VerticalAlignment.Middle;
    case Position.Right:
      return VerticalAlignment.Middle;
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
  const labelInnerPadding = innerPad(tickLabel.padding);
  const userOffsets = getUserTextOffsets(maxLabelBox, labelBox, textOffset);
  const paddedTickDimension = tickDimension + labelInnerPadding;

  const alignment = {
    horizontal: getHorizontalAlign(position, rotation, textAlignment.horizontal),
    vertical: getVerticalAlign(position, rotation, textAlignment.vertical),
  };

  const { horizontal: horizontalAlign, vertical: verticalAlign } = alignment;

  const anchor = (() => {
    const axisNetSize = (isVerticalAxis(position) ? axisSize.width : axisSize.height) - paddedTickDimension;

    if (isHorizontalAxis(position)) {
      return {
        x: tickPosition,
        y: position === Position.Top ? axisNetSize : paddedTickDimension,
      };
    }

    return {
      x: position === Position.Left ? axisNetSize : paddedTickDimension,
      y: tickPosition,
    };
  })();

  const verticalBoxOffset = (() => {
    if (isVerticalAxis(position)) {
      if (labelBox.lines.length === 1) return 0;
      switch (verticalAlign) {
        case VerticalAlignment.Top:
          return 0;
        case VerticalAlignment.Middle:
          return -labelBox.height / 2;
        case VerticalAlignment.Bottom:
          return -labelBox.height;
      }
    }

    const baselineHeight = labelBox.lines.length === 1 ? 0 : labelBox.height;

    const offset = (() => {
      switch (verticalAlign) {
        case VerticalAlignment.Top:
          return 0;
        case VerticalAlignment.Middle:
          return (maxLabelBox.bboxHeight - baselineHeight) / 2;
        case VerticalAlignment.Bottom:
          return maxLabelBox.bboxHeight - baselineHeight;
      }
    })();

    return position === Position.Top ? offset - maxLabelBox.bboxHeight : offset;
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
