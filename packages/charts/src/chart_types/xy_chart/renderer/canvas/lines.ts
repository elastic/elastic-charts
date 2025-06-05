/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPanelClipping } from './panel_clipping';
import { renderPoints } from './points';
import { renderLinePaths } from './primitives/path';
import { buildLineStyles } from './styles/line';
import { withPanelTransform } from './utils/panel_transform';
import type { Radian } from '../../../../common/geometry';
import type { LegendItem } from '../../../../common/legend';
import type { Rect } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import type { LineGeometry, PerPanel } from '../../../../utils/geometry';
import { getGeometryHighlightState, getGeometryHighlightStateStyle } from '../../../../utils/geometry';
import type { Point } from '../../../../utils/point';
import type { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';

/** @internal */
export function renderLines(
  ctx: CanvasRenderingContext2D,
  lines: Array<PerPanel<LineGeometry>>,
  sharedStyle: SharedGeometryStateStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
) {
  withContext(ctx, () => {
    lines
      .map(({ panel, value }) => {
        return {
          panel,
          line: value,
          highlightState: getGeometryHighlightState(value.seriesIdentifier.key, highlightedLegendItem),
        };
      })
      // sort by dimmed first once are rendered ontop of the non-highlighted ones
      .sort(({ highlightState }) => (highlightState === 'dimmed' ? -1 : 1))
      .forEach(({ panel, line, highlightState }) => {
        const clippings = getPanelClipping(panel, rotation);
        const geometryStyle = getGeometryHighlightStateStyle(sharedStyle, highlightState);
        if (line.style.line.visible) {
          withPanelTransform(
            ctx,
            panel,
            rotation,
            renderingArea,
            () => renderLine(ctx, line, geometryStyle, clippings),
            { area: clippings, shouldClip: true },
          );
        }

        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () =>
            renderPoints(
              ctx,
              line.points,
              geometryStyle,
              line.style.point,
              line.style.line.strokeWidth,
              line.minPointDistance,
              line.style.pointVisibilityMinDistance,
              // has a connecting line only if is fit and there are more than one point on the chart
              line.hasFit && line.points.length > 1,
            ),
          // TODO: add padding over clipping
          { area: clippings, shouldClip: line.points[0]?.value.mark !== null },
        );
      });
  });
}

function renderLine(
  ctx: CanvasRenderingContext2D,
  line: LineGeometry,
  geometryStyle: GeometryStateStyle,
  clippings: Rect,
) {
  const { color, transform, style, clippedRanges, shouldClip } = line;

  const lineStroke = buildLineStyles(color, style.line, geometryStyle);
  const fitLineStroke = buildLineStyles(
    color,
    { ...style.fit.line, strokeWidth: style.line.strokeWidth },
    geometryStyle,
  );

  renderLinePaths(
    ctx,
    transform,
    [line.line],
    lineStroke,
    fitLineStroke,
    clippedRanges,
    clippings,
    shouldClip && style.fit.line.visible,
  );
}

/**
 * Draws line along a polar axis
 * @internal
 */
export function drawPolarLine(
  ctx: CanvasRenderingContext2D,
  angle: Radian,
  radius: number,
  length: number,
  center: Point = { x: 0, y: 0 },
) {
  const y1 = Math.sin(angle) * (radius - length / 2);
  const x1 = Math.cos(angle) * (radius - length / 2);
  const y2 = Math.sin(angle) * (radius + length / 2);
  const x2 = Math.cos(angle) * (radius + length / 2);

  ctx.moveTo(center.x + x1, center.y + y1);
  ctx.lineTo(center.x + x2, center.y + y2);
}
