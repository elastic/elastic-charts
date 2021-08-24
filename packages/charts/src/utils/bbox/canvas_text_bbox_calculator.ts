/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BBox, BBoxCalculator, DEFAULT_EMPTY_BBOX } from './bbox_calculator';

/** @internal */
export class CanvasTextBBoxCalculator implements BBoxCalculator {
  private attachedRoot: HTMLElement;

  private offscreenCanvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D | null;

  constructor(rootElement?: HTMLElement) {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.style.position = 'absolute';
    this.offscreenCanvas.style.top = '-99999px';
    this.offscreenCanvas.style.left = '-99999px';
    this.context = this.offscreenCanvas.getContext('2d');
    this.attachedRoot = rootElement || document.documentElement;
    this.attachedRoot.appendChild(this.offscreenCanvas);
  }

  compute(text: string, padding: number, fontSize = 16, fontFamily = 'Arial', lineHeight = 1, fontWeight = 400): BBox {
    if (!this.context) {
      return DEFAULT_EMPTY_BBOX;
    }
    // Padding should be at least one to avoid browser measureText inconsistencies
    if (padding < 1) {
      padding = 1;
    }
    this.context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const measure = this.context.measureText(text);

    return {
      width: measure.width + padding,
      height: fontSize * lineHeight,
    };
  }

  destroy(): void {
    this.attachedRoot.removeChild(this.offscreenCanvas);
  }
}

/** @internal */
export const withTextMeasure = <T>(fun: (obj: CanvasTextBBoxCalculator) => T) => {
  const canvasTextBBoxCalculator = new CanvasTextBBoxCalculator();
  const result: T = fun(canvasTextBBoxCalculator);
  canvasTextBBoxCalculator.destroy();
  return result;
};
