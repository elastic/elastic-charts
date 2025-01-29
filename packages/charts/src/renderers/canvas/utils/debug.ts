/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withContext } from '../';
import { Colors } from '../../../common/colors';
import { Fill, Stroke, Rect } from '../../../geoms/types';
import { renderRect } from '../../../renderers/canvas/primitives/rect';
import { degToRad } from '../../../utils/common';

/** @internal */
export const DEFAULT_DEBUG_FILL: Fill = {
  color: Colors.Violet.rgba,
};

/** @internal */
export const DEFAULT_DEBUG_STROKE: Stroke = {
  color: [0, 0, 0, 0.2],
  width: 1,
};

/** @internal */
export function renderDebugRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  rotation = 0,
  fill = DEFAULT_DEBUG_FILL,
  stroke = DEFAULT_DEBUG_STROKE,
) {
  withContext(ctx, () => {
    ctx.translate(rect.x, rect.y);
    ctx.rotate(degToRad(rotation));
    renderRect(ctx, { ...rect, x: 0, y: 0 }, fill, stroke, true);
  });
}
