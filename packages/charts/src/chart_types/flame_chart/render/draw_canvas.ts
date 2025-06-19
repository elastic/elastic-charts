/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BOX_GAP_HORIZONTAL, BOX_GAP_VERTICAL, roundUpSize } from './common';
import { DEFAULT_FONT_FAMILY } from '../../../common/default_theme_attributes';
import { cssFontShorthand } from '../../../common/text_utils';
import type { LabelAccessor } from '../../../utils/common';
import type { ColumnarViewModel } from '../flame_api';

const scale = (value: number, from: number, to: number) => (value - from) / (to - from);
const formatter: LabelAccessor<string> = (label: string) => label; // todo loop in API value

const TEXT_PAD_LEFT = 4;
const TEXT_PAD_RIGHT = 4;
const MIN_TEXT_LENGTH = 0; // in font height, so 1 means roughly 2 characters (latin characters are tall on average)
const ROW_OFFSET_Y = 0.45; // approx. middle line (text is middle anchored so tall bars with small fonts can still have vertically centered text)

const mix = (a: number = 1, b: number = 1, x: number = 1) => (1 - x) * a + x * b; // like the GLSL `mix`

/** @internal */
export const drawCanvas2d = (
  ctx: CanvasRenderingContext2D,
  logicalTime: number,
  cssWidth: number,
  cssHeight: number,
  cssOffsetX: number,
  cssOffsetY: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  rowHeight: number,
  [focusLoX, focusHiX, focusLoY, focusHiY]: [number, number, number, number],
  color: Float32Array,
) => {
  const zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
  const rowHeightPx = zoomedRowHeight * cssHeight;
  const fontSize = zoomedRowHeight * cssHeight - 2 * BOX_GAP_VERTICAL;
  const minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize; // don't render shorter text than this
  const minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
  const minRectWidth = minRectWidthForTextInCssPix / cssWidth;
  const textColor = 'black'; // todo it could come from config / theme or automatic decision like in other charts

  // text rendering
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.scale(dpr, dpr);
  ctx.font = cssFontShorthand(
    { fontFamily: DEFAULT_FONT_FAMILY, fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal' },
    fontSize,
  );
  ctx.clearRect(0, 0, roundUpSize(cssWidth + cssOffsetX), roundUpSize(cssHeight + cssOffsetY));
  ctx.translate(cssOffsetX, cssOffsetY);
  ctx.beginPath();
  ctx.rect(0, 0, roundUpSize(cssWidth), cssHeight);
  ctx.clip();
  let lastTextColor = '';
  let lastTextAlpha = 1;

  columnarGeomData.label.forEach((dataName, i) => {
    const label = formatter(dataName);
    const size = mix(columnarGeomData.size0[i], columnarGeomData.size1[i], logicalTime);
    // todo also trivially skip text outside the current view (eg. more than 1 row above currently selected node; or left/right of the currently selected node
    // otherwise it becomes too choppy as the horizontal magnification makes rectangles wider for text even outside the chart
    const scaledSize = size / (focusHiX - focusLoX);
    if (label && scaledSize >= minRectWidth) {
      const xNorm = mix(columnarGeomData.position0[2 * i], columnarGeomData.position1[2 * i], logicalTime);
      const yNorm = mix(columnarGeomData.position0[2 * i + 1], columnarGeomData.position1[2 * i + 1], logicalTime);
      if (xNorm + size < focusLoX || xNorm > focusHiX || yNorm + rowHeight < focusLoY || yNorm > focusHiY) return; // don't render what's outside
      const baseX = scale(xNorm, focusLoX, focusHiX) * cssWidth;
      const leftOutside = Math.max(0, -baseX);
      const x = baseX + leftOutside; // don't start the text in the negative range, b/c it's not readable there
      const y = cssHeight * (1 - scale(yNorm, focusLoY, focusHiY));
      const baseWidth = scaledSize * cssWidth - BOX_GAP_HORIZONTAL - TEXT_PAD_RIGHT;
      const width = baseWidth - leftOutside; // if a box is partially cut on the left, the remaining box becomes smaller
      ctx.beginPath();
      const renderedWidth = Math.min(width, cssWidth - x); // to not let text protrude on the right when zooming
      ctx.rect(x, y - zoomedRowHeight * cssHeight, renderedWidth, rowHeightPx);
      if (textColor !== lastTextColor) {
        // as we're sorting the iteration, the number of color changes (API calls) is minimized
        ctx.fillStyle = textColor;
        lastTextColor = textColor;
      }
      const textAlpha = color[i * 4 + 3] ?? 1;
      if (textAlpha !== lastTextAlpha) {
        // as we're sorting the iteration, the number of color changes (API calls) is minimized
        ctx.globalAlpha = textAlpha;
        lastTextAlpha = textAlpha;
      }
      ctx.save();
      ctx.clip();
      ctx.fillText(label, x + TEXT_PAD_LEFT, y - ROW_OFFSET_Y * zoomedRowHeight * cssHeight);
      ctx.restore();
    }
  });
  ctx.restore();
};

/** @internal */
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  left: number,
  bottom: number,
  dpr: number,
  [focusLoX, focusHiX, focusLoY, focusHiY]: [number, number, number, number],
  fillColor: string,
  borderColor: string,
  borderLineWidth: number,
) => {
  // text rendering
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.beginPath();
  const boxHeight = cssHeight * Math.abs(focusHiY - focusLoY);
  const x = left + cssWidth * focusLoX + borderLineWidth / 2;
  const y = bottom - boxHeight - focusLoY * cssHeight + borderLineWidth / 2;
  const width = Math.max(borderLineWidth, cssWidth * (focusHiX - focusLoX) - borderLineWidth);
  const height = Math.max(borderLineWidth, boxHeight - borderLineWidth);
  if (fillColor === 'transparent') {
    ctx.clearRect(x, y, width, height);
  } else {
    ctx.rect(x, y, width, height);
  }
  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (borderColor && borderLineWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderLineWidth;
    ctx.stroke();
  }
  ctx.restore();
};
