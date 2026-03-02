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

let domCanvas: HTMLCanvasElement | null = null;
let domCtx: CanvasRenderingContext2D | null = null;

/**
 * Registers a canvas element that lives in the Chart DOM tree.
 * An in-DOM canvas inherits computed CSS properties (e.g. font-feature-settings,
 * font-variant-numeric) from its ancestors, producing accurate text measurements
 * that match the rendered output.
 * @internal
 */
export function registerMeasureCanvas(canvas: HTMLCanvasElement) {
  domCanvas = canvas;
  domCtx = canvas.getContext('2d');
}

/** @internal */
export function unregisterMeasureCanvas(canvas: HTMLCanvasElement) {
  if (domCanvas === canvas) {
    domCanvas = null;
    domCtx = null;
  }
}

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => {
  const ctx = domCtx ?? document.createElement('canvas').getContext('2d');
  const textMeasure = ctx ? measureText(ctx) : () => ({ width: 0, height: 0 });
  return fun(textMeasure);
};

/** @internal */
export type TextMeasure = (text: string, font: Omit<Font, 'textColor'>, fontSize: number, lineHeight?: number) => Size;

/** @internal */
export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  return (text, font, fontSize, lineHeight = 1) => {
    if (text.length === 0) {
      return { width: 0, height: fontSize * lineHeight };
    }
    return withContext(ctx, (ctx): Size => {
      ctx.font = cssFontShorthand(font, fontSize);
      const { width } = ctx.measureText(text);
      return { width, height: fontSize * lineHeight };
    });
  };
}
