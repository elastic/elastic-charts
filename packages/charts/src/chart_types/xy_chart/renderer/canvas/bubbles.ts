/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { Rect } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { BubbleGeometry, PerPanel, PointGeometry } from '../../../../utils/geometry';
import { SharedGeometryStateStyle, GeometryStateStyle, PointStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';
import { renderPointGroup } from './points';

interface BubbleGeometriesDataProps {
  animated?: boolean;
  bubbles: Array<PerPanel<BubbleGeometry>>;
  sharedStyle: SharedGeometryStateStyle;
  highlightedLegendItem?: LegendItem;
  clippings: Rect;
  rotation: Rotation;
  renderingArea: Dimensions;
}

/** @internal */
export function renderBubbles(ctx: CanvasRenderingContext2D, props: BubbleGeometriesDataProps) {
  withContext(ctx, (ctx) => {
    const { bubbles, sharedStyle, highlightedLegendItem, clippings, rotation, renderingArea } = props;
    const geometryStyles: Record<SeriesKey, GeometryStateStyle> = {};
    const pointStyles: Record<SeriesKey, PointStyle> = {};

    const allPoints = bubbles.reduce<PointGeometry[]>(
      (acc, { value: { seriesIdentifier, seriesPointStyle, points } }) => {
        geometryStyles[seriesIdentifier.key] = getGeometryStateStyle(
          seriesIdentifier,
          sharedStyle,
          highlightedLegendItem,
        );
        pointStyles[seriesIdentifier.key] = seriesPointStyle;

        acc.push(...points);
        return acc;
      },
      [],
    );
    if (allPoints.length === 0) {
      return;
    }

    renderPointGroup(
      ctx,
      allPoints,
      pointStyles,
      geometryStyles,
      rotation,
      renderingArea,
      clippings,
      // TODO: add padding over clipping
      allPoints[0]?.value.mark !== null,
    );
  });
}
