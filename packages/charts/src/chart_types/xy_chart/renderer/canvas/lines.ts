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
import { colorToRgba, overrideOpacity } from '../../../../common/color_library_wrappers';
import { Radian } from '../../../../common/geometry';
import { LegendItem } from '../../../../common/legend';
import { Rect, Stroke } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import { ColorVariant, Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { LineGeometry, PerPanel } from '../../../../utils/geometry';
import { Point } from '../../../../utils/point';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';

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
    lines.forEach(({ panel, value: line }) => {
      const clippings = getPanelClipping(panel, rotation);
      if (line.style.line.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }
      const geometryStyle = getGeometryStateStyle(line.seriesIdentifier, sharedStyle, highlightedLegendItem);
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
            line.hasFit,
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
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const { color, transform, seriesIdentifier, style, clippedRanges, shouldClip } = line;
  const geometryStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);

  const lineStroke = buildLineStyles(color, style.line, geometryStyle);
  const fitLineStrokeColor = style.fit.line.stroke === ColorVariant.Series ? color : style.fit.line.stroke;
  const fitLineStroke: Stroke = {
    dash: style.fit.line.dash,
    width: style.line.strokeWidth,
    color: overrideOpacity(
      colorToRgba(fitLineStrokeColor),
      (opacity) => opacity * geometryStyle.opacity * style.fit.line.opacity,
    ),
  };

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
