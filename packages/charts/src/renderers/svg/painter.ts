/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMeasureContext } from './measure';
import { round, SvgPathBuilder } from './path';
import { baselineOffset, textAnchor } from './text';
import { colorToRgba } from '../../common/color_library_wrappers';
import type { Color } from '../../common/colors';
import { Colors } from '../../common/colors';
import type { Texture } from '../../geoms/types';
import { Logger } from '../../utils/logger';
import type { TimeFunction } from '../../utils/time_functions';
import type { GradientHandle, Paint, Painter, PaintTransition, PatternHandle, TextMeasurement } from '../painter';

/**
 * A recorded SVG element. Attribute names are the React (camelCase) spellings, so the tree maps
 * one to one onto React elements; `style` holds a style object.
 * @internal
 */
export interface SvgNode {
  tag: string;
  attrs: Record<string, unknown>;
  children?: SvgNode[];
  text?: string;
}

/** @internal */
export interface SvgPainterOptions {
  width: number;
  height: number;
  /** prefix for the ids of defs (clip paths, gradients): unique per chart and stage on the page */
  idPrefix: string;
  /** the inherited writing direction, what the canvas `dir` attribute provides */
  direction?: 'ltr' | 'rtl';
}

interface Style {
  fillStyle: Paint;
  strokeStyle: Paint;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  dash: number[];
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  direction: CanvasDirection;
  globalAlpha: number;
  transition: PaintTransition | null;
}

const defaultStyle = (): Style => ({
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  dash: [],
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
  globalAlpha: 1,
  transition: null,
});

interface SavedState {
  style: Style;
  container: SvgNode;
}

/** a linear gradient, registered in `<defs>` on first use */
class SvgGradient implements GradientHandle {
  readonly stops: Array<{ offset: number; color: string }> = [];
  registered = false;

  constructor(
    readonly id: string,
    readonly x0: number,
    readonly y0: number,
    readonly x1: number,
    readonly y1: number,
  ) {}

  addColorStop(offset: number, color: string) {
    this.stops.push({ offset, color });
  }
}

/** a texture tile, registered in `<defs>` on first use */
class SvgPattern implements PatternHandle {
  registered = false;

  constructor(
    readonly id: string,
    readonly texture: Texture,
  ) {}

  setTransform() {
    // the tile transform is part of the texture
  }
}

const HAS_ALPHA_RE = /^(rgba|hsla)\(|^#[\da-f]{4}$|^#[\da-f]{8}$/i;
const splitAlphaCache = new Map<string, { color: string; opacity: number }>();

/**
 * Splits the alpha channel out of a CSS color into a separate opacity, so the emitted markup
 * uses `rgb()` plus `*-opacity`, which every SVG consumer understands.
 */
function splitAlpha(color: string): { color: string; opacity: number } {
  if (!HAS_ALPHA_RE.test(color)) return { color, opacity: 1 };
  let split = splitAlphaCache.get(color);
  if (!split) {
    const [r, g, b, a] = colorToRgba(color);
    split = { color: `rgb(${r},${g},${b})`, opacity: a };
    splitAlphaCache.set(color, split);
  }
  return split;
}

// the library's easing curves are the CSS keywords' curves
const CSS_TIMING: Record<TimeFunction, string> = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

const TRANSITIONED_PROPERTIES = ['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'opacity'];

function cssTransition({ duration, delay, timeFunction }: PaintTransition): string {
  const timing = `${round(duration)}ms ${CSS_TIMING[timeFunction]} ${round(delay)}ms`;
  return TRANSITIONED_PROPERTIES.map((property) => `${property} ${timing}`).join(', ');
}

const needsSpacePreserve = (text: string) => /^\s|\s$|\s\s/.test(text);
const isFinitePair = (x: number, y: number) => Number.isFinite(x) && Number.isFinite(y);

/**
 * The SVG backend: records Canvas2D calls into an element tree.
 *
 * - `save()` opens a `<g>`, each transform call opens a nested `<g transform>` so only later
 *   siblings are affected, `restore()` pops back to the matching `save()`: canvas's
 *   post-multiplied transform stack, expressed as nesting.
 * - `clip()` puts the current path into a `<clipPath>` and opens a `<g clip-path>`; nested clips
 *   nest, which is intersection; transforms after the clip cannot move it.
 * - every `fill()`/`stroke()`/`fillText()` emits one element carrying the style in effect, which
 *   is what canvas does with per-operation alpha.
 * - text sits on the alphabetic baseline shifted by a measured `dy` (see `baselineOffset`).
 *
 * A painter records one frame; create a new one per render.
 * @internal
 */
export class SvgPainter implements Painter {
  readonly kind = 'svg' as const;

  readonly animates = false;

  private readonly root: SvgNode = { tag: 'g', attrs: {}, children: [] };
  private readonly defs: SvgNode[] = [];
  private current: SvgNode = this.root;
  private readonly stack: SavedState[] = [];
  private style: Style = defaultStyle();
  private readonly path = new SvgPathBuilder();
  private idCount = 0;
  private readonly patterns = new Map<string, SvgPattern>();
  private readonly idPrefix: string;
  private readonly inheritedDirection: 'ltr' | 'rtl';

  constructor(private readonly options: SvgPainterOptions) {
    // every character outside the plain set is encoded as its code, so distinct chart ids stay distinct
    this.idPrefix = options.idPrefix.replaceAll(/[^\dA-Za-z-]/g, (char) => `_${char.codePointAt(0)!.toString(16)}_`);
    this.inheritedDirection = options.direction ?? 'ltr';
  }

  /** the recorded frame: defs first, then the drawing, in paint order */
  nodes(): SvgNode[] {
    const children = this.root.children ?? [];
    return this.defs.length > 0 ? [{ tag: 'defs', attrs: {}, children: this.defs }, ...children] : children;
  }

  clear(background: Color) {
    if (background === Colors.Transparent.keyword) return;
    const { width, height } = this.options;
    // the background goes under everything, in stage coordinates, whatever the current transform
    this.root.children?.unshift({ tag: 'rect', attrs: { x: 0, y: 0, width, height, fill: background } });
  }

  private append(tag: string, attrs: Record<string, unknown>, text?: string): SvgNode {
    const node: SvgNode = text === undefined ? { tag, attrs, children: [] } : { tag, attrs, text };
    this.current.children?.push(node);
    return node;
  }

  private nextId(kind: string) {
    this.idCount += 1;
    return `${this.idPrefix}-${kind}-${this.idCount}`;
  }

  // ---- state and transforms

  save() {
    this.stack.push({ style: { ...this.style, dash: [...this.style.dash] }, container: this.current });
    this.current = this.append('g', {});
  }

  restore() {
    const saved = this.stack.pop();
    if (!saved) return;
    this.style = saved.style;
    this.current = saved.container;
  }

  translate(x: number, y: number) {
    if (!isFinitePair(x, y) || (x === 0 && y === 0)) return;
    this.current = this.append('g', { transform: `translate(${round(x)} ${round(y)})` });
  }

  rotate(angle: number) {
    if (!Number.isFinite(angle) || angle === 0) return;
    this.current = this.append('g', { transform: `rotate(${round((angle * 180) / Math.PI)})` });
  }

  scale(x: number, y: number) {
    if (!isFinitePair(x, y) || (x === 1 && y === 1)) return;
    this.current = this.append('g', { transform: `scale(${round(x)} ${round(y)})` });
  }

  // ---- paths

  beginPath() {
    this.path.reset();
  }

  closePath() {
    this.path.closePath();
  }

  moveTo(x: number, y: number) {
    this.path.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.path.lineTo(x, y);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
    this.path.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.path.arcTo(x1, y1, x2, y2, radius);
  }

  rect(x: number, y: number, width: number, height: number) {
    this.path.rect(x, y, width, height);
  }

  fill(fillRule?: CanvasFillRule) {
    if (!this.path.isEmpty) this.fillPath(this.path.toString(), fillRule);
  }

  stroke() {
    if (!this.path.isEmpty) this.strokePath(this.path.toString());
  }

  clip(fillRule?: CanvasFillRule) {
    const id = this.nextId('clip');
    // an empty clip path clips everything, as it does on canvas
    const children = this.path.isEmpty
      ? []
      : [{ tag: 'path', attrs: { d: this.path.toString(), ...(fillRule === 'evenodd' && { clipRule: fillRule }) } }];
    this.defs.push({ tag: 'clipPath', attrs: { id, clipPathUnits: 'userSpaceOnUse' }, children });
    this.current = this.append('g', { clipPath: `url(#${id})` });
  }

  fillRect(x: number, y: number, width: number, height: number) {
    if (!isFinitePair(x, y) || !isFinitePair(width, height) || width === 0 || height === 0) return;
    // a negative size is legal on canvas but disables rendering on <rect>
    this.append('rect', {
      x: round(Math.min(x, x + width)),
      y: round(Math.min(y, y + height)),
      width: round(Math.abs(width)),
      height: round(Math.abs(height)),
      ...this.paintAttrs('fill', this.style.fillStyle),
      ...this.transitionAttrs(),
    });
  }

  /** the inline style animating paint changes, when a transition is in effect */
  private transitionAttrs(font?: string): Record<string, unknown> {
    const { transition } = this.style;
    const style = { ...(font && { font }), ...(transition && { transition: cssTransition(transition) }) };
    return Object.keys(style).length > 0 ? { style } : {};
  }

  clearRect() {
    // nothing to erase: a frame is recorded from scratch
  }

  fillPath(d: string, fillRule?: CanvasFillRule) {
    this.append('path', {
      d,
      ...(fillRule === 'evenodd' && { fillRule }),
      ...this.paintAttrs('fill', this.style.fillStyle),
      ...this.transitionAttrs(),
    });
  }

  strokePath(d: string) {
    this.append('path', { d, fill: 'none', ...this.strokeAttrs(), ...this.transitionAttrs() });
  }

  // ---- text

  fillText(text: string, x: number, y: number) {
    if (text === '' || !isFinitePair(x, y)) return;
    this.append('text', { ...this.textAttrs(x, y, text), ...this.paintAttrs('fill', this.style.fillStyle) }, text);
  }

  strokeText(text: string, x: number, y: number) {
    if (text === '' || !isFinitePair(x, y)) return;
    this.append('text', { ...this.textAttrs(x, y, text), fill: 'none', ...this.strokeAttrs() }, text);
  }

  measureText(text: string): TextMeasurement {
    const ctx = getMeasureContext();
    if (!ctx) return { width: 0 };
    ctx.save();
    ctx.font = this.style.font;
    const metrics = ctx.measureText(text);
    ctx.restore();
    return metrics;
  }

  private textAttrs(x: number, y: number, text: string): Record<string, unknown> {
    const { font, textAlign, textBaseline, direction } = this.style;
    const effectiveDirection = direction === 'inherit' ? this.inheritedDirection : direction;
    const anchor = textAnchor(textAlign, effectiveDirection);
    const dy = baselineOffset(font, textBaseline);
    return {
      x: round(x),
      y: round(y),
      ...(dy !== 0 && { dy }),
      ...(anchor !== 'start' && { textAnchor: anchor }),
      ...(direction !== 'inherit' && { direction }),
      ...(needsSpacePreserve(text) && { xmlSpace: 'preserve' }),
      ...this.transitionAttrs(font),
    };
  }

  // ---- paint servers

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): GradientHandle {
    return new SvgGradient(this.nextId('gradient'), x0, y0, x1, y1);
  }

  createPattern(texture: Texture): PatternHandle | null {
    if (typeof texture.path !== 'string') {
      Logger.warn('A Path2D texture cannot be rendered as SVG, provide the path as a string instead');
      return null;
    }
    const key = JSON.stringify(texture);
    let pattern = this.patterns.get(key);
    if (!pattern) {
      pattern = new SvgPattern(this.nextId('pattern'), texture);
      this.patterns.set(key, pattern);
    }
    return pattern;
  }

  /** the tile: the shape centred in a `width` by `height` cell, the cell grid transformed as a whole */
  private registerPattern({ id, texture }: SvgPattern) {
    const { width, height, path, shapeRotation, stroke, strokeWidth, fill, dash, opacity } = texture;
    const { rotation, offset } = texture;
    const translate = offset ? `translate(${round(offset.x ?? 0)} ${round(offset.y ?? 0)})` : '';
    const tileTransform = [
      offset?.global ? translate : '',
      rotation ? `rotate(${round(rotation)})` : '',
      offset && !offset.global ? translate : '',
    ]
      .filter(Boolean)
      .join(' ');
    const strokeSplit = splitAlpha(stroke);
    const fillSplit = fill ? splitAlpha(fill) : undefined;
    this.defs.push({
      tag: 'pattern',
      attrs: {
        id,
        patternUnits: 'userSpaceOnUse',
        width: round(width),
        height: round(height),
        ...(tileTransform && { patternTransform: tileTransform }),
      },
      children: [
        {
          tag: 'path',
          attrs: {
            d: path,
            transform: `translate(${round(width / 2)} ${round(height / 2)})${
              shapeRotation ? ` rotate(${round(shapeRotation)})` : ''
            }`,
            fill: fillSplit ? fillSplit.color : 'none',
            ...(fillSplit && fillSplit.opacity !== 1 && { fillOpacity: round(fillSplit.opacity) }),
            // the canvas tile strokes first and fills over the inner half of the stroke
            ...(fillSplit && { paintOrder: 'stroke' }),
            stroke: strokeSplit.color,
            ...(strokeSplit.opacity !== 1 && { strokeOpacity: round(strokeSplit.opacity) }),
            ...(strokeWidth !== 1 && { strokeWidth: round(strokeWidth) }),
            ...(dash && dash.length > 0 && { strokeDasharray: dash.map(round).join(' ') }),
            ...(opacity !== 1 && { opacity: round(opacity) }),
          },
        },
      ],
    });
  }

  private paintAttrs(kind: 'fill' | 'stroke', paint: Paint): Record<string, unknown> {
    const { globalAlpha } = this.style;
    const opacityKey = `${kind}Opacity`;
    if (typeof paint === 'string') {
      const { color, opacity } = splitAlpha(paint);
      const combined = opacity * globalAlpha;
      return { [kind]: color, ...(combined !== 1 && { [opacityKey]: round(combined) }) };
    }
    if (paint instanceof SvgGradient) {
      if (!paint.registered) {
        paint.registered = true;
        this.defs.push({
          tag: 'linearGradient',
          attrs: {
            id: paint.id,
            gradientUnits: 'userSpaceOnUse',
            x1: round(paint.x0),
            y1: round(paint.y0),
            x2: round(paint.x1),
            y2: round(paint.y1),
          },
          children: paint.stops.map(({ offset, color }) => {
            const split = splitAlpha(color);
            return {
              tag: 'stop',
              attrs: { offset, stopColor: split.color, ...(split.opacity !== 1 && { stopOpacity: split.opacity }) },
            };
          }),
        });
      }
      return { [kind]: `url(#${paint.id})`, ...(globalAlpha !== 1 && { [opacityKey]: round(globalAlpha) }) };
    }
    if (paint instanceof SvgPattern) {
      if (!paint.registered) {
        paint.registered = true;
        this.registerPattern(paint);
      }
      return { [kind]: `url(#${paint.id})`, ...(globalAlpha !== 1 && { [opacityKey]: round(globalAlpha) }) };
    }
    // a paint server from another backend (a canvas pattern): nothing sensible to emit
    return { [kind]: 'none' };
  }

  private strokeAttrs(): Record<string, unknown> {
    const { strokeStyle, lineWidth, lineCap, lineJoin, dash } = this.style;
    return {
      ...this.paintAttrs('stroke', strokeStyle),
      ...(lineWidth !== 1 && { strokeWidth: round(lineWidth) }),
      ...(lineCap !== 'butt' && { strokeLinecap: lineCap }),
      ...(lineJoin !== 'miter' && { strokeLinejoin: lineJoin }),
      ...(dash.length > 0 && { strokeDasharray: dash.map(round).join(' ') }),
    };
  }

  // ---- style properties, with canvas's rules for ignored assignments

  setLineDash(segments: number[]) {
    if (segments.every((s) => Number.isFinite(s) && s >= 0)) this.style.dash = [...segments];
  }

  get fillStyle(): Paint {
    return this.style.fillStyle;
  }

  set fillStyle(paint: Paint) {
    this.style.fillStyle = paint;
  }

  get strokeStyle(): Paint {
    return this.style.strokeStyle;
  }

  set strokeStyle(paint: Paint) {
    this.style.strokeStyle = paint;
  }

  get lineWidth() {
    return this.style.lineWidth;
  }

  set lineWidth(width: number) {
    // zero, negative, infinite and NaN values are ignored, as on canvas
    if (Number.isFinite(width) && width > 0) this.style.lineWidth = width;
  }

  get lineCap() {
    return this.style.lineCap;
  }

  set lineCap(cap: CanvasLineCap) {
    this.style.lineCap = cap;
  }

  get lineJoin() {
    return this.style.lineJoin;
  }

  set lineJoin(join: CanvasLineJoin) {
    this.style.lineJoin = join;
  }

  get font() {
    return this.style.font;
  }

  set font(font: string) {
    this.style.font = font;
  }

  get textAlign() {
    return this.style.textAlign;
  }

  set textAlign(align: CanvasTextAlign) {
    this.style.textAlign = align;
  }

  get textBaseline() {
    return this.style.textBaseline;
  }

  set textBaseline(baseline: CanvasTextBaseline) {
    this.style.textBaseline = baseline;
  }

  get direction() {
    return this.style.direction;
  }

  set direction(direction: CanvasDirection) {
    this.style.direction = direction;
  }

  get transition(): PaintTransition | null {
    return this.style.transition;
  }

  set transition(transition: PaintTransition | null) {
    this.style.transition = transition;
  }

  get globalAlpha() {
    return this.style.globalAlpha;
  }

  set globalAlpha(alpha: number) {
    // out of range, infinite and NaN values are ignored, as on canvas
    if (Number.isFinite(alpha) && alpha >= 0 && alpha <= 1) this.style.globalAlpha = alpha;
  }
}
