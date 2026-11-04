/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { parseFont } from './svg_canvas';
import type { TextOutlineContext } from './svg_canvas';
import type { HeadlessRenderer } from './types';
import type { Word } from '../chart_types/wordcloud/layout/types/viewmodel_types';
import { layoutMaker } from '../chart_types/wordcloud/renderer/svg/connected_component';
import { geometries } from '../chart_types/wordcloud/state/selectors/geometries';

type Matrix = [a: number, b: number, c: number, d: number, e: number, f: number];
type Point = [x: number, y: number];
type Edge = [x0: number, y0: number, x1: number, y1: number];
type Span = [left: number, right: number];
// The spans of a shape in each pixel row, from row `top` down.
type ShapeRows = { top: number; rows: Span[][] };
type TextMeasure = (text: string, font: string) => number;
type TextOutline = (text: string, font: string, x: number, baselineY: number) => string | undefined;

interface SpriteState {
  transform: Matrix;
  font: string;
  lineWidth: number;
  textAlign: string;
}

const DEGREES = Math.PI / 180;
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
// Text without an outline is filled as its box, from this far above to this far below the baseline (em).
const FALLBACK_ASCENT = 0.77;
const FALLBACK_DESCENT = 0.21;
// Scanlines sampled per pixel row, so thin horizontal strokes still mark the rows they cross.
const SAMPLES_PER_ROW = 4;
const PATH_TOKEN = /[A-Za-z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g;

const distance = ([x0, y0]: Point, [x1, y1]: Point) => Math.hypot(x1 - x0, y1 - y0);

// Points along a quadratic or cubic Bézier from `from`, excluding `from`, in segments of about 2px.
const flattenCurve = (from: Point, controls: Point[]): Point[] => {
  const points = [from, ...controls];
  const length = points.slice(1).reduce((sum, point, index) => sum + distance(points[index] ?? point, point), 0);
  const segments = Math.min(32, Math.max(1, Math.ceil(length / 2)));
  // Bernstein weights of a quadratic (3 points) or cubic (4 points) curve at t.
  const weights = (t: number) =>
    points.length === 3
      ? [(1 - t) ** 2, 2 * (1 - t) * t, t ** 2]
      : [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
  return Array.from({ length: segments }, (_, index) =>
    weights((index + 1) / segments).reduce<Point>(
      ([x, y], weight, i) => {
        const [px, py] = points[i] ?? from;
        return [x + weight * px, y + weight * py];
      },
      [0, 0],
    ),
  );
};

/** Turns absolute SVG path data (M, L, H, V, Q, C, Z) into closed polygons. */
const pathToPolygons = (path: string): Point[][] => {
  const polygons: Point[][] = [];
  let polygon: Point[] = [];
  let current: Point = [0, 0];
  let command = '';
  let args: number[] = [];
  const argumentCounts: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, Q: 4, C: 6 };
  const closePolygon = () => {
    if (polygon.length > 2) polygons.push(polygon);
    polygon = [];
  };
  for (const token of path.match(PATH_TOKEN) ?? []) {
    if (/[A-Za-z]/.test(token)) {
      command = token.toUpperCase();
      args = [];
      if (command === 'Z') closePolygon();
      continue;
    }
    args.push(Number(token));
    if (args.length < (argumentCounts[command] ?? Infinity)) continue;
    const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0] = args;
    args = [];
    if (command === 'M') {
      closePolygon();
      current = [a, b];
      polygon = [current];
      // Further coordinate pairs after a move are lines.
      command = 'L';
    } else if (command === 'L' || command === 'H' || command === 'V') {
      current = command === 'L' ? [a, b] : command === 'H' ? [a, current[1]] : [current[0], a];
      polygon.push(current);
    } else {
      const controls: Point[] =
        command === 'Q'
          ? [
              [a, b],
              [c, d],
            ]
          : [
              [a, b],
              [c, d],
              [e, f],
            ];
      polygon.push(...flattenCurve(current, controls));
      current = controls.at(-1) ?? current;
    }
  }
  closePolygon();
  return polygons;
};

// The parts of a scanline inside the polygons, by the nonzero winding rule, from the x and direction
// of every edge crossing it.
const windingSpans = (crossings: Array<[x: number, direction: number]>): Span[] => {
  const spans: Span[] = [];
  let winding = 0;
  let left = 0;
  [...crossings]
    .sort(([a], [b]) => a - b)
    .forEach(([x, direction]) => {
      if (winding === 0) left = x;
      winding += direction;
      if (winding === 0) spans.push([left, x]);
    });
  return spans;
};

// The union of the spans, as sorted spans that do not overlap.
const mergeSpans = (spans: Span[]): Span[] =>
  [...spans]
    .sort(([a], [b]) => a - b)
    .reduce<Span[]>((merged, [left, right]) => {
      const last = merged.at(-1);
      if (last && left <= last[1]) {
        last[1] = Math.max(last[1], right);
      } else {
        merged.push([left, right]);
      }
      return merged;
    }, []);

/**
 * The part of a canvas that d3-cloud uses to rasterize word sprites, for Node, which has no canvas.
 * Text is filled with the glyph outlines of the chart canvas font when it has them (see
 * {@link TextOutlineContext}), like the browser fills it, else as its box. Stroked text is filled
 * grown by half the line width. Every pixel the shape touches is marked, like antialiased edges.
 * @internal
 */
export class OutlineSpriteCanvas {
  private canvasWidth = 1;
  private canvasHeight = 1;
  private pixels = new Uint8ClampedArray(4);
  private state: SpriteState = { transform: IDENTITY, font: '10px sans-serif', lineWidth: 1, textAlign: 'start' };
  private readonly stack: SpriteState[] = [];
  private lastShape?: ShapeRows & { key: string };

  // Assigned by d3-cloud; sprites are monochrome, so the color does not matter.
  fillStyle = '';
  strokeStyle = '';

  constructor(
    private readonly measure: TextMeasure,
    private readonly outline: TextOutline,
  ) {}

  get width() {
    return this.canvasWidth;
  }

  set width(value: number) {
    this.canvasWidth = Math.max(1, Math.floor(value));
    this.resize();
  }

  get height() {
    return this.canvasHeight;
  }

  set height(value: number) {
    this.canvasHeight = Math.max(1, Math.floor(value));
    this.resize();
  }

  get font() {
    return this.state.font;
  }

  set font(value: string) {
    this.state.font = value;
  }

  get lineWidth() {
    return this.state.lineWidth;
  }

  set lineWidth(value: number) {
    this.state.lineWidth = value;
  }

  get textAlign() {
    return this.state.textAlign;
  }

  set textAlign(value: string) {
    this.state.textAlign = value;
  }

  getContext() {
    return this;
  }

  save() {
    this.stack.push({ ...this.state });
  }

  restore() {
    this.state = this.stack.pop() ?? this.state;
  }

  translate(x: number, y: number) {
    this.transform([1, 0, 0, 1, x, y]);
  }

  rotate(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.transform([cos, sin, -sin, cos, 0, 0]);
  }

  clearRect() {
    // d3-cloud always clears the whole canvas.
    this.pixels.fill(0);
  }

  measureText(text: string) {
    return { width: this.measure(text, this.state.font) };
  }

  fillText(text: string, x: number, y: number) {
    this.fillOutline(text, x, y, 0);
  }

  strokeText(text: string, x: number, y: number) {
    this.fillOutline(text, x, y, this.state.lineWidth / 2);
  }

  getImageData(sx: number, sy: number, sw: number, sh: number) {
    const data = new Uint8ClampedArray(sw * sh * 4);
    for (let row = 0; row < sh; row++) {
      const start = ((sy + row) * this.canvasWidth + sx) * 4;
      data.set(this.pixels.subarray(start, start + sw * 4), row * sw * 4);
    }
    return { data };
  }

  private resize() {
    this.pixels = new Uint8ClampedArray(this.canvasWidth * this.canvasHeight * 4);
  }

  private transform([a2, b2, c2, d2, e2, f2]: Matrix) {
    const [a, b, c, d, e, f] = this.state.transform;
    this.state.transform = [
      a * a2 + c * b2,
      b * a2 + d * b2,
      a * c2 + c * d2,
      b * c2 + d * d2,
      a * e2 + c * f2 + e,
      b * e2 + d * f2 + f,
    ];
  }

  private toDevice([x, y]: Point): Point {
    const [a, b, c, d, e, f] = this.state.transform;
    return [a * x + c * y + e, b * x + d * y + f];
  }

  // The text's outline polygons in user space, aligned like canvas text on the baseline `y`.
  private textPolygons(text: string, x: number, y: number): Point[][] {
    const { font, textAlign } = this.state;
    const width = this.measure(text, font);
    const left = textAlign === 'center' ? x - width / 2 : textAlign === 'right' || textAlign === 'end' ? x - width : x;
    const path = this.outline(text, font, left, y);
    if (path !== undefined) return pathToPolygons(path);
    const { size } = parseFont(font);
    const top = y - FALLBACK_ASCENT * size;
    const bottom = y + FALLBACK_DESCENT * size;
    return [
      [
        [left, top],
        [left + width, top],
        [left + width, bottom],
        [left, bottom],
      ],
    ];
  }

  // The parts of each pixel row the text's outline touches, from row `top` down. d3-cloud fills and
  // then strokes each word at the same place, so the last shape is kept.
  private textShape(text: string, x: number, y: number): ShapeRows {
    const key = JSON.stringify([text, x, y, this.state.font, this.state.textAlign, this.state.transform]);
    if (this.lastShape?.key === key) return this.lastShape;
    const edges = this.textPolygons(text, x, y).flatMap((polygon) => {
      const points = polygon.map((point) => this.toDevice(point));
      return points.map((from, index): Edge => {
        const to = points[(index + 1) % points.length] ?? from;
        return [from[0], from[1], to[0], to[1]];
      });
    });
    const ys = edges.flatMap(([, y0, , y1]) => [y0, y1]);
    const top = ys.length > 0 ? Math.floor(Math.min(...ys)) : 0;
    const rowCount = ys.length > 0 ? Math.ceil(Math.max(...ys)) - top : 0;
    // Where each edge crosses the scanline samples it spans (sample `i` is at y `top + (i + 0.5) / S`).
    const crossings = Array.from({ length: rowCount * SAMPLES_PER_ROW }, (): Array<[number, number]> => []);
    edges.forEach(([x0, y0, x1, y1]) => {
      if (y0 === y1) return;
      const first = Math.max(0, Math.ceil((Math.min(y0, y1) - top) * SAMPLES_PER_ROW - 0.5));
      const end = Math.min(crossings.length, Math.ceil((Math.max(y0, y1) - top) * SAMPLES_PER_ROW - 0.5));
      for (let index = first; index < end; index++) {
        const sampleY = top + (index + 0.5) / SAMPLES_PER_ROW;
        crossings[index]?.push([x0 + ((sampleY - y0) * (x1 - x0)) / (y1 - y0), y1 > y0 ? 1 : -1]);
      }
    });
    const rows = Array.from({ length: rowCount }, (_, row) =>
      mergeSpans(crossings.slice(row * SAMPLES_PER_ROW, (row + 1) * SAMPLES_PER_ROW).flatMap(windingSpans)),
    );
    this.lastShape = { key, top, rows };
    return this.lastShape;
  }

  // Marks every pixel within `grow` of the text's outline.
  private fillOutline(text: string, x: number, y: number, grow: number) {
    const { top, rows } = this.textShape(text, x, y);
    const spans = rows.flat();
    if (spans.length === 0) return;
    const reach = Math.ceil(grow);
    const minColumn = Math.max(0, Math.floor(Math.min(...spans.map(([left]) => left)) - reach));
    const maxColumn = Math.min(this.canvasWidth, Math.ceil(Math.max(...spans.map(([, right]) => right)) + reach));
    // Per row, +1 where a grown span starts and -1 where it ends, relative to `minColumn`.
    const coverage = new Int32Array(maxColumn - minColumn + 1);
    const firstRow = Math.max(0, top - reach);
    const lastRow = Math.min(this.canvasHeight - 1, top + rows.length - 1 + reach);
    for (let row = firstRow; row <= lastRow; row++) {
      coverage.fill(0);
      // The row is marked where the disc of radius `grow` around the shape's pixels reaches it.
      for (let offset = -reach; offset <= reach; offset++) {
        const dy = Math.max(0, Math.abs(offset) - 1);
        if (offset !== 0 && dy >= grow) continue;
        const dx = Math.sqrt(grow * grow - dy * dy);
        rows[row + offset - top]?.forEach(([left, right]) => {
          const start = Math.max(0, Math.floor(left - dx) - minColumn);
          const end = Math.min(coverage.length - 1, Math.ceil(right + dx) - minColumn);
          if (end <= start) return;
          coverage[start] = (coverage[start] ?? 0) + 1;
          coverage[end] = (coverage[end] ?? 0) - 1;
        });
      }
      let depth = 0;
      let runStart = 0;
      coverage.forEach((change, column) => {
        if (depth === 0 && change > 0) runStart = column;
        depth += change;
        if (depth === 0 && change < 0) this.fillRowSpan(row, minColumn + runStart, minColumn + column);
      });
    }
  }

  private fillRowSpan(row: number, left: number, right: number) {
    const firstColumn = Math.max(0, Math.floor(left));
    const lastColumn = Math.min(this.canvasWidth - 1, Math.ceil(right) - 1);
    if (lastColumn < firstColumn) return;
    const rowStart = row * this.canvasWidth;
    this.pixels.fill(255, (rowStart + firstColumn) * 4, (rowStart + lastColumn + 1) * 4);
  }
}

/**
 * Lays out the words with d3-cloud like the Wordcloud SVG renderer (`layoutMaker`), rasterizing
 * their sprites from the canvas font's glyph outlines, and draws them as text.
 * @internal
 */
export const renderWordcloudChart: HeadlessRenderer = (ctx, state) => {
  const { wordcloudViewModel } = geometries(state);
  const { width, height } = state.parentDimensions;
  if (width === 0 || height === 0) return;

  const measure: TextMeasure = (text, font) => {
    ctx.save();
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    ctx.restore();
    return textWidth;
  };
  const outline: TextOutline = (text, font, x, baselineY) =>
    (ctx as Partial<TextOutlineContext>).textOutline?.(text, font, x, baselineY);

  let words: Word[] = [];
  // d3-cloud places every word synchronously, since its time interval is unlimited.
  layoutMaker(wordcloudViewModel, { width, height })
    .canvas(() => new OutlineSpriteCanvas(measure, outline) as unknown as HTMLCanvasElement)
    .on('end', (placed) => (words = placed))
    .start();

  const { data, outOfRoomCallback } = wordcloudViewModel;
  if (data.length !== words.length && typeof outOfRoomCallback === 'function') {
    outOfRoomCallback(
      data.length,
      words.length,
      words.map(({ text }) => text),
    );
  }

  words.forEach(({ text, x = 0, y = 0, rotate = 0, style, fontWeight, size, fontFamily, color }) => {
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.rotate(rotate * DEGREES);
    ctx.font = `${style} ${fontWeight} ${size}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  });
};
