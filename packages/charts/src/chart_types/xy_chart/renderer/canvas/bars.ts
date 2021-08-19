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
import { BarGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';
import { renderRect } from './primitives/rect';
import { buildBarStyles } from './styles/bar';
import { withPanelTransform } from './utils/panel_transform';

/** @internal */
export function renderBars(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  barGeometries: Array<PerPanel<BarGeometry[]>>,
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
  rotation?: Rotation,
) {
  withContext(ctx, () =>
    barGeometries.forEach(
      renderPerPanelBars(ctx, imgCanvas, clippings, sharedStyle, renderingArea, highlightedLegendItem, rotation),
    ),
  );
}

function renderPerPanelBars(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  clippings: Rect,
  sharedStyle: SharedGeometryStateStyle,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
  rotation: Rotation = 0,
) {
  return ({ panel, value: bars }: PerPanel<BarGeometry[]>) =>
    withPanelTransform(
      ctx,
      panel,
      rotation,
      renderingArea,
      () => {
        bars.forEach((barGeometry) => {
          const { x, y, width, height, color, seriesStyle, seriesIdentifier } = barGeometry;
          const rect = { x, y, width, height };
          const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
          const { fill, stroke } = buildBarStyles(
            ctx,
            imgCanvas,
            color,
            seriesStyle.rect,
            seriesStyle.rectBorder,
            geometryStateStyle,
            rect,
          );
          withContext(ctx, () => renderRect(ctx, rect, fill, stroke));
        });
      },
      { area: clippings, shouldClip: true },
    );
}
