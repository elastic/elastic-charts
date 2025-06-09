/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderPointGroup } from './points';
import type { LegendItem } from '../../../../common/legend';
import type { SeriesKey } from '../../../../common/series_id';
import { withContext } from '../../../../renderers/canvas';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import {
  getGeometryHighlightState,
  getGeometryHighlightStateStyle,
  type BubbleGeometry,
  type PerPanel,
} from '../../../../utils/geometry';
import type { SharedGeometryStateStyle, GeometryStateStyle } from '../../../../utils/themes/theme';

/** @internal */
export function renderBubbles(
  ctx: CanvasRenderingContext2D,
  bubbles: Array<PerPanel<BubbleGeometry>>,
  sharedStyle: SharedGeometryStateStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
) {
  withContext(ctx, () => {
    const styles: Record<SeriesKey, GeometryStateStyle> = {};
    const allPoints = bubbles.flatMap(({ value: { seriesIdentifier, points } }) => {
      const highlightState = getGeometryHighlightState(seriesIdentifier.key, highlightedLegendItem);
      styles[seriesIdentifier.key] = getGeometryHighlightStateStyle(sharedStyle, highlightState);
      return points;
    });

    const shouldClip = allPoints[0]?.value.mark !== null; // TODO: add padding over clipping
    renderPointGroup(ctx, allPoints, styles, rotation, renderingArea, shouldClip);
  });
}
