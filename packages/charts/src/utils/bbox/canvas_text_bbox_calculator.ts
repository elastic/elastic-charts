/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export interface BBox {
  width: number;
  height: number;
}

/** @internal */
export type TextMeasure = (
  text: string,
  padding: number,
  fontSize?: number,
  fontFamily?: string,
  lineHeight?: number,
  fontWeight?: number,
) => BBox;

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '-99999px';
  canvas.style.left = '-99999px';
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  root.appendChild(canvas);
  const textMeasure: TextMeasure = ctx
    ? (text: string, padding: number, fontSize = 16, fontFamily = 'Arial', lineHeight = 1, fontWeight = 400) => {
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const measure = ctx.measureText(text);
        return { width: measure.width + Math.max(padding, 1), height: fontSize * lineHeight }; // padding should be at least one to avoid browser measureText inconsistencies
      }
    : () => ({ width: 0, height: 0 });
  const result: T = fun(textMeasure);
  root.removeChild(canvas);
  return result;
};
