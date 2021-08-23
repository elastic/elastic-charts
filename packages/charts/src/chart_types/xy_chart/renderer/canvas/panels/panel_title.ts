/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '../../../../../utils/common';
import { innerPad, outerPad } from '../../../../../utils/dimensions';
import { TextStyle } from '../../../../../utils/themes/theme'; // todo revise if it should rely on axis-anything
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisProps } from '../axes';
import { renderText, TextFont } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';

type PanelTitleProps = Pick<AxisProps, 'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'>;

/** @internal */
export function renderPanelTitle(ctx: CanvasRenderingContext2D, props: PanelTitleProps) {
  const {
    size: { width, height },
    dimension: { maxLabelBboxWidth, maxLabelBboxHeight },
    axisSpec: { position, hide: hideAxis, title },
    axisStyle: { axisPanelTitle, axisTitle, tickLine, tickLabel },
    panelTitle,
    debug,
  } = props;
  if (!panelTitle || !axisPanelTitle.visible) {
    return null;
  }
  const horizontalAxis = isHorizontalAxis(position);

  const font = getFontStyle(axisPanelTitle);
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const titleDimension = title ? getTitleDimension(axisTitle) : 0;
  const tickLabelPad = tickLabel.padding;
  const maxLabelBboxSize = horizontalAxis ? maxLabelBboxHeight : maxLabelBboxWidth;
  const labelSize = tickLabel.visible ? maxLabelBboxSize + outerPad(tickLabelPad) + innerPad(tickLabelPad) : 0;

  if (horizontalAxis) {
    const top =
      position === Position.Top
        ? titleDimension + outerPad(axisPanelTitle.padding)
        : labelSize + tickDimension + innerPad(axisPanelTitle.padding);

    if (debug) renderDebugRect(ctx, { x: 0, y: top, width, height: font.fontSize });

    renderText(ctx, { x: width / 2, y: top + font.fontSize / 2 }, panelTitle, font);
  } else {
    const top = height;
    const left =
      position === Position.Left
        ? titleDimension + outerPad(axisPanelTitle.padding)
        : tickDimension + labelSize + innerPad(axisPanelTitle.padding);

    if (debug) renderDebugRect(ctx, { x: left, y: top, width: height, height: font.fontSize }, -90);

    renderText(ctx, { x: left + font.fontSize / 2, y: top - height / 2 }, panelTitle, font, -90);
  }
}

/** @internal */
export function getFontStyle({ fontFamily, fontStyle, fill, fontSize }: TextStyle): TextFont {
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
