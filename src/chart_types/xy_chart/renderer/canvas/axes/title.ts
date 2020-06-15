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
import { Position } from '../../../../../utils/commons';
import { Font, FontStyle } from '../../../../partition_chart/layout/types/types';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { renderText } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';

/** @internal */
export function renderTitle(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const {
    axisSpec: { title, position },
  } = props;
  if (!title) {
    return null;
  }
  if (isHorizontalAxis(position)) {
    return renderHorizontalTitle(ctx, props);
  }
  return renderVerticalTitle(ctx, props);
}

function renderVerticalTitle(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const {
    axisPosition: { height },
    axisSpec: { title, position, tickSize, tickPadding },
    axisTicksDimensions: { maxLabelBboxWidth },
    axisConfig: { axisTitleStyle },
    debug,
  } = props;
  if (!title) {
    return null;
  }
  const { padding, ...titleStyle } = axisTitleStyle;
  const top = height;
  const left = position === Position.Left ? 0 : tickSize + tickPadding + maxLabelBboxWidth + padding;

  if (debug) {
    renderDebugRect(ctx, { x: left, y: top, width: height, height: titleStyle.fontSize }, undefined, undefined, -90);
  }

  const font: Font = {
    fontFamily: titleStyle.fontFamily,
    fontVariant: 'normal',
    fontStyle: titleStyle.fontStyle ? (titleStyle.fontStyle as FontStyle) : 'normal',
    fontWeight: 'normal',
    textColor: titleStyle.fill,
    textOpacity: 1,
  };
  renderText(
    ctx,
    {
      x: left + titleStyle.fontSize / 2,
      y: top - height / 2,
    },
    title,
    { ...font, fill: titleStyle.fill, align: 'center', baseline: 'middle', fontSize: titleStyle.fontSize },
    -90,
  );
}
function renderHorizontalTitle(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const {
    axisPosition: { width },
    axisSpec: { title, position, tickSize, tickPadding },
    axisTicksDimensions: { maxLabelBboxHeight },
    axisConfig: {
      axisTitleStyle: { padding, ...titleStyle },
    },
    debug,
  } = props;

  if (!title) {
    return;
  }

  const top = position === Position.Top ? 0 : maxLabelBboxHeight + tickPadding + tickSize + padding;

  const left = 0;
  if (debug) {
    renderDebugRect(ctx, { x: left, y: top, width, height: titleStyle.fontSize });
  }
  const font: Font = {
    fontFamily: titleStyle.fontFamily,
    fontVariant: 'normal',
    fontStyle: titleStyle.fontStyle ? (titleStyle.fontStyle as FontStyle) : 'normal',
    fontWeight: 'normal',
    textColor: titleStyle.fill,
    textOpacity: 1,
  };
  renderText(
    ctx,
    {
      x: left + width / 2,
      y: top + titleStyle.fontSize / 2,
    },
    title,
    {
      ...font,
      fill: titleStyle.fill,
      align: 'center',
      baseline: 'middle',
      fontSize: titleStyle.fontSize,
    },
  );
}
