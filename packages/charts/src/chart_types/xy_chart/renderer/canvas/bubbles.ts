/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderPointGroup } from './points';
import { LegendItem } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { withContext } from '../../../../renderers/canvas';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { BubbleGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle, GeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';

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
      styles[seriesIdentifier.key] = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
      return points;
    });

    const shouldClip = allPoints[0]?.value.mark !== null; // TODO: add padding over clipping
    renderPointGroup(ctx, allPoints, styles, rotation, renderingArea, shouldClip);
  });
}
