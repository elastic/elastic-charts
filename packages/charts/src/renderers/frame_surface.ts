/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CanvasPainter } from './canvas/painter';
import type { Painter } from './painter';
import { SvgPainter } from './svg/painter';
import { commitSvgNodes } from './svg/to_dom';
import type { StageElement } from '../state/internal_chart_renderer';

/**
 * A drawing surface for charts that run their own frame loop outside React (timeslip): a canvas or
 * an svg element that is sized per frame and drawn into through a `Painter`. On canvas, drawing is
 * immediate; on svg, `endFrame` commits the recorded frame into the live element.
 * @internal
 */
export interface FrameSurface {
  readonly element: StageElement;
  /** 1 on svg, which is resolution independent */
  readonly devicePixelRatio: number;
  /** width of a text in CSS pixels in the painter's current font, for layout estimates */
  measureText(text: string): number;
  /** sizes the surface for a frame of the given CSS size and returns the painter to draw it with */
  beginFrame(width: number, height: number): Painter;
  /** makes the frame visible */
  endFrame(): void;
}

class CanvasSurface implements FrameSurface {
  readonly devicePixelRatio = window.devicePixelRatio;
  private readonly painter: CanvasPainter;

  constructor(
    readonly element: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {
    this.painter = new CanvasPainter(ctx);
  }

  measureText(text: string) {
    return this.ctx.measureText(text).width;
  }

  beginFrame(width: number, height: number) {
    const dpr = this.devicePixelRatio;
    const bitmapWidth = Math.round(width * dpr);
    const bitmapHeight = Math.round(height * dpr);
    // resizing a canvas clears it and resets its context, so only when needed
    if (this.element.width !== bitmapWidth) this.element.width = bitmapWidth;
    if (this.element.height !== bitmapHeight) this.element.height = bitmapHeight;
    this.painter.begin(dpr);
    return this.painter;
  }

  endFrame() {
    // drawing on canvas is immediate
  }
}

class SvgSurface implements FrameSurface {
  readonly devicePixelRatio = 1;
  private painter: SvgPainter | null = null;
  private readonly measurer: SvgPainter;

  constructor(
    readonly element: SVGSVGElement,
    private readonly idPrefix: string,
  ) {
    this.measurer = new SvgPainter({ width: 0, height: 0, idPrefix });
  }

  measureText(text: string) {
    return this.measurer.measureText(text).width;
  }

  beginFrame(width: number, height: number) {
    const viewBox = `0 0 ${width} ${height}`;
    if (this.element.getAttribute('viewBox') !== viewBox) {
      this.element.setAttribute('width', String(width));
      this.element.setAttribute('height', String(height));
      this.element.setAttribute('viewBox', viewBox);
    }
    this.painter = new SvgPainter({ width, height, idPrefix: this.idPrefix });
    return this.painter;
  }

  endFrame() {
    if (this.painter) commitSvgNodes(this.element, this.painter.nodes());
    this.painter = null;
  }
}

/**
 * The surface for a stage element; `null` when a canvas has no 2d context.
 * @internal
 */
export function createFrameSurface(element: StageElement, idPrefix: string): FrameSurface | null {
  if (element instanceof HTMLCanvasElement) {
    const ctx = element.getContext('2d');
    return ctx ? new CanvasSurface(element, ctx) : null;
  }
  return new SvgSurface(element, idPrefix);
}
