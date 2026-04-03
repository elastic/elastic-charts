/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Font } from '../../common/text_utils';
import { cssFontShorthand } from '../../common/text_utils';
import { withContext } from '../../renderers/canvas';
import type { Size } from '../dimensions';

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

/**
 * Registers a canvas element that lives in the Chart DOM tree.
 * An in-DOM canvas inherits computed CSS properties (e.g. font-feature-settings,
 * font-variant-numeric) from its ancestors, producing accurate text measurements
 * that match the rendered output.
 * @internal
 */
export function registerMeasureCanvas(canvas: HTMLCanvasElement) {
  measureCanvas = canvas;
  measureCtx = canvas.getContext('2d');
}

/** @internal */
export function unregisterMeasureCanvas(canvas: HTMLCanvasElement) {
  if (measureCanvas === canvas) {
    measureCanvas = null;
    measureCtx = null;
  }
}

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => {
  const ctx = measureCtx ?? document.createElement('canvas').getContext('2d');
  const textMeasure = ctx ? measureText(ctx) : () => ({ width: 0, height: 0 });
  return fun(textMeasure);
};

/** @internal */
export type TextMeasure = (text: string, font: Omit<Font, 'textColor'>, fontSize: number, lineHeight?: number) => Size;

/** @internal */
export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  const isMeasureCtx = ctx === measureCtx;
  let lastFont = '';
  return (text, font, fontSize, lineHeight = 1) => {
    if (text.length === 0) {
      return { width: 0, height: fontSize * lineHeight };
    }
    const fontString = cssFontShorthand(font, fontSize);
    // measureCtx doesn't need withContext, so not using it for performance reasons
    if (isMeasureCtx) {
      // Avoid setting the font multiple times if it hasn't changed for performance
      if (fontString !== lastFont) {
        ctx.font = fontString;
        lastFont = fontString;
      }
      const { width } = ctx.measureText(text);
      return { width, height: fontSize * lineHeight };
    }
    return withContext(ctx, (ctx): Size => {
      ctx.font = fontString;
      const { width } = ctx.measureText(text);
      return { width, height: fontSize * lineHeight };
    });
  };
}
