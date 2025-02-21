/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Rect } from '../../../../../geoms/types';
import type { CanvasRenderer } from '../../../../../renderers/canvas';
import { withContext } from '../../../../../renderers/canvas';
import type { Rotation } from '../../../../../utils/common';
import { degToRad } from '../../../../../utils/common';
import type { Dimensions } from '../../../../../utils/dimensions';
import { computeChartTransform } from '../../../state/utils/utils';

/** @internal */
export function withPanelTransform(
  ctx: CanvasRenderingContext2D,
  panel: Dimensions,
  rotation: Rotation,
  renderingArea: Dimensions,
  fn: CanvasRenderer,
  clippings?: {
    area: Rect;
    shouldClip?: boolean;
  },
) {
  const transform = computeChartTransform(panel, rotation);
  withContext(ctx, () => {
    ctx.translate(renderingArea.left + panel.left + transform.x, renderingArea.top + panel.top + transform.y);
    ctx.rotate(degToRad(rotation));

    if (clippings?.shouldClip) {
      const { x, y, width, height } = clippings.area;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
    }
    fn(ctx);
  });
}
