/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../../common/legend';
import { Rect } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { LineGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';
import { renderPoints } from './points';
import { renderLinePaths } from './primitives/path';
import { buildLineStyles } from './styles/line';
import { withPanelTransform } from './utils/panel_transform';

interface LineGeometriesDataProps {
  animated?: boolean;
  lines: Array<PerPanel<LineGeometry>>;
  renderingArea: Dimensions;
  rotation: Rotation;
  sharedStyle: SharedGeometryStateStyle;
  highlightedLegendItem?: LegendItem;
  clippings: Rect;
}

/** @internal */
export function renderLines(ctx: CanvasRenderingContext2D, props: LineGeometriesDataProps) {
  withContext(ctx, () => {
    const { lines, sharedStyle, highlightedLegendItem, clippings, renderingArea, rotation } = props;

    lines.forEach(({ panel, value: line }) => {
      const { seriesLineStyle, seriesPointStyle, points } = line;

      if (seriesLineStyle.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }

      const visiblePoints = seriesPointStyle.visible ? points : points.filter(({ orphan }) => orphan);
      if (visiblePoints.length === 0) {
        return;
      }
      const geometryStyle = getGeometryStateStyle(line.seriesIdentifier, sharedStyle, highlightedLegendItem);
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () => renderPoints(ctx, visiblePoints, geometryStyle),
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
  const { color, transform, seriesIdentifier, seriesLineStyle, clippedRanges, hideClippedRanges } = line;
  const geometryStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const stroke = buildLineStyles(color, seriesLineStyle, geometryStyle);
  renderLinePaths(ctx, transform, [line.line], stroke, clippedRanges, clippings, hideClippedRanges);
}
