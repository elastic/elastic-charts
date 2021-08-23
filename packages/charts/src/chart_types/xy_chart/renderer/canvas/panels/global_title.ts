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
import { AxisProps } from '../axes'; // todo revise if it should rely on AxisProps or axis-anything
import { renderText } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';
import { getFontStyle } from './panel_title';

type TitleProps = Pick<AxisProps, 'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'> & {
  anchorPoint: Point;
};

/** @internal */
export function renderTitle(
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
) {
  if (!title || !axisTitle.visible) {
    return null;
  }
  const horizontal = isHorizontalAxis(position);
  const font = getFontStyle(axisTitle);
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const maxLabelBoxSize = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
  const labelSize = tickLabel.visible ? maxLabelBoxSize + innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;

  const panelTitleDimension = panelTitle ? getTitleDimension(axisPanelTitle) : 0;
  const titlePadding = axisTitle.visible && title ? axisTitle.padding : 0;

  const offset =
    position === Position.Left || position === Position.Top
      ? outerPad(titlePadding)
      : labelSize + tickDimension + innerPad(titlePadding) + panelTitleDimension;

  const left = anchorPoint.x + (horizontal ? 0 : offset);
  const top = anchorPoint.y + (horizontal ? offset : height);

  if (debug) {
    renderDebugRect(
      ctx,
      { x: left, y: top, width: horizontal ? width : height, height: font.fontSize },
      horizontal ? 0 : -90,
    );
  }

  renderText(
    ctx,
    { x: left + (horizontal ? width : font.fontSize) / 2, y: top + (horizontal ? font.fontSize : -height) / 2 },
    title ?? '', // title is always a string due to caller; consider turning `title` to be obligate string upstream
    font,
    horizontal ? 0 : -90,
  );
}
