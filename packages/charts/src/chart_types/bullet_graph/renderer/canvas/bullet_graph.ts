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
import { Size } from '../../../../utils/dimensions';
import { renderDebugRect } from '../../../xy_chart/renderer/canvas/utils/debug';
import { BulletGraphLayout } from '../../selectors/layout';
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
  VALUE_LINE_HEIGHT,
} from '../../theme';

/** @internal */
export function renderBulletGraph(
  ctx: CanvasRenderingContext2D,
  dpr: Ratio,
  props: {
    debug: boolean;
    spec?: BulletGraphSpec;
    a11y: A11ySettings;
    size: Size;
    layout: BulletGraphLayout;
    style: BulletGraphStyle;
    bandColors: [string, string];
  },
) {
  const { debug, style, layout, spec, bandColors } = props;
  withContext(ctx, (ctx) => {
    ctx.scale(dpr, dpr);
    clearCanvas(ctx, props.style.background);

    // clear only if need to render metric or no spec available
    if (!spec || layout.shouldRenderMetric) {
      return;
    }

    // render each Small multiple
    ctx.fillStyle = props.style.background;
    //@ts-expect-error - unsupported type
    ctx.letterSpacing = 'normal';

    layout.headerLayout.forEach((row, rowIndex) =>
      row.forEach((bulletGraph, columnIndex) => {
        if (!bulletGraph) return;
        const { panel, multiline } = bulletGraph;
        withContext(ctx, (ctx) => {
          const verticalAlignment = layout.layoutAlignment[rowIndex]!;
          const panelY = panel.height * rowIndex;
          const panelX = panel.width * columnIndex;

          // ctx.strokeRect(panelX, panelY, panel.width, panel.height);

          // move into the panel position
          ctx.translate(panelX, panelY);

          // paint right border
          // TODO: check paddings
          ctx.strokeStyle = style.border;
          if (row.length > 1 && columnIndex < row.length - 1) {
            ctx.beginPath();
            ctx.moveTo(panel.width, 0);
            ctx.lineTo(panel.width, panel.height);
            ctx.stroke();
          }

          if (layout.headerLayout.length > 1 && columnIndex < layout.headerLayout.length) {
            ctx.beginPath();
            ctx.moveTo(0, panel.height);
            ctx.lineTo(panel.width, panel.height);
            ctx.stroke();
          }

          // this helps render the header without considering paddings
          ctx.translate(HEADER_PADDING.left, HEADER_PADDING.top);

          // TITLE
          ctx.fillStyle = props.style.textColor;
          ctx.textBaseline = 'top';
          ctx.textAlign = 'start';
          ctx.font = cssFontShorthand(TITLE_FONT, TITLE_FONT_SIZE);
          bulletGraph.title.forEach((titleLine, lineIndex) => {
            const y = lineIndex * TITLE_LINE_HEIGHT;
            ctx.fillText(titleLine, 0, y);
          });

          // SUBTITLE
          if (bulletGraph.subtitle) {
            const y = verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT;
            ctx.font = cssFontShorthand(SUBTITLE_FONT, SUBTITLE_FONT_SIZE);
            ctx.fillText(bulletGraph.subtitle, 0, y);
          }

          // VALUE
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

          // TARGET
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

          const graphSize = {
            width: panel.width,
            height:
              panel.height -
              HEADER_PADDING.top -
              verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT -
              verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT -
              (multiline ? VALUE_LINE_HEIGHT : 0) -
              HEADER_PADDING.bottom,
          };
          const graphOrigin = {
            x: 0,
            y: panel.height - graphSize.height,
          };
          ctx.translate(-HEADER_PADDING.left, -HEADER_PADDING.top);

          if (spec.subtype === 'vertical') {
            ctx.strokeStyle = style.border;
            ctx.beginPath();
            ctx.moveTo(HEADER_PADDING.left, graphOrigin.y);
            ctx.lineTo(panel.width - HEADER_PADDING.right, graphOrigin.y);
            ctx.stroke();
          }

          withContext(ctx, (ctx) => {
            ctx.translate(graphOrigin.x, graphOrigin.y);

            if (debug) {
              renderDebugRect(
                ctx,
                {
                  ...graphSize,
                  x: 0,
                  y: 0,
                },
                0,
                { color: Colors.Transparent.rgba },
              );
            }

            if (spec.subtype === BulletGraphSubtype.horizontal) {
              horizontalBullet(ctx, bulletGraph.datum, graphSize, style, bandColors);
            } else if (spec.subtype === BulletGraphSubtype.vertical) {
              verticalBullet(ctx, bulletGraph.datum, graphSize, style, bandColors);
            } else {
              angularBullet(ctx, bulletGraph.datum, graphSize, style, bandColors, spec, debug);
            }
          });
        });
      }),
    );
  });
}
