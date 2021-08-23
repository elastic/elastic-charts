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
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisProps } from '../axes';
import { renderText, TextFont } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';

type PanelTitleProps = Pick<AxisProps, 'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'>;
type TitleProps = PanelTitleProps & { anchorPoint: Point };

const titleFontDefaults: Omit<TextFont, 'fontFamily' | 'textColor' | 'fontSize'> = {
  fontVariant: 'normal',
  fontStyle: 'normal', // may be overridden (happens if prop on axis style is defined)
  fontWeight: 'bold',
  textOpacity: 1,
  align: 'center',
  baseline: 'middle',
};

/** @internal */
export function renderTitle(
  ctx: CanvasRenderingContext2D,
  panel: boolean,
  {
    size: { width, height },
    dimension: { maxLabelBboxWidth, maxLabelBboxHeight },
    axisSpec: { position, hide: hideAxis, title },
    axisStyle: { axisPanelTitle, axisTitle, tickLabel, tickLine },
    panelTitle,
    debug,
    anchorPoint,
  }: TitleProps,
) {
  const axisTitleToUse = panel ? axisPanelTitle : axisTitle;
  const otherAxisTitleToUse = panel ? axisTitle : axisPanelTitle;
  const titleToRender = panel ? panelTitle : title;
  const otherTitle = panel ? title : panelTitle;
  if (!titleToRender || !axisTitleToUse.visible) {
    return;
  }
  const horizontal = isHorizontalAxis(position);
  const font: TextFont = { ...titleFontDefaults, ...axisTitleToUse, textColor: axisTitleToUse.fill };
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

  renderText(ctx, { x: textX, y: textY }, titleToRender ?? '', font, horizontal ? 0 : -90);
}
