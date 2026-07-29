/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisProps } from './axis_props';
import { renderAxisLine } from './line';
import { renderTicks } from './tick';
import { renderTickLabel } from './tick_label';
import { withClip } from '../../../../../renderers/canvas';
import { Position } from '../../../../../utils/common';
import { innerPad } from '../../../../../utils/dimensions';
import { getTitleDimension } from '../../../axes/dimensions';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { shouldShowTicks } from '../../../utils/axis_utils';

const tickLabelClipRect = (props: AxisProps) => {
  const { size, dimension, axisStyle, axisSpec, layout } = props;
  const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);

  const isHorizontal = isHorizontalAxis(axisSpec.position);

  const near =
    (showTicks ? axisStyle.tickLine.size + axisStyle.tickLine.padding : 0) + innerPad(axisStyle.tickLabel.padding);
  const start =
    axisSpec.position === Position.Left || axisSpec.position === Position.Top
      ? getTitleDimension(axisStyle.axisTitle)
      : near;

  return {
    x: isHorizontal ? -dimension.bboxWidth / 2 : start,
    y: isHorizontal ? start : -dimension.bboxHeight / 2,
    width: isHorizontal ? size.width + dimension.bboxWidth : size.width - layout.band.fixed + start,
    height: isHorizontal ? size.height - layout.band.fixed + start : size.height + dimension.bboxHeight,
  };
};

/** @internal */
export function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const { ticks, axisStyle, axisSpec, secondary, layerGirth, multilayerTimeAxis } = props;
  const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);

  if (!secondary && showTicks) {
    renderTicks(ctx, ticks, props);
  }

  if (!secondary && axisStyle.tickLabel.visible) {
    withClip(
      ctx,
      tickLabelClipRect(props),
      () => {
        ticks.forEach((tick) => renderTickLabel(ctx, tick, showTicks, props, layerGirth ?? 0));
      },
      !multilayerTimeAxis,
    );
  }
  renderAxisLine(ctx, props);
}
