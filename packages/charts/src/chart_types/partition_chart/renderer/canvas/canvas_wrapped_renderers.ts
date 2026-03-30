/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { multiplyColorOpacity } from '../../../../common/color_library_wrappers';
import type { LegendPath } from '../../../../state/actions/legend';
import { getColorFromVariant } from '../../../../utils/common';
import { getDimmedColor } from '../../../../utils/themes/dimmed_colors';
import type { PartitionStyle } from '../../../../utils/themes/partition';
import type { QuadViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import type { LegendStrategy } from '../../layout/utils/highlighted_geoms';
import { highlightedGeoms } from '../../layout/utils/highlighted_geoms';

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
  highlightedLegendPath: LegendPath,
  legendStrategy: LegendStrategy | undefined,
  flatLegend: boolean | undefined,
  partitionStyle: PartitionStyle,
) {
  const width = containerWidth * panelWidth;
  const height = containerHeight * panelHeight;
  const cornerRatio = 0.2;

  // Calculate which quads are highlighted for legend dimming
  const highlightedQuadSet = new Set<QuadViewModel>();
  if (highlightedLegendPath.length > 0) {
    const highlighted = highlightedGeoms(legendStrategy, flatLegend, quadViewModel, highlightedLegendPath);
    highlighted.forEach((quad) => highlightedQuadSet.add(quad));
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.scale(dpr, dpr);
  ctx.translate(diskCenter.x, diskCenter.y);
  ctx.clearRect(0, 0, width, height);

  quadViewModel.forEach((quad) => {
    const { x0, x1, y0px: y0, y1px: y1 } = quad;
    if (y1 - y0 <= padding) return;

    const fWidth = x1 - x0;
    const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
    const w = fWidth - fPadding;
    const h = y1 - y0 - padding;
    const x = x0 + fPadding;
    const y = y0 + padding / 2;
    const r = cornerRatio * Math.min(w, h);

    const isDimmed = highlightedQuadSet.size > 0 && !highlightedQuadSet.has(quad);
    const baseFillColor = getColorFromVariant(
      quad.fillColor,
      getDimmedColor(isDimmed, partitionStyle.dimmed, 'fill', quad.fillColor),
    );
    // Apply opacity when dimmed with opacity config
    const fillColor =
      isDimmed && 'opacity' in partitionStyle.dimmed
        ? multiplyColorOpacity(baseFillColor, partitionStyle.dimmed.opacity)
        : baseFillColor;

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
