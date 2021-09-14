/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fillTextColor } from '../../../../../common/fill_text_color';
import { Font, TextAlign, TextBaseline } from '../../../../../common/text_utils';
import { Rect } from '../../../../../geoms/types';
import { HorizontalAlignment, Rotation, VerticalAlignment } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { BarGeometry } from '../../../../../utils/geometry';
import { TextAlignment, Theme } from '../../../../../utils/themes/theme';
import { LabelOverflowConstraint } from '../../../utils/specs';
import { renderText, wrapLines } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';
import { withPanelTransform } from '../utils/panel_transform';

interface BarValuesProps {
  barSeriesStyle: Theme['barSeriesStyle'];
  renderingArea: Dimensions;
  rotation: Rotation;
  debug: boolean;
  bars: BarGeometry[];
  panel: Dimensions;
}

const CHART_DIRECTION: Record<string, Rotation> = {
  BottomUp: 0,
  TopToBottom: 180,
  LeftToRight: 90,
  RightToLeft: -90,
};

/** @internal */
export function renderBarValues(ctx: CanvasRenderingContext2D, props: BarValuesProps) {
  const { bars, debug, rotation, renderingArea, barSeriesStyle, panel } = props;
  const { fontFamily, fontStyle, fill, alignment } = barSeriesStyle.displayValue;
  bars.forEach((bar) => {
    if (!bar.displayValue) {
      return;
    }
    const { text, fontSize, fontScale, overflowConstraints, isValueContainedInElement } = bar.displayValue;
    const shadowSize = getTextBorderSize(fill);
    const { fillColor, shadowColor } = getTextColors(fill, bar.color, shadowSize);
    const font: Font = {
      fontFamily,
      fontStyle: fontStyle ?? 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textColor: fillColor,
    };

    const { x, y, align, baseline, rect, overflow } = positionText(
      bar,
      bar.displayValue,
      rotation,
      barSeriesStyle.displayValue,
      alignment,
    );

    if (overflowConstraints.has(LabelOverflowConstraint.ChartEdges) && isOverflow(rect, renderingArea, rotation)) {
      return;
    }
    if (overflowConstraints.has(LabelOverflowConstraint.BarGeometry) && overflow) {
      return;
    }
    const { width, height, lines } = isValueContainedInElement
      ? wrapLines(ctx, text, font, fontSize, rotation === 0 || rotation === 180 ? bar.width : bar.height, 100)
      : { lines: [text], width: bar.displayValue.width, height: bar.displayValue.height };

    if (debug) withPanelTransform(ctx, panel, rotation, renderingArea, () => renderDebugRect(ctx, rect));

    lines.forEach((textLine, j) => {
      const origin = lineOrigin(x, y, rotation, j, lines.length, width, height);
      const fontAugment = { fontSize, align, baseline, shadow: shadowColor, shadowSize };
      withPanelTransform(ctx, panel, rotation, renderingArea, () =>
        renderText(ctx, origin, textLine, { ...font, ...fontAugment }, -rotation, 0, 0, fontScale),
      );
    });
  });
}

function lineOrigin(x: number, y: number, rotation: Rotation, i: number, max: number, width: number, height: number) {
  const size = Math.abs(rotation) === 90 ? width : height;
  const sizeMultiplier = rotation > 0 ? -(i - max + 1) : rotation === 0 ? i : 0;
  return { x, y: y + size * sizeMultiplier };
}

function positionText(
  geom: BarGeometry,
  valueBox: { width: number; height: number },
  chartRotation: Rotation,
  offsets: { offsetX: number; offsetY: number },
  alignment?: TextAlignment,
): { x: number; y: number; align: TextAlign; baseline: TextBaseline; rect: Rect; overflow: boolean } {
  const { offsetX, offsetY } = offsets;

  const horizontal = alignment?.horizontal;
  const vertical = alignment?.vertical;
  const horizontalOverflow = valueBox.width > geom.width || valueBox.height > geom.height;
  const verticalOverflow = valueBox.height > geom.width || valueBox.width > geom.height;

  switch (chartRotation) {
    case CHART_DIRECTION.TopToBottom: {
      const alignmentOffsetX =
        horizontal === HorizontalAlignment.Left
          ? geom.width / 2 - valueBox.width / 2
          : horizontal === HorizontalAlignment.Right
          ? -geom.width / 2 + valueBox.width / 2
          : 0;
      const alignmentOffsetY =
        vertical === VerticalAlignment.Top
          ? geom.height - valueBox.height
          : vertical === VerticalAlignment.Middle
          ? geom.height / 2 - valueBox.height / 2
          : 0;
      const x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
      const y = geom.y + offsetY + alignmentOffsetY;
      const rect = { x: x - valueBox.width / 2, y, width: valueBox.width, height: valueBox.height };
      return { x, y, rect, align: 'center', baseline: 'bottom', overflow: horizontalOverflow };
    }
    case CHART_DIRECTION.RightToLeft: {
      const alignmentOffsetX =
        horizontal === HorizontalAlignment.Right
          ? geom.height - valueBox.width
          : horizontal === HorizontalAlignment.Center
          ? geom.height / 2 - valueBox.width / 2
          : 0;
      const alignmentOffsetY =
        vertical === VerticalAlignment.Bottom
          ? -geom.width + valueBox.height
          : vertical === VerticalAlignment.Middle
          ? -geom.width / 2 + valueBox.height / 2
          : 0;
      const x = geom.x + geom.width + offsetY + alignmentOffsetY;
      const y = geom.y - offsetX + alignmentOffsetX;
      const rect = { x: x - valueBox.height, y, width: valueBox.height, height: valueBox.width };
      return { x, y, rect, align: 'left', baseline: 'top', overflow: verticalOverflow };
    }
    case CHART_DIRECTION.LeftToRight: {
      const alignmentOffsetX =
        horizontal === HorizontalAlignment.Left
          ? geom.height - valueBox.width
          : horizontal === HorizontalAlignment.Center
          ? geom.height / 2 - valueBox.width / 2
          : 0;
      const alignmentOffsetY =
        vertical === VerticalAlignment.Bottom
          ? geom.width - valueBox.height
          : vertical === VerticalAlignment.Middle
          ? geom.width / 2 - valueBox.height / 2
          : 0;
      const x = geom.x - offsetY + alignmentOffsetY;
      const y = geom.y + offsetX + alignmentOffsetX;
      const rect = { x, y, width: valueBox.height, height: valueBox.width };
      return { x, y, rect, align: 'right', baseline: 'top', overflow: verticalOverflow };
    }
    case CHART_DIRECTION.BottomUp:
    default: {
      const alignmentOffsetX =
        horizontal === HorizontalAlignment.Left
          ? -geom.width / 2 + valueBox.width / 2
          : horizontal === HorizontalAlignment.Right
          ? geom.width / 2 - valueBox.width / 2
          : 0;
      const alignmentOffsetY =
        vertical === VerticalAlignment.Bottom
          ? geom.height - valueBox.height
          : vertical === VerticalAlignment.Middle
          ? geom.height / 2 - valueBox.height / 2
          : 0;
      const x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
      const y = geom.y - offsetY + alignmentOffsetY;
      const rect = { x: x - valueBox.width / 2, y, width: valueBox.width, height: valueBox.height };
      return { x, y, rect, align: 'center', baseline: 'top', overflow: horizontalOverflow };
    }
  }
}

function isOverflow(rect: Rect, chartDimensions: Dimensions, chartRotation: Rotation) {
  const vertical = Math.abs(chartRotation) === 90;
  const cWidth = vertical ? chartDimensions.height : chartDimensions.width;
  const cHeight = vertical ? chartDimensions.width : chartDimensions.height;
  return rect.x < 0 || rect.x + rect.width > cWidth || rect.y < 0 || rect.y + rect.height > cHeight;
}

const DEFAULT_VALUE_COLOR = 'black';
// a little bit of alpha makes black font more readable
const DEFAULT_VALUE_BORDER_COLOR = 'rgba(255, 255, 255, 0.8)';
const DEFAULT_VALUE_BORDER_SOLID_COLOR = 'rgb(255, 255, 255)';
const TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
type ValueFillDefinition = Theme['barSeriesStyle']['displayValue']['fill'];

function getTextColors(
  fillDefinition: ValueFillDefinition,
  geometryColor: string,
  borderSize: number,
): { fillColor: string; shadowColor: string } {
  if (typeof fillDefinition === 'string') {
    return { fillColor: fillDefinition, shadowColor: TRANSPARENT_COLOR };
  }
  if ('color' in fillDefinition) {
    return {
      fillColor: fillDefinition.color,
      shadowColor: fillDefinition.borderColor || TRANSPARENT_COLOR,
    };
  }
  const fillColor = fillTextColor(DEFAULT_VALUE_COLOR, true, 4.5, geometryColor);

  // If the border is too wide it can overlap between a letter or another
  // therefore use a solid color for thinker borders
  const defaultBorderColor = borderSize < 2 ? DEFAULT_VALUE_BORDER_COLOR : DEFAULT_VALUE_BORDER_SOLID_COLOR;
  const shadowColor =
    'textBorder' in fillDefinition ? fillTextColor(defaultBorderColor, true, 4.5, fillColor) : TRANSPARENT_COLOR;

  return {
    fillColor,
    shadowColor,
  };
}

const DEFAULT_BORDER_WIDTH = 1.5;
const MAX_BORDER_WIDTH = 8;

function getTextBorderSize(fill: ValueFillDefinition): number {
  if (typeof fill === 'string') {
    return DEFAULT_BORDER_WIDTH;
  }
  if ('borderWidth' in fill) {
    return Math.min(fill.borderWidth ?? DEFAULT_BORDER_WIDTH, MAX_BORDER_WIDTH);
  }
  const borderWidth =
    'textBorder' in fill && typeof fill.textBorder === 'number' ? fill.textBorder : DEFAULT_BORDER_WIDTH;
  return Math.min(borderWidth, MAX_BORDER_WIDTH);
}
