/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Measures the width of `text` drawn with a CSS `font` shorthand, in pixels.
 * @public
 */
export type SvgTextWidthMeasure = (text: string, font: string) => number;

/**
 * Options for {@link SvgCanvas}.
 * @public
 */
export interface SvgCanvasOptions {
  /**
   * Measures text for the chart layout. Defaults to the `font` metrics when given, else Helvetica
   * metrics, which match what most SVG rasterizers fall back to.
   */
  measureTextWidth?: SvgTextWidthMeasure;
  /**
   * Measures text and draws it as outlines, so the image looks the same whatever fonts the SVG
   * rasterizer has, e.g. {@link createGlyphFont}. Without it, text is drawn as SVG `<text>`.
   */
  font?: SvgFont;
}

/**
 * A font that measures text and turns it into SVG path data.
 * @public
 */
export interface SvgFont {
  family: string;
  /** Width of `text` drawn with a CSS `font` shorthand, in pixels. */
  measure: SvgTextWidthMeasure;
  /**
   * Outline of `text` as SVG path data in pixels, starting at `x` on the alphabetic baseline
   * `baselineY`, or undefined when the font cannot draw it.
   */
  toPath(text: string, font: string, x: number, baselineY: number): string | undefined;
}

/**
 * A context that can give the outline of text in its font, like `SvgCanvas.context` with a `font`.
 * Renderers use it to lay out text by its real glyph shapes (e.g. the Wordcloud).
 * @internal
 */
export interface TextOutlineContext {
  /**
   * Outline of `text` as SVG path data, starting at `x` on the alphabetic baseline `baselineY`, in
   * the current user space, or undefined when the canvas has no outline font that can draw it.
   */
  textOutline(text: string, font: string, x: number, baselineY: number): string | undefined;
}

/**
 * Options for {@link SvgCanvas.toSvg}.
 * @public
 */
export interface SvgOutputOptions {
  /** Fills the whole image behind the chart, e.g. `'#fff'`. Transparent when omitted. */
  background?: string;
}

// Helvetica advance widths per 1000 em for ASCII 32..126 (standard AFM metrics).
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
  722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556,
  556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
  260, 334, 584,
];
const DEFAULT_GLYPH_WIDTH = 556;
const BOLD_WIDTH_FACTOR = 1.07;

// Offsets in em from each canvas `textBaseline` to the alphabetic baseline SVG text uses.
const BASELINE_OFFSETS: Record<CanvasTextBaseline, number> = {
  alphabetic: 0,
  top: 0.77,
  hanging: 0.72,
  middle: 0.35,
  ideographic: -0.21,
  bottom: -0.21,
};
const ASCENT = 0.77;
const DESCENT = 0.21;
const TAU = Math.PI * 2;

type Matrix = [a: number, b: number, c: number, d: number, e: number, f: number];
type Point = [x: number, y: number];

interface ParsedFont {
  size: number;
  family: string;
  bold: boolean;
  italic: boolean;
  /** Numeric CSS font weight. */
  weight: number;
}

/** @internal */
export const parseFont = (font: string): ParsedFont => {
  const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(font);
  if (!sizeMatch) return { size: 10, family: 'sans-serif', bold: false, italic: false, weight: 400 };
  const before = font.slice(0, sizeMatch.index);
  const family = font
    .slice(sizeMatch.index + sizeMatch[0].length)
    .replace(/^\/\S+/, '') // drop a `/line-height` part
    .trim();
  const numericWeight = /\b([1-9]00)\b/.exec(before)?.[1];
  const weight = numericWeight ? Number(numericWeight) : /\b(bold|bolder)\b/.test(before) ? 700 : 400;
  return {
    size: Number(sizeMatch[1]),
    family: family || 'sans-serif',
    bold: weight >= 500,
    italic: /\bitalic\b/.test(before),
    weight,
  };
};

/**
 * Text width from Helvetica metrics, the default {@link SvgTextWidthMeasure}.
 * @public
 */
export const measureHelveticaTextWidth: SvgTextWidthMeasure = (text, font) => {
  const { size, bold } = parseFont(font);
  let units = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    units += code >= 32 && code <= 126 ? HELVETICA_WIDTHS[code - 32] ?? DEFAULT_GLYPH_WIDTH : DEFAULT_GLYPH_WIDTH;
  }
  return (units / 1000) * size * (bold ? BOLD_WIDTH_FACTOR : 1);
};

const round = (value: number) => Number(value.toFixed(2));
const escapeXml = (text: string) => text.replaceAll(/["&'<>]/g, (char) => `&#${char.charCodeAt(0)};`);

// SVG 1.1 renderers do not all accept rgba(), so it is split into a color and an opacity.
const parseColor = (color: string): { color: string; opacity: number } => {
  if (color === 'transparent' || color === 'none') return { color: 'none', opacity: 0 };
  const rgba = /^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/.exec(color);
  if (!rgba) return { color, opacity: 1 };
  const [, r, g, b, a] = rgba.map(Number);
  return { color: `rgb(${Math.round(r ?? 0)},${Math.round(g ?? 0)},${Math.round(b ?? 0)})`, opacity: a ?? 1 };
};

/** SVG path data built from Path2D-style calls; Elastic Charts only builds paths from SVG strings. */
class SvgPath2D {
  readonly d: string;

  constructor(path?: string | SvgPath2D) {
    this.d = typeof path === 'string' ? path : path?.d ?? '';
  }
}

class SvgLinearGradient {
  readonly stops: Array<{ offset: number; color: string }> = [];
  defined = false;

  constructor(
    readonly id: string,
    readonly from: Point,
    readonly to: Point,
  ) {}

  addColorStop(offset: number, color: string) {
    this.stops.push({ offset, color });
  }
}

interface DrawingState {
  transform: Matrix;
  fillStyle: unknown;
  strokeStyle: unknown;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  lineDash: number[];
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  direction: CanvasDirection;
  globalAlpha: number;
  clipId?: string;
}

/**
 * The subset of the Canvas 2D API Elastic Charts draws with, recorded as SVG elements.
 * Shapes are stored in device coordinates, so the SVG needs no nested transforms.
 */
class SvgRecordingContext {
  readonly canvas: { width: number; height: number };
  readonly elements: string[] = [];
  readonly defs: string[] = [];
  private nextId = 0;
  private stack: DrawingState[] = [];
  private state: DrawingState = {
    transform: [1, 0, 0, 1, 0, 0],
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    lineDash: [],
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    globalAlpha: 1,
  };

  private path: string[] = [];
  private current?: Point;
  private subpathStart?: Point;

  constructor(
    width: number,
    height: number,
    private readonly measureTextWidth: SvgTextWidthMeasure,
    private readonly outlineFont?: SvgFont,
  ) {
    this.canvas = { width, height };
  }

  // --- state -------------------------------------------------------------

  save() {
    this.stack.push({ ...this.state, transform: [...this.state.transform] });
  }

  restore() {
    this.state = this.stack.pop() ?? this.state;
  }

  get fillStyle() {
    return this.state.fillStyle;
  }

  set fillStyle(value: unknown) {
    this.state.fillStyle = value;
  }

  get strokeStyle() {
    return this.state.strokeStyle;
  }

  set strokeStyle(value: unknown) {
    this.state.strokeStyle = value;
  }

  get lineWidth() {
    return this.state.lineWidth;
  }

  set lineWidth(value: number) {
    this.state.lineWidth = value;
  }

  get lineCap() {
    return this.state.lineCap;
  }

  set lineCap(value: CanvasLineCap) {
    this.state.lineCap = value;
  }

  get lineJoin() {
    return this.state.lineJoin;
  }

  set lineJoin(value: CanvasLineJoin) {
    this.state.lineJoin = value;
  }

  get font() {
    return this.state.font;
  }

  set font(value: string) {
    this.state.font = value;
  }

  get textAlign() {
    return this.state.textAlign;
  }

  set textAlign(value: CanvasTextAlign) {
    this.state.textAlign = value;
  }

  get textBaseline() {
    return this.state.textBaseline;
  }

  set textBaseline(value: CanvasTextBaseline) {
    this.state.textBaseline = value;
  }

  get direction() {
    return this.state.direction;
  }

  set direction(value: CanvasDirection) {
    this.state.direction = value;
  }

  get globalAlpha() {
    return this.state.globalAlpha;
  }

  set globalAlpha(value: number) {
    this.state.globalAlpha = value;
  }

  setLineDash(segments: number[]) {
    this.state.lineDash = [...segments];
  }

  getLineDash() {
    return [...this.state.lineDash];
  }

  // --- transforms --------------------------------------------------------

  setTransform(a: number | DOMMatrix2DInit, b?: number, c?: number, d?: number, e?: number, f?: number) {
    this.state.transform =
      typeof a === 'number'
        ? [a, b ?? 0, c ?? 0, d ?? 1, e ?? 0, f ?? 0]
        : [a.a ?? 1, a.b ?? 0, a.c ?? 0, a.d ?? 1, a.e ?? 0, a.f ?? 0];
  }

  resetTransform() {
    this.setTransform(1, 0, 0, 1, 0, 0);
  }

  transform(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) {
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

  translate(x: number, y: number) {
    this.transform(1, 0, 0, 1, x, y);
  }

  scale(x: number, y: number) {
    this.transform(x, 0, 0, y, 0, 0);
  }

  rotate(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.transform(cos, sin, -sin, cos, 0, 0);
  }

  private toDevice(x: number, y: number): Point {
    const [a, b, c, d, e, f] = this.state.transform;
    return [a * x + c * y + e, b * x + d * y + f];
  }

  // Uniform scale of the current transform, for radii and line widths.
  private get scaleFactor() {
    const [a, b, c, d] = this.state.transform;
    return Math.sqrt(Math.abs(a * d - b * c));
  }

  // --- paths -------------------------------------------------------------

  beginPath() {
    this.path = [];
    this.current = undefined;
    this.subpathStart = undefined;
  }

  moveTo(x: number, y: number) {
    const point = this.toDevice(x, y);
    this.path.push(`M${round(point[0])} ${round(point[1])}`);
    this.current = point;
    this.subpathStart = point;
  }

  lineTo(x: number, y: number) {
    if (!this.current) return this.moveTo(x, y);
    const point = this.toDevice(x, y);
    this.path.push(`L${round(point[0])} ${round(point[1])}`);
    this.current = point;
  }

  closePath() {
    if (!this.current) return;
    this.path.push('Z');
    this.current = this.subpathStart;
  }

  rect(x: number, y: number, width: number, height: number) {
    this.moveTo(x, y);
    this.lineTo(x + width, y);
    this.lineTo(x + width, y + height);
    this.lineTo(x, y + height);
    this.closePath();
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise = false) {
    const [cx, cy] = this.toDevice(x, y);
    const r = radius * this.scaleFactor;
    const [a, b] = this.state.transform;
    const start = startAngle + Math.atan2(b, a);
    const pointAt = (angle: number): Point => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    const startPoint = pointAt(start);
    this.path.push(`${this.current ? 'L' : 'M'}${round(startPoint[0])} ${round(startPoint[1])}`);
    if (!this.current) this.subpathStart = startPoint;
    this.current = startPoint;

    const rawSweep = counterclockwise ? startAngle - endAngle : endAngle - startAngle;
    const sweep = rawSweep >= TAU ? TAU : ((rawSweep % TAU) + TAU) % TAU;
    const direction = counterclockwise ? -1 : 1;
    // An SVG arc cannot draw a full circle, so long sweeps are split in two.
    const steps = sweep > Math.PI ? 2 : 1;
    for (let step = 1; step <= steps && sweep > 0; step++) {
      const point = pointAt(start + (direction * sweep * step) / steps);
      this.path.push(`A${round(r)} ${round(r)} 0 0 ${counterclockwise ? 0 : 1} ${round(point[0])} ${round(point[1])}`);
      this.current = point;
    }
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    if (!this.current) this.moveTo(x1, y1);
    const p0 = this.current ?? this.toDevice(x1, y1);
    const p1 = this.toDevice(x1, y1);
    const p2 = this.toDevice(x2, y2);
    const r = radius * this.scaleFactor;
    const v1: Point = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2: Point = [p2[0] - p1[0], p2[1] - p1[1]];
    const length1 = Math.hypot(...v1);
    const length2 = Math.hypot(...v2);
    if (r === 0 || length1 === 0 || length2 === 0 || Math.abs(v1[0] * v2[1] - v1[1] * v2[0]) < 1e-9) {
      this.path.push(`L${round(p1[0])} ${round(p1[1])}`);
      this.current = p1;
      return;
    }
    const u1: Point = [v1[0] / length1, v1[1] / length1];
    const u2: Point = [v2[0] / length2, v2[1] / length2];
    const angle = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const distance = r / Math.tan(angle / 2);
    const t1: Point = [p1[0] + u1[0] * distance, p1[1] + u1[1] * distance];
    const t2: Point = [p1[0] + u2[0] * distance, p1[1] + u2[1] * distance];
    // Turning from (p0 -> p1) to (p1 -> p2); positive turns clockwise on screen.
    const turn = u1[1] * u2[0] - u1[0] * u2[1];
    this.path.push(`L${round(t1[0])} ${round(t1[1])}`);
    this.path.push(`A${round(r)} ${round(r)} 0 0 ${turn > 0 ? 1 : 0} ${round(t2[0])} ${round(t2[1])}`);
    this.current = t2;
  }

  // --- painting ----------------------------------------------------------

  private paint(style: unknown): { color: string; opacity: number } {
    const alpha = this.state.globalAlpha;
    if (style instanceof SvgLinearGradient) {
      this.defineGradient(style);
      return { color: `url(#${style.id})`, opacity: alpha };
    }
    // Patterns (bar and area textures) are not supported.
    if (typeof style !== 'string') return { color: 'none', opacity: 0 };
    const { color, opacity } = parseColor(style);
    return { color, opacity: opacity * alpha };
  }

  private clipAttribute() {
    return this.state.clipId ? ` clip-path="url(#${this.state.clipId})"` : '';
  }

  // Device-space shapes carry the clip themselves; user-space ones (a Path2D or text keeps the
  // current transform) are wrapped in a group, because a clip on a transformed element would move with it.
  private pushElement(element: string, userSpaceTransform?: string) {
    if (!userSpaceTransform) {
      this.elements.push(element.replace(/\/>$/, `${this.clipAttribute()}/>`));
      return;
    }
    const transformed = element.replace(/^<(\w+) /, `<$1 transform="${userSpaceTransform}" `);
    this.elements.push(this.state.clipId ? `<g${this.clipAttribute()}>${transformed}</g>` : transformed);
  }

  private get matrixAttribute() {
    return `matrix(${this.state.transform.map(round).join(' ')})`;
  }

  fill(pathOrRule?: SvgPath2D | CanvasFillRule, maybeRule?: CanvasFillRule) {
    if (pathOrRule instanceof SvgPath2D) {
      this.emitFill(pathOrRule.d, maybeRule, this.matrixAttribute);
    } else if (this.path.length > 0) {
      this.emitFill(this.path.join(''), pathOrRule);
    }
  }

  private emitFill(d: string, fillRule: CanvasFillRule = 'nonzero', userSpaceTransform?: string) {
    const { color, opacity } = this.paint(this.state.fillStyle);
    if (color === 'none' || opacity === 0) return;
    const opacityAttribute = opacity < 1 ? ` fill-opacity="${round(opacity)}"` : '';
    const ruleAttribute = fillRule === 'evenodd' ? ' fill-rule="evenodd"' : '';
    this.pushElement(`<path d="${d}" fill="${color}"${opacityAttribute}${ruleAttribute}/>`, userSpaceTransform);
  }

  stroke(path?: SvgPath2D) {
    if (path instanceof SvgPath2D) {
      this.emitStroke(path.d, this.matrixAttribute);
    } else if (this.path.length > 0) {
      this.emitStroke(this.path.join(''));
    }
  }

  private emitStroke(d: string, userSpaceTransform?: string) {
    const { color, opacity } = this.paint(this.state.strokeStyle);
    if (color === 'none' || opacity === 0 || this.state.lineWidth <= 0) return;
    // A user-space path keeps its transform, which scales the stroke like canvas does.
    const scale = userSpaceTransform ? 1 : this.scaleFactor;
    const { lineWidth, lineCap, lineJoin, lineDash } = this.state;
    const attributes = [
      'fill="none"',
      `stroke="${color}"`,
      `stroke-width="${round(lineWidth * scale)}"`,
      lineCap !== 'butt' ? `stroke-linecap="${lineCap}"` : '',
      lineJoin !== 'miter' ? `stroke-linejoin="${lineJoin}"` : '',
      lineDash.length > 0 ? `stroke-dasharray="${lineDash.map((dash) => round(dash * scale)).join(' ')}"` : '',
      opacity < 1 ? `stroke-opacity="${round(opacity)}"` : '',
    ].filter(Boolean);
    this.pushElement(`<path d="${d}" ${attributes.join(' ')}/>`, userSpaceTransform);
  }

  private withSeparatePath(draw: () => void) {
    const { path, current, subpathStart } = this;
    this.beginPath();
    draw();
    this.path = path;
    this.current = current;
    this.subpathStart = subpathStart;
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.withSeparatePath(() => {
      this.rect(x, y, width, height);
      this.fill();
    });
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    this.withSeparatePath(() => {
      this.rect(x, y, width, height);
      this.stroke();
    });
  }

  clearRect() {
    // The SVG starts empty, so there is nothing to clear.
  }

  clip() {
    if (this.path.length === 0) return;
    const id = `clip${this.nextId++}`;
    // Clipping the clip path with the previous clip intersects the two, like canvas does.
    this.defs.push(
      `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"${this.clipAttribute()}><path d="${this.path.join('')}"/></clipPath>`,
    );
    this.state.clipId = id;
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    return new SvgLinearGradient(`gradient${this.nextId++}`, this.toDevice(x0, y0), this.toDevice(x1, y1));
  }

  private defineGradient(gradient: SvgLinearGradient) {
    if (gradient.defined) return;
    gradient.defined = true;
    const stops = gradient.stops
      .map(({ offset, color }) => {
        const parsed = parseColor(color);
        return `<stop offset="${offset}" stop-color="${parsed.color}" stop-opacity="${parsed.opacity}"/>`;
      })
      .join('');
    const [[x1, y1], [x2, y2]] = [gradient.from, gradient.to];
    const coordinates = `x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"`;
    this.defs.push(
      `<linearGradient id="${gradient.id}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops}</linearGradient>`,
    );
  }

  createPattern() {
    return null;
  }

  drawImage() {
    // Images are only drawn for textures, which are not supported.
  }

  // --- text --------------------------------------------------------------

  measureText(text: string) {
    const { size } = parseFont(this.state.font);
    return {
      // Snapped to 1/64 px like browser text metrics, so a width survives `width + padding - padding`
      // and the widest label still fits the space measured for it (e.g. heatmap Y labels).
      width: Math.round(this.measureTextWidth(text, this.state.font) * 64) / 64,
      actualBoundingBoxAscent: size * ASCENT,
      actualBoundingBoxDescent: size * DESCENT,
      fontBoundingBoxAscent: size * ASCENT,
      fontBoundingBoxDescent: size * DESCENT,
    };
  }

  fillText(text: string, x: number, y: number) {
    this.emitText(text, x, y, 'fill');
  }

  strokeText(text: string, x: number, y: number) {
    this.emitText(text, x, y, 'stroke');
  }

  /** Not part of the Canvas API (see {@link TextOutlineContext}). */
  textOutline(text: string, font: string, x: number, baselineY: number) {
    return this.outlineFont?.toPath(text, font, x, baselineY);
  }

  /** Paints text outlines from {@link SvgFont.toPath} like `fillText` / `strokeText` paint text. */
  private emitOutline(d: string, mode: 'fill' | 'stroke') {
    if (!d) return;
    const { color, opacity } = this.paint(mode === 'fill' ? this.state.fillStyle : this.state.strokeStyle);
    if (color === 'none' || opacity === 0) return;
    const paint =
      mode === 'fill'
        ? `fill="${color}"${opacity < 1 ? ` fill-opacity="${round(opacity)}"` : ''}`
        : `fill="none" stroke="${color}" stroke-width="${round(this.state.lineWidth)}"${
            opacity < 1 ? ` stroke-opacity="${round(opacity)}"` : ''
          }`;
    this.pushElement(`<path d="${d}" ${paint}/>`, this.matrixAttribute);
  }

  private emitText(text: string, x: number, y: number, mode: 'fill' | 'stroke') {
    const { color, opacity } = this.paint(mode === 'fill' ? this.state.fillStyle : this.state.strokeStyle);
    if (color === 'none' || opacity === 0) return;
    const { size, family, bold, italic } = parseFont(this.state.font);
    const { textAlign, textBaseline, direction, lineWidth } = this.state;
    const isStart = textAlign === 'start' || textAlign === 'left';
    const isEnd = textAlign === 'end' || textAlign === 'right';
    const anchor =
      textAlign === 'center'
        ? 'middle'
        : direction === 'rtl' && (textAlign === 'start' || textAlign === 'end')
          ? isStart
            ? 'end'
            : 'start'
          : isEnd
            ? 'end'
            : 'start';
    const baselineY = y + BASELINE_OFFSETS[textBaseline] * size;
    if (this.outlineFont) {
      const width = this.outlineFont.measure(text, this.state.font);
      const startX = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
      const path = this.outlineFont.toPath(text, this.state.font, startX, baselineY);
      if (path !== undefined) {
        this.emitOutline(path, mode);
        return;
      }
    }
    const opacityName = mode === 'fill' ? 'fill-opacity' : 'stroke-opacity';
    const paintAttributes =
      mode === 'fill' ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="${round(lineWidth)}"`;
    const fontAttributes = [
      `font-family="${escapeXml(family)}"`,
      `font-size="${round(size)}"`,
      bold ? 'font-weight="bold"' : '',
      italic ? 'font-style="italic"' : '',
    ].filter(Boolean);
    const opacityAttribute = opacity < 1 ? ` ${opacityName}="${round(opacity)}"` : '';
    // Canvas keeps leading, trailing and repeated spaces (e.g. the Bullet value before its target); SVG collapses them.
    const spaceAttribute = /^\s|\s$|\s\s/.test(text) ? ' xml:space="preserve"' : '';
    this.pushElement(
      `<text x="${round(x)}" y="${round(baselineY)}" ${fontAttributes.join(' ')} text-anchor="${anchor}" ${paintAttributes}${opacityAttribute}${spaceAttribute}>${escapeXml(text)}</text>`,
      this.matrixAttribute,
    );
  }
}

/**
 * A drawing surface that records what Elastic Charts draws as an SVG document, with no DOM or native canvas.
 *
 * ```ts
 * const svg = new SvgCanvas(720, 360);
 * renderChart({ specs, width: 720, height: 360, context: svg.context, Path2D: svg.Path2D });
 * const markup = svg.toSvg({ background: '#fff' });
 * ```
 * Textures and images are not drawn.
 * @public
 */
export class SvgCanvas {
  /** The canvas context to draw on. */
  readonly context: CanvasRenderingContext2D;
  /** The Path2D implementation this canvas understands. */
  readonly Path2D = SvgPath2D as unknown as typeof Path2D;
  private readonly recorder: SvgRecordingContext;

  constructor(
    readonly width: number,
    readonly height: number,
    { font, measureTextWidth = font?.measure ?? measureHelveticaTextWidth }: SvgCanvasOptions = {},
  ) {
    this.recorder = new SvgRecordingContext(width, height, measureTextWidth, font);
    // The recorder implements the part of the Canvas 2D API that Elastic Charts uses.
    this.context = this.recorder as unknown as CanvasRenderingContext2D;
  }

  /** The recorded drawing as a standalone SVG document. */
  toSvg({ background }: SvgOutputOptions = {}): string {
    const { width, height } = this;
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      this.recorder.defs.length > 0 ? `<defs>${this.recorder.defs.join('')}</defs>` : '',
      background ? `<rect width="${width}" height="${height}" fill="${escapeXml(background)}"/>` : '',
      ...this.recorder.elements,
      '</svg>',
    ]
      .filter(Boolean)
      .join('\n');
  }
}
