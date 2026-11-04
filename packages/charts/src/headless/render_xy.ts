/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HeadlessRenderer } from './types';
import type { AnnotationLineProps } from '../chart_types/xy_chart/annotations/line/types';
import type { AnnotationMarker } from '../chart_types/xy_chart/annotations/types';
import type { AnimationContext } from '../chart_types/xy_chart/renderer/canvas/animations';
import type { AnimatedValue } from '../chart_types/xy_chart/renderer/canvas/animations/animation';
import { drawXYChartCanvas2d } from '../chart_types/xy_chart/renderer/canvas/renderers';
import type { ReactiveChartStateProps } from '../chart_types/xy_chart/renderer/canvas/xy_chart';
import { getXYChartRendererProps } from '../chart_types/xy_chart/renderer/canvas/xy_chart';
import { DEFAULT_FONT_FAMILY } from '../common/default_theme_attributes';
import { withContext } from '../renderers/canvas';
import { Position } from '../utils/common';

// Animations are off: every animated value is drawn at its final value.
const finalValue = (_key: string, value: AnimatedValue) => value;
const staticAnimationContext: AnimationContext = { getValue: () => finalValue };

const MARKER_FONT_SIZE = 12;
const MARKER_FONT = `${MARKER_FONT_SIZE}px ${DEFAULT_FONT_FAMILY}`;
const MARKER_GAP = 4;

const isTextNode = (node: unknown): node is string | number => typeof node === 'string' || typeof node === 'number';

const isLineAnnotation = (dimension: object): dimension is AnnotationLineProps => 'markers' in dimension;

// The DOM marker is centered on its anchor along the line and placed outside the plot edge
// (`MARKER_TRANSFORMS` in `line_marker.tsx`); its body follows on the same side.
const TEXT_PLACEMENT: Record<
  Position,
  { align: CanvasTextAlign; baseline: CanvasTextBaseline; dx: number; dy: number }
> = {
  [Position.Right]: { align: 'left', baseline: 'middle', dx: 1, dy: 0 },
  [Position.Left]: { align: 'right', baseline: 'middle', dx: -1, dy: 0 },
  [Position.Top]: { align: 'center', baseline: 'bottom', dx: 0, dy: -1 },
  [Position.Bottom]: { align: 'center', baseline: 'top', dx: 0, dy: 1 },
};

/**
 * Draws the line annotation markers whose icon and body are plain text, which the DOM renders as
 * text nodes; other React markers cannot be drawn without a DOM and are skipped. Text beside a
 * vertical plot edge reads upwards, so it fits the narrow space next to the axis.
 */
const renderTextMarkers = (
  ctx: CanvasRenderingContext2D,
  { annotationDimensions, renderingArea }: ReactiveChartStateProps,
) =>
  annotationDimensions.forEach((dimensions) =>
    dimensions.filter(isLineAnnotation).forEach(({ markers, panel }) =>
      markers.forEach(({ icon, body, color, position, alignment }: AnnotationMarker) => {
        const text = [icon, body].filter(isTextNode).join(' ');
        if (!text) return;
        const { align, baseline, dx, dy } = TEXT_PLACEMENT[alignment];
        const x = renderingArea.left + panel.left + position.left + dx * MARKER_GAP;
        const y = renderingArea.top + panel.top + position.top + dy * MARKER_GAP;
        withContext(ctx, () => {
          ctx.font = MARKER_FONT;
          ctx.fillStyle = color;
          if (dx !== 0) {
            ctx.translate(x + (dx * MARKER_FONT_SIZE) / 2, y);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, 0);
            return;
          }
          ctx.textAlign = align;
          ctx.textBaseline = baseline;
          ctx.fillText(text, x, y);
        });
      }),
    ),
  );

/** @internal */
export const renderXYChart: HeadlessRenderer = (ctx, state) => {
  const props = getXYChartRendererProps(state);
  if (props.isChartEmpty) return;
  const { left, top } = props.chartContainerDimensions;
  ctx.save();
  // In the DOM the canvas sits inside the chart container, which a left or top legend pushes aside.
  ctx.translate(left, top);
  drawXYChartCanvas2d(ctx, props, staticAnimationContext);
  renderTextMarkers(ctx, props);
  ctx.restore();
};
