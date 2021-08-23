/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '../../../../../utils/common';
import { innerPad, outerPad } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { TextStyle } from '../../../../../utils/themes/theme'; // todo revise if it should rely on axis-anything
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisProps } from '../axes';
import { renderText, TextFont } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';

type PanelTitleProps = Pick<AxisProps, 'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'>;
type TitleProps = PanelTitleProps & { anchorPoint: Point };

/** @internal */
export function renderPanelTitle(ctx: CanvasRenderingContext2D, props: PanelTitleProps) {
  const props2: TitleProps = { ...props, anchorPoint: { x: 0, y: 0 } };
  renderUnifiedTitle(ctx, props2, true);
}

/** @internal */
export function renderTitle(ctx: CanvasRenderingContext2D, props: TitleProps) {
  renderUnifiedTitle(ctx, props, false);
}

function getFontStyle({ fontFamily, fontStyle, fill, fontSize }: TextStyle): TextFont {
  return {
    fontFamily,
    fontVariant: 'normal',
    fontStyle: fontStyle ?? 'normal',
    fontWeight: 'bold',
    textColor: fill,
    textOpacity: 1,
    align: 'center',
    baseline: 'middle',
    fontSize,
  };
}

function renderUnifiedTitle(
  ctx: CanvasRenderingContext2D,
  {
    size: { width, height },
    dimension: { maxLabelBboxWidth, maxLabelBboxHeight },
    axisSpec: { position, hide: hideAxis, title },
    axisStyle: { axisPanelTitle, axisTitle, tickLabel, tickLine },
    panelTitle,
    debug,
    anchorPoint,
  }: TitleProps,
  panel: boolean,
) {
  const axisTitleToUse = panel ? axisPanelTitle : axisTitle;
  const otherAxisTitleToUse = panel ? axisTitle : axisPanelTitle;
  const titleToRender = panel ? panelTitle : title;
  const otherTitle = panel ? title : panelTitle;
  if (!titleToRender || !axisTitleToUse.visible) {
    return;
  }
  const horizontal = isHorizontalAxis(position);
  const font = getFontStyle(axisTitleToUse);
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const maxLabelBoxSize = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
  const labelSize = tickLabel.visible ? maxLabelBoxSize + innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
  const otherTitleDimension = otherTitle ? getTitleDimension(otherAxisTitleToUse) : 0;
  const titlePadding = panel || (axisTitleToUse.visible && title) ? axisTitleToUse.padding : 0;

  const offset =
    position === Position.Left || position === Position.Top
      ? outerPad(titlePadding) + (panel ? otherTitleDimension : 0)
      : tickDimension + labelSize + innerPad(titlePadding) + (panel ? 0 : otherTitleDimension);

  const x = anchorPoint.x + (horizontal ? 0 : offset);
  const y = anchorPoint.y + (horizontal ? offset : height);
  const textX = panel
    ? horizontal
      ? width / 2
      : offset + font.fontSize / 2
    : x + (horizontal ? width / 2 : font.fontSize / 2);
  const textY = panel
    ? horizontal
      ? offset + font.fontSize / 2
      : height / 2
    : y + (horizontal ? font.fontSize / 2 : -height / 2);

  if (debug)
    renderDebugRect(ctx, { x, y, width: horizontal ? width : height, height: font.fontSize }, horizontal ? 0 : -90);

  // title is always a string due to caller; consider turning `title` to be obligate string upstream
  renderText(ctx, { x: textX, y: textY }, titleToRender ?? '', font, horizontal ? 0 : -90);
}
