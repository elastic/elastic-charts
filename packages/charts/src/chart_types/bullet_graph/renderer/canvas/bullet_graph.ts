/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleLinear } from 'd3-scale';

import { Color } from '../../../../common/colors';
import { Ratio } from '../../../../common/geometry';
import { cssFontShorthand } from '../../../../common/text_utils';
import { withContext, clearCanvas } from '../../../../renderers/canvas';
import { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { measureText } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isFiniteNumber } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { Point } from '../../../../utils/point';
import { wrapText } from '../../../../utils/text/wrap';
import { BulletGraphLayout, layout } from '../../selectors/layout';
import { BulletDatum, BulletGraphSpec, BulletGraphSubtype } from '../../spec';
import {
  BulletGraphStyle,
  GRAPH_PADDING,
  HEADER_PADDING,
  SUBTITLE_FONT,
  SUBTITLE_FONT_SIZE,
  SUBTITLE_LINE_HEIGHT,
  TARGET_FONT,
  TARGET_FONT_SIZE,
  TICK_FONT,
  TICK_FONT_SIZE,
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
    spec: BulletGraphSpec | undefined;
    a11y: A11ySettings;
    size: Size;
    layout: BulletGraphLayout;
    style: BulletGraphStyle;
    bandColors: [string, string];
  },
) {
  const { style, layout, spec, bandColors } = props;
  withContext(ctx, (ctx) => {
    ctx.scale(dpr, dpr);
    clearCanvas(ctx, props.style.background);

    // clear only if need to render metric or no spec available
    if (!spec || layout.shouldRenderMetric) {
      return;
    }

    // render each Small multiple
    ctx.fillStyle = props.style.background;
    //@ts-expect-error
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

            //DEBUG
            //ctx.strokeRect(0, 0, graphSize.width, graphSize.height);

            if (spec.subtype === 'horizontal') {
              horizontalBullet(ctx, bulletGraph.datum, graphOrigin, graphSize, style, bandColors);
            } else {
              verticalBullet(ctx, bulletGraph.datum, graphOrigin, graphSize, style, bandColors);
            }
          });
        });
      }),
    );
  });
}

/////////////////////////////

const TARGET_SIZE = 40;
const BULLET_SIZE = 32;
const BAR_SIZE = 12;

function horizontalBullet(
  ctx: CanvasRenderingContext2D,

  datum: BulletDatum,
  origin: Point,
  graphSize: Size,
  style: BulletGraphStyle,
  bandColors: [string, string],
) {
  ctx.translate(GRAPH_PADDING.left, 0);
  // TODO: add BASE
  // const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
  const paddedWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, paddedWidth]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(bandColors);
  const maxTicks = maxHorizontalTick(graphSize.width);
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = paddedWidth / colorTicks.length;
  const { colors } = colorTicks.reduce<{
    last: number;
    colors: Array<{ color: Color; size: number; position: number }>;
  }>(
    (acc, tick) => {
      return {
        last: acc.last + colorBandSize,
        colors: [
          ...acc.colors,
          {
            color: `${colorScale(tick)}`,
            size: colorBandSize,
            position: acc.last,
          },
        ],
      };
    },
    { last: 0, colors: [] },
  );

  // color bands
  const verticalAlignment = TARGET_SIZE / 2;
  colors.forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(band.position, verticalAlignment - BULLET_SIZE / 2, band.size, BULLET_SIZE);
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  colorTicks
    .filter((tick) => tick > datum.domain.min && tick < datum.domain.max)
    .forEach((tick) => {
      console.log(tick);
      ctx.moveTo(scale(tick), verticalAlignment - BULLET_SIZE / 2);
      ctx.lineTo(scale(tick), verticalAlignment + BULLET_SIZE / 2);
    });
  ctx.stroke();

  // Bar
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(0, verticalAlignment - BAR_SIZE / 2, scale(clamp(datum.value, datum.domain.min, datum.domain.max)), 12);

  // TARGET
  if (isFiniteNumber(datum.target) && (datum.target <= datum.domain.max || datum.target >= datum.domain.min)) {
    ctx.fillRect(scale(datum.target) - 1.5, verticalAlignment - TARGET_SIZE / 2, 3, TARGET_SIZE);
  }
  // Tick labels
  // TODO: add text measurement
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'top';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks.forEach((tick, i) => {
    ctx.textAlign = i === colorTicks.length - 1 ? 'end' : 'start';
    ctx.fillText(datum.tickFormatter(tick), scale(tick), verticalAlignment + TARGET_SIZE / 2);
  });
}

function verticalBullet(
  ctx: CanvasRenderingContext2D,
  datum: BulletDatum,
  origin: Point,
  graphSize: Size,
  style: BulletGraphStyle,
  bandColors: [string, string],
) {
  ctx.translate(0, GRAPH_PADDING.top);
  const graphPaddedHeight = graphSize.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;
  // TODO: add BASE
  // const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, graphPaddedHeight]).clamp(true);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  //#6092C0, #3F4E61

  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(bandColors);
  const maxTicks = 4;
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = graphPaddedHeight / colorTicks.length;
  const { colors } = colorTicks.reduce<{
    last: number;
    colors: Array<{ color: Color; size: number; position: number }>;
  }>(
    (acc, tick) => {
      return {
        last: acc.last + colorBandSize,
        colors: [
          ...acc.colors,
          {
            color: `${colorScale(tick)}`,
            size: colorBandSize,
            position: acc.last,
          },
        ],
      };
    },
    { last: 0, colors: [] },
  );

  // color bands

  colors.forEach((band, index) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(
      graphSize.width / 2 - BULLET_SIZE / 2,
      graphPaddedHeight - band.position - band.size,
      BULLET_SIZE,
      band.size,
    );
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  colorTicks
    .filter((tick) => tick > datum.domain.min && tick < datum.domain.max)
    .forEach((tick) => {
      ctx.moveTo(graphSize.width / 2 - BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
      ctx.lineTo(graphSize.width / 2 + BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
    });
  ctx.stroke();

  // Bar
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    graphSize.width / 2 - BAR_SIZE / 2,
    graphPaddedHeight - scale(datum.value),
    BAR_SIZE,
    scale(datum.value),
  );

  // target
  if (isFiniteNumber(datum.target)) {
    ctx.fillRect(graphSize.width / 2 - TARGET_SIZE / 2, graphPaddedHeight - scale(datum.target) - 1.5, TARGET_SIZE, 3);
  }

  // Tick labels
  // TODO: add text measurement
  ctx.textBaseline = 'top';
  ctx.fillStyle = style.textColor;
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks.forEach((tick, i) => {
    ctx.textAlign = 'end';
    ctx.textBaseline = i === colorTicks.length - 1 ? 'hanging' : 'bottom';
    ctx.fillText(datum.tickFormatter(tick), graphSize.width / 2 - TARGET_SIZE / 2 - 6, graphPaddedHeight - scale(tick));
  });
}

function maxHorizontalTick(panelWidth: number) {
  return panelWidth > 250 ? 4 : 3;
}
function maxVerticalTick(panelHeight: number) {
  return panelHeight > 200 ? 4 : 3;
}
