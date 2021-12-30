/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ShapeViewModel } from '../../layout/types/viewmodel_types';

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
    const paintedWidth = fWidth - fPadding;
    const paintedHeight = y1 - y0 - padding;
    const cornerRadius = 2 * cornerRatio * Math.min(paintedWidth, paintedHeight);
    const halfRadius = cornerRadius / 2;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = cornerRadius;
    ctx.beginPath();
    ctx.rect(
      x0 + fPadding + halfRadius,
      y0 + padding / 2 + halfRadius,
      paintedWidth - cornerRadius,
      paintedHeight - cornerRadius,
    );
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}
