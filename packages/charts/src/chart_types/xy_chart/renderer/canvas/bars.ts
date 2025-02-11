/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPanelClipping } from './panel_clipping';
import { buildBarStyle } from './styles/bar';
import { withPanelTransform } from './utils/panel_transform';
import { LegendItem } from '../../../../common/legend';
import { renderRect } from '../../../../renderers/canvas/primitives/rect';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { BarGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';

/** @internal */
export function renderBars(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  geoms: Array<PerPanel<BarGeometry[]>>,
  sharedStyle: SharedGeometryStateStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
) {
  geoms.forEach(({ panel, value: bars }: PerPanel<BarGeometry[]>) =>
    withPanelTransform(
      ctx,
      panel,
      rotation,
      renderingArea,
      () =>
        bars.forEach((barGeometry) => {
          const { x, y, width, height, color, seriesStyle: style, seriesIdentifier } = barGeometry;
          const rect = { x, y, width, height };
          const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
          const barStyle = buildBarStyle(ctx, imgCanvas, color, style.rect, style.rectBorder, geometryStateStyle, rect);
          renderRect(ctx, rect, barStyle.fill, barStyle.stroke);
        }),
      { area: getPanelClipping(panel, rotation), shouldClip: true },
    ),
  );
}
