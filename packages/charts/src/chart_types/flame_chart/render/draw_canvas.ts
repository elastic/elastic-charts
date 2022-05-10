/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LabelAccessor } from '../../../utils/common';
import { ColumnarViewModel } from '../types';
import { BOX_GAP, roundUpSize } from './common';

const scale = (value: number, from: number, to: number) => (value - from) / (to - from);
const formatter: LabelAccessor<string> = (label: string) => label; // todo loop in API value

const TEXT_PAD_LEFT = 3;
const TEXT_PAD_RIGHT = 3;
const MIN_TEXT_LENGTH = 0.5; // in font height, so 1 means roughly 2 characters (latin characters are tall on average)
const ROW_OFFSET_Y = 0.45; // approx. middle line (text is middle anchored so tall bars with small fonts can still have vertically centered text)
const MAX_FONT_HEIGHT_RATIO = 0.9; // relative to the row height
const MAX_FONT_SIZE = 14;

const mix = (a: number, b: number, x: number) => (1 - x) * a + x * b; // like the GLSL `mix`

/** @internal */
export const drawCanvas = (
  ctx: CanvasRenderingContext2D,
  logicalTime: number,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  rowHeight: number,
  [focusLoX, focusHiX, focusLoY, focusHiY]: [number, number, number, number],
) => {
  const zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
  const rowHeightPx = zoomedRowHeight * cssHeight;
  const fontSize = Math.min((zoomedRowHeight * cssHeight - BOX_GAP) * MAX_FONT_HEIGHT_RATIO, MAX_FONT_SIZE);
  const minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize; // don't render shorter text than this
  const minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
  const minRectWidth = minRectWidthForTextInCssPix / cssWidth;
  const textColor = 'black'; // todo it could come from config / theme or automatic decision like in other charts

  // text rendering
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.scale(dpr, dpr);
  ctx.font = `${fontSize}px "Atkinson Hyperlegible"`;
  ctx.clearRect(0, 0, roundUpSize(cssWidth), roundUpSize(cssHeight));
  let lastTextColor = '';

  /*
  const rowHeightPx = zoomedRowHeight * cssHeight;
  if (rowHeightPx < 10) {
    ctx.restore();
    return;
  }
*/

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
      const baseWidth = scaledSize * cssWidth - BOX_GAP - TEXT_PAD_RIGHT;
      const width = baseWidth - leftOutside; // if a box is partially cut on the left, the remaining box becomes smaller
      ctx.beginPath();
      const renderedWidth = Math.min(width, cssWidth - x); // to not let text protrude on the right when zooming
      ctx.rect(x, y - zoomedRowHeight * cssHeight, renderedWidth, rowHeightPx);
      if (textColor !== lastTextColor) {
        // as we're sorting the iteration, the number of color changes (API calls) is minimized
        ctx.fillStyle = textColor;
        lastTextColor = textColor;
      }
      ctx.save();
      ctx.clip();
      ctx.fillText(label, x + TEXT_PAD_LEFT, y - ROW_OFFSET_Y * zoomedRowHeight * cssHeight);
      ctx.restore();
    }
  });
  ctx.restore();
};
