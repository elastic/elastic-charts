/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { angularBullet, horizontalBullet, verticalBullet } from './sub_types';
import { Colors } from '../../../../common/colors';
import { Ratio } from '../../../../common/geometry';
import { cssFontShorthand } from '../../../../common/text_utils';
import { withContext, clearCanvas } from '../../../../renderers/canvas';
import { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { renderDebugRect } from '../../../xy_chart/renderer/canvas/utils/debug';
import { BulletDimensions } from '../../selectors/get_dimensions';
import { BulletGraphSpec, BulletGraphSubtype } from '../../spec';
import {
  BulletGraphStyle,
  HEADER_PADDING,
  SUBTITLE_FONT,
  SUBTITLE_FONT_SIZE,
  SUBTITLE_LINE_HEIGHT,
  TARGET_FONT,
  TARGET_FONT_SIZE,
  TITLE_FONT,
  TITLE_FONT_SIZE,
  TITLE_LINE_HEIGHT,
  VALUE_FONT,
  VALUE_FONT_SIZE,
} from '../../theme';

/** @internal */
export function renderBulletGraph(
  ctx: CanvasRenderingContext2D,
  dpr: Ratio,
  props: {
    debug: boolean;
    spec?: BulletGraphSpec;
    a11y: A11ySettings;
    dimensions: BulletDimensions;
    style: BulletGraphStyle;
  },
) {
  const { debug, style, dimensions, spec } = props;
  withContext(ctx, (ctx) => {
    ctx.scale(dpr, dpr);
    clearCanvas(ctx, props.style.background);

    // clear only if need to render metric or no spec available
    if (!spec || dimensions.shouldRenderMetric) {
      return;
    }

    // render each Small multiple
    ctx.fillStyle = props.style.background;
    //@ts-expect-error - unsupported type
    ctx.letterSpacing = 'normal';

    // layout.headerLayout.forEach((row, rowIndex) =>
    dimensions.rows.forEach((row, rowIndex) =>
      row.forEach((bulletGraph, columnIndex) => {
        if (!bulletGraph) return;
        const { panel, multiline } = bulletGraph;
        withContext(ctx, (ctx) => {
          const verticalAlignment = dimensions.layoutAlignment[rowIndex]!;

          if (debug) {
            renderDebugRect(ctx, panel);
          }

          // move into the panel position
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

          // Title
          ctx.fillStyle = props.style.textColor;
          ctx.textBaseline = 'top';
          ctx.textAlign = 'start';
          ctx.font = cssFontShorthand(TITLE_FONT, TITLE_FONT_SIZE);
          bulletGraph.title.forEach((titleLine, lineIndex) => {
            const y = lineIndex * TITLE_LINE_HEIGHT;
            ctx.fillText(titleLine, 0, y);
          });

          // Subtitle
          if (bulletGraph.subtitle) {
            const y = verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT;
            ctx.font = cssFontShorthand(SUBTITLE_FONT, SUBTITLE_FONT_SIZE);
            ctx.fillText(bulletGraph.subtitle, 0, y);
          }

          // Value
          ctx.textBaseline = 'alphabetic';
          ctx.font = cssFontShorthand(VALUE_FONT, VALUE_FONT_SIZE);
          if (!multiline) ctx.textAlign = 'end';
          {
            const y =
              verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
              verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
              (multiline ? TARGET_FONT_SIZE : 0);
            const x = multiline ? 0 : bulletGraph.header.width - bulletGraph.targetWidth;
            ctx.fillText(bulletGraph.value, x, y);
          }

          // Target
          ctx.font = cssFontShorthand(TARGET_FONT, TARGET_FONT_SIZE);
          if (!multiline) ctx.textAlign = 'end';
          {
            const x = multiline ? bulletGraph.valueWidth : bulletGraph.header.width;
            const y =
              verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
              verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
              (multiline ? TARGET_FONT_SIZE : 0);
            ctx.fillText(bulletGraph.target, x, y);
          }

          ctx.translate(-HEADER_PADDING.left, -HEADER_PADDING.top);

          const { graphArea } = bulletGraph;

          if (spec.subtype === 'vertical') {
            ctx.strokeStyle = style.border;
            ctx.beginPath();
            ctx.moveTo(HEADER_PADDING.left, graphArea.origin.y);
            ctx.lineTo(panel.width - HEADER_PADDING.right, graphArea.origin.y);
            ctx.stroke();
          }

          withContext(ctx, (ctx) => {
            ctx.translate(graphArea.origin.x, graphArea.origin.y);

            if (debug) {
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
            }

            if (spec.subtype === BulletGraphSubtype.horizontal) {
              horizontalBullet(ctx, bulletGraph, style);
            } else if (spec.subtype === BulletGraphSubtype.vertical) {
              verticalBullet(ctx, bulletGraph, style);
            } else {
              angularBullet(ctx, bulletGraph, style, spec, debug);
            }
          });
        });
      }),
    );
  });
}
