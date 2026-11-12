/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { FontFaceMetrics } from './sfnt';
import { parseFontFile } from './sfnt';
import type { TextMeasurement } from '../../painter';

/** @public */
export type GenericFontFamily = 'sans-serif' | 'serif' | 'monospace';

/** @public */
export interface RegisterFontOptions {
  /**
   * More family names that resolve to this font, as fontconfig aliases do on Linux: a metric
   * compatible font registered for `Helvetica` and `Arial` measures text the way Chrome does there.
   */
  aliases?: string[];
  /** the generic family this font stands for, used when no family of a font stack is registered */
  generic?: GenericFontFamily;
}

interface RegisteredFace {
  face: FontFaceMetrics;
  families: Set<string>;
}

const faces: RegisteredFace[] = [];
const generics = new Map<string, RegisteredFace[]>();
const listeners = new Set<() => void>();

const GENERIC_ALIASES: Record<string, GenericFontFamily> = {
  'sans-serif': 'sans-serif',
  'system-ui': 'sans-serif',
  'ui-sans-serif': 'sans-serif',
  '-apple-system': 'sans-serif',
  serif: 'serif',
  'ui-serif': 'serif',
  monospace: 'monospace',
  'ui-monospace': 'monospace',
};

/**
 * Registers a font file (`.ttf`, `.otf` or `.ttc`) for measuring text when charts are rendered
 * without a DOM. Text is then measured with the font's own glyph advances and kerning, picking the
 * face from the CSS font stack as browsers do, instead of an estimate. Returns the family names read
 * from the file.
 * @public
 */
export function registerFont(data: ArrayBuffer | ArrayBufferView, options: RegisterFontOptions = {}): string[] {
  return registerFontFaces(parseFontFile(data), options);
}

/**
 * Registers faces already read from a font file.
 * @internal
 */
export function registerFontFaces(parsed: FontFaceMetrics[], options: RegisterFontOptions = {}): string[] {
  for (const face of parsed) {
    const families = new Set([...face.names, ...(options.aliases ?? [])].map((name) => name.toLowerCase()));
    const registered = { face, families };
    faces.push(registered);
    if (options.generic) generics.set(options.generic, [...(generics.get(options.generic) ?? []), registered]);
  }
  listeners.forEach((listener) => listener());
  return [...new Set(parsed.flatMap(({ names }) => names))];
}

/** @internal */
export const hasRegisteredFonts = () => faces.length > 0;

/**
 * Calls back when a font is registered, so caches of measured text can be cleared.
 * @internal
 */
export const onFontRegistered = (listener: () => void) => listeners.add(listener);

interface ParsedFont {
  size: number;
  weight: number;
  italic: boolean;
  families: string[];
}

const FONT_RE = /^(.*?)(\d*\.?\d+)px(?:\s*\/\s*\S+)?\s+(.+)$/;

function parseFont(font: string): ParsedFont {
  const [, prefix = '', size = '10', families = 'sans-serif'] = FONT_RE.exec(font.trim()) ?? [];
  let weight = 400;
  let italic = false;
  for (const token of prefix.toLowerCase().split(/\s+/)) {
    if (token === 'bold' || token === 'bolder') weight = 700;
    else if (token === 'lighter') weight = 300;
    else if (/^\d{3}$/.test(token)) weight = Number(token);
    else if (token === 'italic' || token === 'oblique') italic = true;
  }
  return {
    size: Number(size),
    weight,
    italic,
    families: families.split(',').map((family) =>
      family
        .trim()
        .replaceAll(/^["']|["']$/g, '')
        .toLowerCase(),
    ),
  };
}

/** CSS font matching: the style first, then the closest weight in the direction the CSS rules prefer */
function pickFace(candidates: RegisteredFace[], weight: number, italic: boolean): RegisteredFace | undefined {
  const styled = candidates.filter(({ face }) => face.italic === italic);
  const pool = styled.length > 0 ? styled : candidates;
  const distance = ({ face: { weight: w } }: RegisteredFace) => {
    if (weight >= 400 && weight <= 500) {
      // up to 500 first, then lighter, then heavier
      if (w >= weight && w <= 500) return w - weight;
      return w < weight ? 1000 + weight - w : 2000 + w - weight;
    }
    if (weight < 400) return w <= weight ? weight - w : 1000 + w - weight;
    return w >= weight ? w - weight : 1000 + weight - w;
  };
  return pool.reduce<RegisteredFace | undefined>(
    (best, candidate) => (!best || distance(candidate) < distance(best) ? candidate : best),
    undefined,
  );
}

const resolved = new Map<string, FontFaceMetrics[]>();
onFontRegistered(() => resolved.clear());

/** the faces a font stack resolves to, in fallback order, ending with the sans-serif ones */
function resolveFaces({ families, weight, italic }: ParsedFont): FontFaceMetrics[] {
  const key = `${weight}|${italic}|${families.join(',')}`;
  const cached = resolved.get(key);
  if (cached) return cached;
  const chain: FontFaceMetrics[] = [];
  const add = (candidates: RegisteredFace[]) => {
    const picked = pickFace(candidates, weight, italic);
    if (picked && !chain.includes(picked.face)) chain.push(picked.face);
  };
  for (const family of families) {
    const generic = GENERIC_ALIASES[family];
    add(generic ? generics.get(generic) ?? [] : faces.filter(({ families: names }) => names.has(family)));
  }
  add(generics.get('sans-serif') ?? []);
  add(faces);
  resolved.set(key, chain);
  return chain;
}

/**
 * Where canvas puts each `textBaseline` above the alphabetic one, in pixels, as Chrome does: `top`,
 * `middle` and `bottom` on the em box split by the typographic ascender and descender, `hanging` and
 * `ideographic` from the rounded font ascent and descent.
 */
function baselineShift(face: FontFaceMetrics, baseline: CanvasTextBaseline, size: number): number {
  const emAscent = (face.typoAscent / (face.typoAscent + face.typoDescent)) * size;
  switch (baseline) {
    case 'top':
      return emAscent;
    case 'middle':
      return emAscent - size / 2;
    case 'bottom':
      return emAscent - size;
    case 'hanging':
      return Math.round((face.ascent / face.unitsPerEm) * size) * 0.8;
    case 'ideographic':
      return -Math.round((face.descent / face.unitsPerEm) * size);
    default:
      return 0;
  }
}

/**
 * Measures text with the registered fonts, as `CanvasRenderingContext2D.measureText` does with the
 * same font: glyph advances plus pair kerning, each character from the first face of the stack that
 * has it. `undefined` when no font is registered.
 * @internal
 */
export function measureWithRegisteredFonts(
  text: string,
  font: string,
  textBaseline: CanvasTextBaseline,
): TextMeasurement | undefined {
  if (faces.length === 0) return undefined;
  const parsed = parseFont(font);
  const chain = resolveFaces(parsed);
  const [primary] = chain;
  if (!primary) return undefined;

  let units = 0;
  let previous: { face: FontFaceMetrics; glyph: number } | undefined;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    const face = chain.find((candidate) => candidate.glyphIndex(codePoint) !== 0) ?? primary;
    const glyph = face.glyphIndex(codePoint);
    if (char === ' ') previous = undefined;
    let advance = face.advance(glyph) / face.unitsPerEm;
    if (previous?.face === face) advance += face.kerning(previous.glyph, glyph) / face.unitsPerEm;
    units += advance;
    // Chrome shapes word by word, so nothing kerns with a space
    previous = char === ' ' ? undefined : { face, glyph };
  }

  const { size } = parsed;
  const em = (value: number) => (value / primary.unitsPerEm) * size;
  const shift = baselineShift(primary, textBaseline, size);
  return {
    width: units * size,
    actualBoundingBoxAscent: em(primary.capHeight) - shift,
    actualBoundingBoxDescent: shift,
    fontBoundingBoxAscent: em(primary.ascent) - shift,
    fontBoundingBoxDescent: em(primary.descent) + shift,
  };
}
