/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderText, TextFont } from '../../../../../renderers/canvas/primitives/text';
import { renderDebugRect } from '../../../../../renderers/canvas/utils/debug';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../../../../utils/common';
import { innerPad, outerPad } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { wrapText } from '../../../../../utils/text/wrap';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getAllAxisLayersGirth, getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisProps } from '../axes';

type PanelTitleProps = Pick<
  AxisProps,
  'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug' | 'multilayerTimeAxis'
>;
type TitleProps = PanelTitleProps & { anchorPoint: Point };

const titleFontDefaults: Omit<TextFont, 'fontFamily' | 'textColor' | 'fontSize'> = {
  fontVariant: 'normal',
  fontStyle: 'normal', // may be overridden (happens if prop on axis style is defined)
  fontWeight: 'bold',
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
    axisSpec,
    axisStyle: { axisPanelTitle, axisTitle, tickLabel, tickLine },
    panelTitle,
    debug,
    anchorPoint,
    multilayerTimeAxis,
  }: TitleProps,
  locale: string,
) {
  const { position, hide: hideAxis, title, timeAxisLayerCount } = axisSpec;
  const titleToRender = panel ? panelTitle : title;
  const axisTitleToUse = panel ? axisPanelTitle : axisTitle;
  if (!titleToRender || !axisTitleToUse.visible) {
    return;
  }
  const otherAxisTitleToUse = panel ? axisTitle : axisPanelTitle;
  const otherTitle = panel ? title : panelTitle;
  const horizontal = isHorizontalAxis(position);
  const font: TextFont = { ...titleFontDefaults, ...axisTitleToUse, textColor: axisTitleToUse.fill };
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
  const allLayersGirth = getAllAxisLayersGirth(timeAxisLayerCount, maxLabelBoxGirth, multilayerTimeAxis);
  const labelPaddingSum = innerPad(tickLabel.padding) + outerPad(tickLabel.padding);
  const labelSize = tickLabel.visible ? allLayersGirth + labelPaddingSum : 0;
  const otherTitleDimension = otherTitle ? getTitleDimension(otherAxisTitleToUse) : 0;
  const titlePadding = panel || (axisTitleToUse.visible && title) ? axisTitleToUse.padding : 0;
  const rotation = horizontal ? 0 : -90;
  const offset =
    position === Position.Left || position === Position.Top
      ? outerPad(titlePadding) + (panel ? otherTitleDimension : 0)
      : tickDimension + labelSize + innerPad(titlePadding) + (panel ? 0 : otherTitleDimension);
  const x = anchorPoint.x + (horizontal ? 0 : offset);
  const y = anchorPoint.y + (horizontal ? offset : height);
  const textX = horizontal ? width / 2 + (panel ? 0 : x) : font.fontSize / 2 + (panel ? offset : x);
  const textY = horizontal ? font.fontSize / 2 + (panel ? offset : y) : (panel ? height : -height + 2 * y) / 2;
  const wrappedText = wrapText(
    titleToRender ?? '',
    font,
    font.fontSize,
    horizontal ? width : height,
    1,
    measureText(ctx),
    locale,
  );
  if (!wrappedText[0]) return;
  if (debug) renderDebugRect(ctx, { x, y, width: horizontal ? width : height, height: font.fontSize }, rotation);
  renderText(ctx, { x: textX, y: textY }, wrappedText[0], font, rotation);
}
