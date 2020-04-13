/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { getGeometryStateStyle } from '../../rendering/rendering';
import { BubbleGeometry } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { LegendItem } from '../../legend/legend';
import { withContext, withClip } from '../../../../renderers/canvas';
import { renderPoints } from './points';
import { Rect } from '../../../../geoms/types';

interface BubbleGeometriesDataProps {
  animated?: boolean;
  bubbles: BubbleGeometry[];
  sharedStyle: SharedGeometryStateStyle;
  highlightedLegendItem: LegendItem | null;
  clippings: Rect;
}

/** @internal */
export function renderBubbles(ctx: CanvasRenderingContext2D, props: BubbleGeometriesDataProps) {
  withContext(ctx, (ctx) => {
    const { bubbles, sharedStyle, highlightedLegendItem, clippings } = props;

    bubbles.forEach(({ seriesIdentifier, seriesPointStyle, points }) => {
      withClip(
        ctx,
        clippings,
        (ctx) => {
          const geometryStyle = getGeometryStateStyle(seriesIdentifier, highlightedLegendItem, sharedStyle);
          renderPoints(ctx, points, seriesPointStyle, geometryStyle);
        },
        // TODO: add padding over clipping
        points[0]?.value.mark !== null,
      );
    });
  });
}
