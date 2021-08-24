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
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.style.position = 'absolute';
  offscreenCanvas.style.top = '-99999px';
  offscreenCanvas.style.left = '-99999px';
  const context = offscreenCanvas.getContext('2d');
  const attachedRoot = document.documentElement;
  attachedRoot.appendChild(offscreenCanvas);
  const textMeasure: TextMeasure = (
    text: string,
    padding: number,
    fontSize = 16,
    fontFamily = 'Arial',
    lineHeight = 1,
    fontWeight = 400,
  ) => {
    if (!context) {
      return { width: 0, height: 0 };
    }
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const measure = context.measureText(text);
    // Padding should be at least one to avoid browser measureText inconsistencies
    return { width: measure.width + Math.max(padding, 1), height: fontSize * lineHeight };
  };
  const result: T = fun(textMeasure);
  attachedRoot.removeChild(offscreenCanvas);
  return result;
};
