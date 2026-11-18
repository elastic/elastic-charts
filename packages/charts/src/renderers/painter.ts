/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../common/colors';
import type { Texture } from '../geoms/types';
import type { TimeFunction } from '../utils/time_functions';

/**
 * The rendering backend a chart stage draws with.
 * @internal
 */
export type RendererType = 'canvas' | 'svg';

/**
 * A gradient paint server. `CanvasGradient` satisfies it structurally.
 * @internal
 */
export interface GradientHandle {
  addColorStop(offset: number, color: string): void;
}

/**
 * A pattern paint server. `CanvasPattern` satisfies it structurally.
 * @internal
 */
export interface PatternHandle {
  setTransform(transform?: DOMMatrix2DInit): void;
}

/** @internal */
export type Paint = string | GradientHandle | PatternHandle;

/**
 * How a change of an element's paint (fill, stroke, opacity) is animated by the SVG backend, as a
 * CSS transition on the element. The canvas backend ignores it: there the frame loop tweens the
 * values it draws with.
 * @internal
 */
export interface PaintTransition {
  /** milliseconds */
  duration: number;
  /** milliseconds */
  delay: number;
  timeFunction: TimeFunction;
}

/**
 * The subset of `TextMetrics` the renderers rely on. The font bounding box fields exist in current
 * browsers and are absent in jsdom.
 * @internal
 */
export interface TextMeasurement {
  readonly width: number;
  readonly actualBoundingBoxAscent?: number;
  readonly actualBoundingBoxDescent?: number;
  readonly fontBoundingBoxAscent?: number;
  readonly fontBoundingBoxDescent?: number;
}

/**
 * The subset of the Canvas2D API that the chart renderers use. A real `CanvasRenderingContext2D`
 * satisfies it structurally (asserted below), and so does every `Painter` backend. Drawing code
 * written against this type runs unchanged on canvas and on SVG.
 *
 * Semantics are Canvas2D's: a post-multiplied transform stack driven by save/restore, a current
 * path built by the path methods, and style properties read at the time of fill/stroke/fillText.
 * @internal
 */
export interface Ctx2d {
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;

  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  rect(x: number, y: number, width: number, height: number): void;
  fill(fillRule?: CanvasFillRule): void;
  stroke(): void;
  clip(fillRule?: CanvasFillRule): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;

  fillText(text: string, x: number, y: number): void;
  strokeText(text: string, x: number, y: number): void;
  measureText(text: string): TextMeasurement;

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): GradientHandle;

  fillStyle: Paint;
  strokeStyle: Paint;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  setLineDash(segments: number[]): void;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  direction: CanvasDirection;
  globalAlpha: number;
}

/**
 * A drawing backend: the Canvas2D subset plus the few operations that differ between backends.
 * Paths are passed as SVG path data strings, never as `Path2D`, so they serialize.
 * @internal
 */
export interface Painter extends Ctx2d {
  /** which backend this is */
  readonly kind: RendererType;
  /**
   * Whether a frame loop repaints this painter: the renderers then tween through requestAnimationFrame
   * frames. Otherwise they draw one frame with every value at its target, as the svg backend does (the DOM
   * transitions the elements) and as an export into a throwaway canvas does.
   */
  readonly animates: boolean;
  /**
   * Clears the whole stage and paints the background, regardless of the current transform.
   * Replaces `clearCanvas`.
   */
  clear(background: Color): void;
  /** fills a path given as SVG path data, in the current coordinate space */
  fillPath(d: string, fillRule?: CanvasFillRule): void;
  /** strokes a path given as SVG path data, in the current coordinate space */
  strokePath(d: string): void;
  /**
   * The backend's paint server for a texture, to assign to `fillStyle`; `null` when the backend cannot
   * paint it (an SVG backend given a `Path2D`). Backends cache patterns per texture.
   */
  createPattern(texture: Texture): PatternHandle | null;
  /** part of the saved state, like the style properties */
  transition: PaintTransition | null;
}

/**
 * A real context is a `Ctx2d`; this is where the compiler checks it.
 * @internal
 */
export const asCtx2d = (ctx: CanvasRenderingContext2D): Ctx2d => ctx;
