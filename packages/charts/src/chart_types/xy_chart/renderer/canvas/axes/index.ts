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
import { tickLabelsClippingBox } from '../../../axes/ticks/clip';
import { shouldShowTicks } from '../../../utils/axis_utils';

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
      tickLabelsClippingBox({ spec: axisSpec, style: axisStyle, size: props.size, maxLabelBox: props.dimension }),
      () => {
        ticks.forEach((tick) => renderTickLabel(ctx, tick, showTicks, props, layerGirth ?? 0));
      },
      !multilayerTimeAxis,
    );
  }
  renderAxisLine(ctx, props);
}
