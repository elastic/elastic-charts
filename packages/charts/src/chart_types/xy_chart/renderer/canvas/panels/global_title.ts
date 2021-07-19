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

import { Position } from '../../../../../utils/common';
import { getSimplePadding } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisProps } from '../axes'; // todo revise if it should rely on AxisProps or axis-anything
import { renderText } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';
import { getFontStyle } from './panel_title';

type TitleProps = Pick<
  AxisProps,
  'panelTitle' | 'titlePosition' | 'axisSpec' | 'axisStyle' | 'size' | 'dimension' | 'debug'
> & {
  anchorPoint: Point;
};

/** @internal */
export function renderTitle(ctx: CanvasRenderingContext2D, props: TitleProps) {
  if (!props.axisSpec.title || !props.axisStyle.axisTitle.visible) {
    return;
  }

  const {
    size: { width, height },
    axisSpec: { position, hide: hideAxis, title, titlePosition },
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
  const horizontal = isHorizontalAxis(props.axisSpec.position);
  const isTop = titlePosition === 'top';
  const maxLabelBoxSize = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
  const labelSize = tickLabel.visible ? maxLabelBoxSize + labelPadding.outer + labelPadding.inner : 0;
  const offset =
    position === Position.Left || position === Position.Top
      ? titlePadding.outer
      : labelSize + tickDimension + titlePadding.inner + panelTitleDimension; // the amount that the text is pushed in from the top of the text

  const left = isTop
    ? position === Position.Left
      ? 0
      : anchorPoint.x + offset
    : anchorPoint.x + (horizontal ? 0 : offset);
  const top = anchorPoint.y + (horizontal ? offset : isTop ? font.fontSize - anchorPoint.y : height);

  if (debug) {
    const textWidth = ctx.measureText(title ?? '').width;
    renderDebugRect(
      ctx,
      {
        x: left,
        y: top,
        width: horizontal ? width : isTop ? (position === Position.Left ? textWidth : -textWidth) : height,
        height: font.fontSize,
      },
      undefined,
      undefined,
      horizontal || isTop ? 0 : -90,
    );
  }
  if (titlePosition === 'top') {
    renderText(
      ctx,
      { x: left, y: top + font.fontSize / 2 },
      title ?? '', // title is always a string due to caller; consider turning `title` to be obligate string upstream
      { ...font, align: position === Position.Left ? 'left' : 'right' },
      0,
      // horizontal ? 0 : -90,
    );
  } else {
    renderText(
      ctx,
      { x: left + (horizontal ? width : font.fontSize) / 2, y: top + (horizontal ? font.fontSize : -height) / 2 },
      title ?? '', // title is always a string due to caller; consider turning `title` to be obligate string upstream
      font,
      horizontal ? 0 : -90,
    );
  }
}
