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
import { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { measureText } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isFiniteNumber } from '../../../../utils/common';
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
  },
) {
  const { style, layout, spec } = props;
  if (!spec) {
    return;
  }
  ctx.save();
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  console.log(props.style.background);
  ctx.fillStyle = props.style.background;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (props.layout.shouldRenderMetric) {
    return;
  }
  ctx.fillStyle = props.style.background;
  //@ts-expect-error
  ctx.letterSpacing = 'normal';

  layout.headerLayout.forEach((row, rowIndex) =>
    row.forEach((cell, columnIndex) => {
      if (!cell) return;

      const verticalAlignment = layout.layoutAlignment[rowIndex]!;
      const panelY = cell.panel.height * rowIndex;
      const panelX = cell.panel.width * columnIndex;

      ctx.save();
      ctx.strokeStyle = style.border;
      if (row.length > 1 && columnIndex < row.length - 1) {
        ctx.beginPath();
        ctx.moveTo(panelX + cell.panel.width, panelY);
        ctx.lineTo(panelX + cell.panel.width, panelY + cell.panel.height);
        ctx.stroke();
      }

      ctx.translate(panelX + HEADER_PADDING[3], panelY + HEADER_PADDING[0]);

      ctx.fillStyle = props.style.textColor;
      // TITLE
      ctx.textBaseline = 'top';
      ctx.textAlign = 'start';
      ctx.font = cssFontShorthand(TITLE_FONT, TITLE_FONT_SIZE);
      cell.title.forEach((line, lineIndex) => {
        ctx.fillText(line, 0, lineIndex * TITLE_LINE_HEIGHT);
      });

      // SUBTITLE
      if (cell.subtitle) {
        const y = verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT;
        ctx.font = cssFontShorthand(SUBTITLE_FONT, SUBTITLE_FONT_SIZE);
        ctx.fillText(cell.subtitle, 0, y);
      }

      // VALUE
      ctx.textBaseline = 'alphabetic';
      ctx.font = cssFontShorthand(VALUE_FONT, VALUE_FONT_SIZE);
      if (!cell.multiline) ctx.textAlign = 'end';

      const valueY =
        verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
        verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
        (cell.multiline ? TARGET_FONT_SIZE : 0);
      const valueX = cell.multiline ? 0 : cell.header.width - cell.targetWidth;
      ctx.fillText(cell.value, valueX, valueY);

      // TARGET
      ctx.font = cssFontShorthand(TARGET_FONT, TARGET_FONT_SIZE);
      if (!cell.multiline) ctx.textAlign = 'end';
      const targetX = cell.multiline ? cell.valueWidth : cell.header.width;
      const targetY =
        verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
        verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
        (cell.multiline ? TARGET_FONT_SIZE : 0);
      ctx.fillText(cell.target, targetX, targetY);

      const graphSize = {
        width: cell.panel.width - (GRAPH_PADDING[1] + GRAPH_PADDING[3]),
        height:
          cell.panel.height -
          (HEADER_PADDING[0] +
            verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
            verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
            (cell.multiline ? VALUE_LINE_HEIGHT : 0) +
            GRAPH_PADDING[0] +
            GRAPH_PADDING[2]),
      };
      const graphOrigin = {
        x: GRAPH_PADDING[3],
        y:
          HEADER_PADDING[0] +
          verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT +
          verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
          (cell.multiline ? VALUE_LINE_HEIGHT : 0) +
          GRAPH_PADDING[0],
      };

      if (spec.subtype === 'vertical') {
        ctx.strokeStyle = style.border;
        ctx.beginPath();
        ctx.moveTo(panelX, graphOrigin.y - HEADER_PADDING[0]);
        ctx.lineTo(panelX + cell.panel.width, graphOrigin.y - HEADER_PADDING[0]);
        ctx.stroke();
      }

      ctx.restore();
      ctx.save();

      ctx.translate(panelX, panelY);
      if (spec.subtype === 'horizontal') {
        horizontalBullet(ctx, cell.datum, graphOrigin, graphSize, style);
      } else {
        verticalBullet(ctx, cell.datum, graphOrigin, graphSize, style);
      }

      ctx.restore();
    }),
  );
  ctx.restore();
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
) {
  ctx.save();
  ctx.translate(origin.x, origin.y);

  // TODO: add BASE
  // const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, graphSize.width]).clamp(true);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(['#D9C6EF', '#AA87D1']);
  const maxTicks = maxHorizontalTick(graphSize.width);
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = graphSize.width / colorTicks.length;
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
  const verticalAlignment = TARGET_SIZE / 2 + 6;
  colors.forEach((band, index) => {
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
  ctx.fillRect(0, verticalAlignment - BAR_SIZE / 2, scale(datum.value), 12);

  // TARGET
  if (isFiniteNumber(datum.target)) {
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

  ctx.restore();
}

function verticalBullet(
  ctx: CanvasRenderingContext2D,
  datum: BulletDatum,
  origin: Point,
  graphSize: Size,
  style: BulletGraphStyle,
) {
  ctx.save();
  ctx.translate(origin.x, origin.y);

  // TODO: add BASE
  // const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, graphSize.height]).clamp(true);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(['#D9C6EF', '#AA87D1']);
  const maxTicks = 5;
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = graphSize.height / colorTicks.length;
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
      graphSize.height - band.position - band.size,
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
      ctx.moveTo(graphSize.width / 2 - BULLET_SIZE / 2, graphSize.height - scale(tick));
      ctx.lineTo(graphSize.width / 2 + BULLET_SIZE / 2, graphSize.height - scale(tick));
    });
  ctx.stroke();

  // Bar
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(graphSize.width / 2 - BAR_SIZE / 2, graphSize.height - scale(datum.value), BAR_SIZE, scale(datum.value));

  // target
  if (isFiniteNumber(datum.target)) {
    ctx.fillRect(graphSize.width / 2 - TARGET_SIZE / 2, graphSize.height - scale(datum.target) - 1.5, TARGET_SIZE, 3);
  }

  // Tick labels
  // TODO: add text measurement
  ctx.textBaseline = 'top';
  ctx.fillStyle = style.textColor;
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks.forEach((tick, i) => {
    ctx.textAlign = 'end';
    ctx.textBaseline = i === colorTicks.length - 1 ? 'hanging' : 'bottom';
    ctx.fillText(datum.tickFormatter(tick), graphSize.width / 2 - TARGET_SIZE / 2, graphSize.height - scale(tick));
  });

  ctx.restore();
  return;
}

function maxHorizontalTick(panelWidth: number) {
  return panelWidth > 250 ? 4 : 3;
}
function maxVerticalTick(panelHeight: number) {
  return panelHeight > 200 ? 4 : 3;
}
