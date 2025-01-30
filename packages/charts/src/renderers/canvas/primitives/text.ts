/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withContext } from '../';
import { Degrees } from '../../../common/geometry';
import { cssFontShorthand, Font, TextAlign, TextBaseline } from '../../../common/text_utils';
import { measureText } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad } from '../../../utils/common';
import { Point } from '../../../utils/point';

/** @internal */
export type TextDirection = 'rtl' | 'ltr'; // TODO: export this

/** @internal */
export type TextFont = Font & {
  fontSize: number;
  align: TextAlign;
  baseline: TextBaseline;
  shadow?: string;
  shadowSize?: number;
};

/** @internal */
export function renderText(
  ctx: CanvasRenderingContext2D,
  origin: Point,
  text: string,
  font: TextFont,
  angle: Degrees = 0,
  translateX: number = 0,
  translateY: number = 0,
  scale: number = 1,
  // optional until all chart types support direction
  direction?: TextDirection,
) {
  withContext(ctx, () => {
    ctx.translate(origin.x, origin.y);
    ctx.rotate(degToRad(angle));
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);
    ctx.fillStyle = font.textColor;
    ctx.textAlign = font.align;
    ctx.textBaseline = font.baseline;
    ctx.font = cssFontShorthand(font, font.fontSize);
    const shadowSize = font.shadowSize ?? 0;
    if (direction) ctx.direction = direction;
    if (font.shadow && shadowSize > 0) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = shadowSize;
      ctx.strokeStyle = font.shadow;
      ctx.strokeText(text, 0, 0);
    }
    ctx.fillText(text, 0, 0);
  });
}

const SPACE = ' ';
const ELLIPSIS = '…';
const DASH = '-';

interface Options {
  wrapAtWord: boolean;
  shouldAddEllipsis: boolean;
}

/** @internal */
export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: Font,
  fontSize: number,
  fixedWidth: number,
  fixedHeight: number,
  { wrapAtWord, shouldAddEllipsis }: Options = { wrapAtWord: true, shouldAddEllipsis: false },
) {
  const lineHeight = 1;
  const lines = text.split('\n');
  let textWidth = 0;
  const lineHeightPx = lineHeight * fontSize;

  const padding = 0;
  const maxWidth = Math.max(fixedWidth - padding * 2, 0);
  const maxHeightPx = Math.max(fixedHeight - padding * 2, 0);
  let currentHeightPx = 0;
  const shouldWrap = true;
  const textArr: string[] = [];
  const textMeasureProcessor = measureText(ctx);
  const getTextWidth = (textString: string) => {
    return textMeasureProcessor(textString, font, fontSize).width;
  };

  const additionalWidth = shouldAddEllipsis ? getTextWidth(ELLIPSIS) : 0;
  for (let i = 0, max = lines.length; i < max; ++i) {
    let line = lines[i];
    if (!line) continue;
    let lineWidth = getTextWidth(line);
    if (lineWidth > maxWidth) {
      while (line.length > 0) {
        let low = 0;
        let high = line.length;
        let match = '';
        let matchWidth = 0;
        while (low < high) {
          const mid = (low + high) >>> 1;
          const substr = line.slice(0, mid + 1);
          const substrWidth = getTextWidth(substr) + additionalWidth;
          if (substrWidth <= maxWidth) {
            low = mid + 1;
            match = substr + (shouldAddEllipsis ? ELLIPSIS : '');
            matchWidth = substrWidth;
          } else {
            high = mid;
          }
        }
        if (match) {
          if (wrapAtWord) {
            const nextChar = line[match.length];
            const nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
            const wrapIndex =
              nextIsSpaceOrDash && matchWidth <= maxWidth
                ? match.length
                : Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
            if (wrapIndex > 0) {
              low = wrapIndex;
              match = match.slice(0, low);
              matchWidth = getTextWidth(match);
            }
          }
          match = match.trimEnd();
          textArr.push(match);
          textWidth = Math.max(textWidth, matchWidth);
          currentHeightPx += lineHeightPx;
          if (!shouldWrap || (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
            break;
          }
          line = line.slice(low);
          line = line.trimStart();
          if (line.length > 0) {
            lineWidth = getTextWidth(line);
            if (lineWidth <= maxWidth) {
              textArr.push(line);
              currentHeightPx += lineHeightPx;
              textWidth = Math.max(textWidth, lineWidth);
              break;
            }
          }
        } else {
          break;
        }
      }
    } else {
      textArr.push(line);
      currentHeightPx += lineHeightPx;
      textWidth = Math.max(textWidth, lineWidth);
    }
    if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
      break;
    }
  }
  return {
    lines: textArr,
    height: fontSize,
    width: textWidth,
  };
}
