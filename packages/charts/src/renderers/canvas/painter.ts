/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../common/colors';
import { Colors } from '../../common/colors';
import type { Texture } from '../../geoms/types';
import { degToRad } from '../../utils/common';
import type { GradientHandle, Paint, Painter, PaintTransition, PatternHandle, TextMeasurement } from '../painter';

/**
 * The canvas backend: a thin delegate over a real `CanvasRenderingContext2D`.
 * Native speed is unchanged; the only extras are `begin` (device pixel ratio), `clear` and the
 * string-path helpers.
 * @internal
 */
export class CanvasPainter implements Painter {
  readonly kind = 'canvas' as const;

  readonly animates = true;

  private devicePixelRatio = 1;
  private readonly patterns = new Map<string, CanvasPattern>();
  private tile: HTMLCanvasElement | null = null;

  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  /**
   * Starts a frame: maps CSS pixels onto the device-pixel bitmap once, so the drawing code never
   * sees the device pixel ratio.
   */
  begin(devicePixelRatio: number) {
    if (devicePixelRatio !== this.devicePixelRatio) {
      // pattern tiles are rasterized at the device resolution
      this.patterns.clear();
      this.devicePixelRatio = devicePixelRatio;
    }
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  createPattern(texture: Texture): PatternHandle | null {
    const { width, height, path, shapeRotation, stroke, strokeWidth, fill, dash, opacity } = texture;
    const { rotation, offset } = texture;
    // a Path2D cannot be serialized, so only string shapes are cached
    const key = typeof path === 'string' ? JSON.stringify(texture) : null;
    const cached = key === null ? undefined : this.patterns.get(key);
    if (cached) return cached;

    const dpr = this.devicePixelRatio;
    this.tile ??= document.createElement('canvas');
    const { tile } = this;
    const tileCtx = tile.getContext('2d');
    if (!tileCtx) return null;
    tile.width = dpr * width;
    tile.height = dpr * height;

    tileCtx.globalAlpha = opacity;
    tileCtx.lineWidth = strokeWidth;
    tileCtx.strokeStyle = stroke;
    if (dash) tileCtx.setLineDash(dash);
    if (fill) tileCtx.fillStyle = fill;
    tileCtx.scale(dpr, dpr);
    tileCtx.translate(width / 2, height / 2);
    if (shapeRotation) tileCtx.rotate(degToRad(shapeRotation));
    tileCtx.beginPath();
    const path2d = typeof path === 'string' ? new Path2D(path) : path;
    tileCtx.stroke(path2d);
    if (fill) tileCtx.fill(path2d);

    const pattern = this.ctx.createPattern(tile, 'repeat')!; // a canvas source always yields a pattern
    const matrix = new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]);
    if (offset?.global) matrix.translateSelf(offset.x ?? 0, offset.y ?? 0);
    matrix.rotateSelf(rotation ?? 0);
    if (offset && !offset.global) matrix.translateSelf(offset.x ?? 0, offset.y ?? 0);
    pattern.setTransform(matrix);
    if (key !== null) this.patterns.set(key, pattern);
    return pattern;
  }

  clear(background: Color) {
    const { ctx } = this;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // with transparent background, clearRect is required
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (background !== Colors.Transparent.keyword) {
      // filling with the background color is required to have a precise text color contrast calculation
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.restore();
  }

  fillPath(d: string, fillRule?: CanvasFillRule) {
    this.ctx.fill(new Path2D(d), fillRule);
  }

  strokePath(d: string) {
    this.ctx.stroke(new Path2D(d));
  }

  save() {
    this.ctx.save();
  }

  restore() {
    this.ctx.restore();
  }

  translate(x: number, y: number) {
    this.ctx.translate(x, y);
  }

  rotate(angle: number) {
    this.ctx.rotate(angle);
  }

  scale(x: number, y: number) {
    this.ctx.scale(x, y);
  }

  beginPath() {
    this.ctx.beginPath();
  }

  closePath() {
    this.ctx.closePath();
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.ctx.lineTo(x, y);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ctx.arcTo(x1, y1, x2, y2, radius);
  }

  rect(x: number, y: number, width: number, height: number) {
    this.ctx.rect(x, y, width, height);
  }

  fill(fillRule?: CanvasFillRule) {
    this.ctx.fill(fillRule);
  }

  stroke() {
    this.ctx.stroke();
  }

  clip(fillRule?: CanvasFillRule) {
    this.ctx.clip(fillRule);
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect(x, y, width, height);
  }

  clearRect(x: number, y: number, width: number, height: number) {
    this.ctx.clearRect(x, y, width, height);
  }

  fillText(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
  }

  strokeText(text: string, x: number, y: number) {
    this.ctx.strokeText(text, x, y);
  }

  measureText(text: string): TextMeasurement {
    return this.ctx.measureText(text);
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): GradientHandle {
    return this.ctx.createLinearGradient(x0, y0, x1, y1);
  }

  setLineDash(segments: number[]) {
    this.ctx.setLineDash(segments);
  }

  get fillStyle(): Paint {
    return this.ctx.fillStyle;
  }

  set fillStyle(paint: Paint) {
    this.ctx.fillStyle = paint as CanvasRenderingContext2D['fillStyle'];
  }

  get strokeStyle(): Paint {
    return this.ctx.strokeStyle;
  }

  set strokeStyle(paint: Paint) {
    this.ctx.strokeStyle = paint as CanvasRenderingContext2D['strokeStyle'];
  }

  get lineWidth() {
    return this.ctx.lineWidth;
  }

  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  get lineCap() {
    return this.ctx.lineCap;
  }

  set lineCap(cap: CanvasLineCap) {
    this.ctx.lineCap = cap;
  }

  get lineJoin() {
    return this.ctx.lineJoin;
  }

  set lineJoin(join: CanvasLineJoin) {
    this.ctx.lineJoin = join;
  }

  get font() {
    return this.ctx.font;
  }

  set font(font: string) {
    this.ctx.font = font;
  }

  get textAlign() {
    return this.ctx.textAlign;
  }

  set textAlign(align: CanvasTextAlign) {
    this.ctx.textAlign = align;
  }

  get textBaseline() {
    return this.ctx.textBaseline;
  }

  set textBaseline(baseline: CanvasTextBaseline) {
    this.ctx.textBaseline = baseline;
  }

  get direction() {
    return this.ctx.direction;
  }

  set direction(direction: CanvasDirection) {
    this.ctx.direction = direction;
  }

  get transition(): PaintTransition | null {
    return null;
  }

  set transition(_: PaintTransition | null) {
    // the frame loop tweens the values on canvas
  }

  get globalAlpha() {
    return this.ctx.globalAlpha;
  }

  set globalAlpha(alpha: number) {
    this.ctx.globalAlpha = alpha;
  }
}
