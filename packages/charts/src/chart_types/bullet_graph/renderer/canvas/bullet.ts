/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { angularBullet, horizontalBullet, verticalBullet } from './sub_types';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import type { Ratio } from '../../../../common/geometry';
import { cssFontShorthand } from '../../../../common/text_utils';
import { withContext, clearCanvas } from '../../../../renderers/canvas';
import { renderDebugRect, renderDebugPoint } from '../../../../renderers/canvas/utils/debug';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import type { ActiveValue } from '../../selectors/get_active_values';
import type { BulletDimensions } from '../../selectors/get_panel_dimensions';
import type { BulletSpec } from '../../spec';
import { BulletSubtype } from '../../spec';
import type { BulletStyle } from '../../theme';
import {
  FONT_PADDING,
  HEADER_PADDING,
  SUBTITLE_FONT,
  SUBTITLE_FONT_SIZE,
  TARGET_FONT,
  TARGET_FONT_SIZE,
  TITLE_FONT,
  TITLE_FONT_SIZE,
  TITLE_LINE_SPACING,
  VALUE_FONT,
  VALUE_FONT_SIZE,
  getMaxTargetValueAssent,
  getTextAscentHeight,
} from '../../theme';

/** @internal */
export function renderBullet(
  ctx: CanvasRenderingContext2D,
  dpr: Ratio,
  props: {
    debug: boolean;
    spec?: BulletSpec;
    a11y: A11ySettings;
    dimensions: BulletDimensions;
    activeValues: (ActiveValue | null)[][];
    style: BulletStyle;
    backgroundColor: Color;
  },
) {
  const { debug, style, dimensions, activeValues, spec, backgroundColor } = props;
  withContext(ctx, (ctx) => {
    ctx.scale(dpr, dpr);
    clearCanvas(ctx, backgroundColor);

    // clear only if need to render metric or no spec available
    if (!spec || dimensions.shouldRenderMetric) {
      return;
    }

    // render each Small multiple
    ctx.fillStyle = backgroundColor;

    // layout.headerLayout.forEach((row, rowIndex) =>
    dimensions.rows.forEach((row, rowIndex) =>
      row.forEach((bulletGraph, columnIndex) => {
        if (!bulletGraph) return;
        const { panel, multiline } = bulletGraph;
        withContext(ctx, (ctx) => {
          const verticalAlignment = dimensions.layoutAlignment[rowIndex]!;
          const activeValue = activeValues?.[rowIndex]?.[columnIndex];

          if (debug) {
            renderDebugRect(ctx, panel);
          }

          // move to panel origin
          ctx.translate(panel.x, panel.y);

          // paint right border
          ctx.strokeStyle = style.border;
          // TODO: check paddings
          if (row.length > 1 && columnIndex < row.length - 1) {
            ctx.beginPath();
            ctx.moveTo(panel.width, 0);
            ctx.lineTo(panel.width, panel.height);
            ctx.stroke();
          }

          if (dimensions.rows.length > 1 && columnIndex < dimensions.rows.length) {
            ctx.beginPath();
            ctx.moveTo(0, panel.height);
            ctx.lineTo(panel.width, panel.height);
            ctx.stroke();
          }

          // this helps render the header without considering paddings
          ctx.translate(HEADER_PADDING.left, HEADER_PADDING.top);

          ctx.textBaseline = 'alphabetic';

          const MAX_TARGET_VALUE_ASCENT = getMaxTargetValueAssent(bulletGraph.target);
          const commonYBaseline = // to share baseline with value and target
            Math.max(
              getTextAscentHeight(TITLE_FONT_SIZE, verticalAlignment.maxTitleRows, TITLE_LINE_SPACING) +
                (verticalAlignment.maxSubtitleRows > 0 ? FONT_PADDING : 0) +
                getTextAscentHeight(SUBTITLE_FONT_SIZE, verticalAlignment.maxSubtitleRows),
              verticalAlignment.multiline ? 0 : MAX_TARGET_VALUE_ASCENT,
            );

          // Title
          ctx.fillStyle = props.style.textColor;
          ctx.textAlign = 'start';
          ctx.font = cssFontShorthand(TITLE_FONT, TITLE_FONT_SIZE);

          const titleYBaseline =
            commonYBaseline -
            getTextAscentHeight(SUBTITLE_FONT_SIZE, verticalAlignment.maxSubtitleRows) -
            (verticalAlignment.maxSubtitleRows > 0 ? FONT_PADDING : 0);

          bulletGraph.title
            .slice()
            .reverse()
            .forEach((titleLine, lineIndex) => {
              const y = titleYBaseline - lineIndex * (getTextAscentHeight(TITLE_FONT_SIZE) + TITLE_LINE_SPACING);
              ctx.fillText(titleLine, 0, y);
            });

          // Subtitle
          if (bulletGraph.subtitle) {
            ctx.font = cssFontShorthand(SUBTITLE_FONT, SUBTITLE_FONT_SIZE);
            ctx.fillText(bulletGraph.subtitle, 0, commonYBaseline);
          }

          // Value
          ctx.font = cssFontShorthand(VALUE_FONT, VALUE_FONT_SIZE);
          if (!multiline) ctx.textAlign = 'end';
          {
            const y = commonYBaseline + (multiline ? MAX_TARGET_VALUE_ASCENT + FONT_PADDING : 0);
            const x = multiline ? 0 : bulletGraph.header.width - bulletGraph.targetWidth;

            ctx.fillText(bulletGraph.value, x, y);
          }

          // Target
          if (bulletGraph.target) {
            ctx.font = cssFontShorthand(TARGET_FONT, TARGET_FONT_SIZE);
            if (!multiline) ctx.textAlign = 'end';
            const x = multiline ? bulletGraph.valueWidth : bulletGraph.header.width;
            const y = commonYBaseline + (multiline ? MAX_TARGET_VALUE_ASCENT + FONT_PADDING : 0);
            ctx.fillText(bulletGraph.target, x, y);
          }

          ctx.translate(-HEADER_PADDING.left, -HEADER_PADDING.top);

          const { graphArea } = bulletGraph;

          if (spec.subtype !== BulletSubtype.horizontal) {
            ctx.strokeStyle = style.border;
            ctx.beginPath();
            ctx.moveTo(HEADER_PADDING.left, graphArea.origin.y);
            ctx.lineTo(panel.width - HEADER_PADDING.right, graphArea.origin.y);
            ctx.stroke();
          }

          withContext(ctx, (ctx) => {
            ctx.translate(graphArea.origin.x, graphArea.origin.y);

            if (spec.subtype === BulletSubtype.horizontal) {
              horizontalBullet(ctx, bulletGraph, style, backgroundColor, activeValue);
            } else if (spec.subtype === BulletSubtype.vertical) {
              verticalBullet(ctx, bulletGraph, style, backgroundColor, activeValue);
            } else {
              angularBullet(ctx, bulletGraph, style, backgroundColor, spec, debug, activeValue);
            }
          });

          if (debug) {
            withContext(ctx, (ctx) => {
              ctx.translate(graphArea.origin.x, graphArea.origin.y);
              renderDebugRect(
                ctx,
                {
                  ...graphArea.size,
                  x: 0,
                  y: 0,
                },
                0,
                { color: Colors.Transparent.rgba },
              );
              renderDebugPoint(ctx, 0, 0);
              renderDebugPoint(ctx, graphArea.size.width / 2, graphArea.size.height / 2);
            });
          }
        });
      }),
    );
  });
}
