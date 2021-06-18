/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AxisProps } from '.';
import { Position } from '../../../../../utils/common';
import { getSimplePadding } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { renderText } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';
import { getFontStyle } from './panel_title';

type TitleProps = Pick<AxisProps, 'panelTitle' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'> & {
  anchorPoint: Point;
};

/** @internal */
export function renderTitle(ctx: CanvasRenderingContext2D, props: TitleProps) {
  if (!props.axisSpec.title || !props.axisStyle.axisTitle.visible) {
    return;
  }

  const horizontal = isHorizontalAxis(props.axisSpec.position);
  const {
    size: { width, height },
    axisSpec: { position, hide: hideAxis, title },
    dimension: { maxLabelBboxWidth, maxLabelBboxHeight },
    axisStyle: { axisTitle, axisPanelTitle, tickLine, tickLabel },
    anchorPoint,
    debug,
    panelTitle,
  } = props;

  const font = getFontStyle(axisTitle);
  const titlePadding = getSimplePadding(axisTitle.visible && title ? axisTitle.padding : 0);
  const panelTitleDimension = panelTitle ? getTitleDimension(axisPanelTitle) : 0;
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const labelPadding = getSimplePadding(tickLabel.padding);
  const labelWidth = tickLabel.visible ? maxLabelBboxWidth + labelPadding.outer + labelPadding.inner : 0;
  const labelHeight = tickLabel.visible ? maxLabelBboxHeight + labelPadding.outer + labelPadding.inner : 0;

  const left = horizontal
    ? anchorPoint.x
    : position === Position.Left
    ? anchorPoint.x + titlePadding.outer
    : anchorPoint.x + tickDimension + labelWidth + titlePadding.inner + panelTitleDimension;
  const top = horizontal
    ? position === Position.Top
      ? anchorPoint.y + titlePadding.outer
      : anchorPoint.y + labelHeight + tickDimension + titlePadding.inner + panelTitleDimension
    : anchorPoint.y + height;

  if (debug) {
    renderDebugRect(
      ctx,
      { x: left, y: top, width: horizontal ? width : height, height: font.fontSize },
      undefined,
      undefined,
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

/*
function renderVerticalTitle(ctx: CanvasRenderingContext2D, props: TitleProps) {
  const {
    size: { height },
    axisSpec: { position, hide: hideAxis, title },
    dimension: { maxLabelBboxWidth },
    axisStyle: { axisTitle, axisPanelTitle, tickLine, tickLabel },
    anchorPoint,
    debug,
    panelTitle,
  } = props;

  const font = getFontStyle(axisTitle);
  const titlePadding = getSimplePadding(axisTitle.visible && title ? axisTitle.padding : 0);
  const panelTitleDimension = panelTitle ? getTitleDimension(axisPanelTitle) : 0;
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const labelPadding = getSimplePadding(tickLabel.padding);
  const labelWidth = tickLabel.visible ? labelPadding.outer + maxLabelBboxWidth + labelPadding.inner : 0;

  const left =
    position === Position.Left
      ? anchorPoint.x + titlePadding.outer
      : anchorPoint.x + tickDimension + labelWidth + titlePadding.inner + panelTitleDimension;
  const top = anchorPoint.y + height;

  if (debug) {
    renderDebugRect(ctx, { x: left, y: top, width: height, height: font.fontSize }, undefined, undefined, -90);
  }

  renderText(ctx, { x: left + font.fontSize / 2, y: top - height / 2 }, title, font, -90);
}
*/

/*
function renderHorizontalTitle(ctx: CanvasRenderingContext2D, props: TitleProps) {
  const {
    size: { width },
    axisSpec: { position, hide: hideAxis, title },
    dimension: { maxLabelBboxHeight },
    axisStyle: { axisTitle, axisPanelTitle, tickLine, tickLabel },
    anchorPoint,
    debug,
    panelTitle,
  } = props;

  const font = getFontStyle(axisTitle);
  const titlePadding = getSimplePadding(axisTitle.visible && title ? axisTitle.padding : 0);
  const panelTitleDimension = panelTitle ? getTitleDimension(axisPanelTitle) : 0;
  const tickDimension = shouldShowTicks(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
  const labelPadding = getSimplePadding(tickLabel.padding);
  const labelHeight = tickLabel.visible ? maxLabelBboxHeight + labelPadding.outer + labelPadding.inner : 0;

  const left = anchorPoint.x;
  const top =
    position === Position.Top
      ? anchorPoint.y + titlePadding.outer
      : anchorPoint.y + labelHeight + tickDimension + titlePadding.inner + panelTitleDimension;

  if (debug) {
    renderDebugRect(ctx, { x: left, y: top, width, height: font.fontSize });
  }

  renderText(
    ctx,
    { x: left + width / 2, y: top + font.fontSize / 2 },
    title ?? '', // title is always a string due to caller; consider turning `title` to be obligate string upstream
    font,
  );
}
*/
