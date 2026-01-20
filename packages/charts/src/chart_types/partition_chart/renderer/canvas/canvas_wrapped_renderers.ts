/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LegendPath } from '../../../../common/legend';
import type { ShapeViewModel } from '../../layout/types/viewmodel_types';

const MAX_PADDING_RATIO = 0.25;

/** @internal */
export function renderWrappedPartitionCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  {
    style: { sectorLineWidth: padding },
    quadViewModel,
    diskCenter,
    width: panelWidth,
    height: panelHeight,
    chartDimensions: { width: containerWidth, height: containerHeight },
  }: ShapeViewModel,
  _focus: unknown,
  _animationState: unknown,
  _highlightedLegendPath: LegendPath,
) {
  const width = containerWidth * panelWidth;
  const height = containerHeight * panelHeight;
  const cornerRatio = 0.2;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.scale(dpr, dpr);
  ctx.translate(diskCenter.x, diskCenter.y);
  ctx.clearRect(0, 0, width, height);

  quadViewModel.forEach(({ fillColor, x0, x1, y0px: y0, y1px: y1 }) => {
    if (y1 - y0 <= padding) return;

    const fWidth = x1 - x0;
    const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
    const w = fWidth - fPadding;
    const h = y1 - y0 - padding;
    const x = x0 + fPadding;
    const y = y0 + padding / 2;
    const r = cornerRatio * Math.min(w, h);

    ctx.fillStyle = fillColor;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}
