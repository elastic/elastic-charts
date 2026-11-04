/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureHelveticaTextWidth, parseFont } from './svg_canvas';
import type { SvgFont } from './svg_canvas';

/**
 * One weight of a font: advance widths and outlines per character, in font units with y up.
 * Outlines are SVG path data with absolute commands.
 * @public
 */
export interface GlyphFontFace {
  weight: number;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  glyphs: Record<string, [advance: number, path: string]>;
}

/**
 * Glyph data of a font family, e.g. extracted from the font files the browser uses.
 * @public
 */
export interface GlyphFontData {
  family: string;
  faces: GlyphFontFace[];
}

const COMMAND_ARGUMENTS: Record<string, number> = { M: 2, L: 2, T: 2, Q: 4, S: 4, C: 6, H: 1, V: 1, Z: 0 };
const TOKEN = /[A-Za-z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g;

const round = (value: number) => Number(value.toFixed(2));

/** Moves and scales absolute path data from font units (y up) to pixels (y down). */
const transformPath = (path: string, scale: number, dx: number, dy: number) => {
  const out: string[] = [];
  let command = '';
  let index = 0;
  for (const token of path.match(TOKEN) ?? []) {
    if (/[A-Za-z]/.test(token)) {
      command = token.toUpperCase();
      index = 0;
      out.push(command);
      continue;
    }
    const value = Number(token);
    // H takes x values and V takes y values; every other command alternates x and y.
    const isX = command === 'H' || (command !== 'V' && index % 2 === 0);
    out.push(String(round(isX ? dx + value * scale : dy - value * scale)));
    index = (index + 1) % Math.max(COMMAND_ARGUMENTS[command] ?? 2, 1);
  }
  return out.join(' ');
};

const hasGlyphs = (face: GlyphFontFace, text: string) => [...text].every((char) => char in face.glyphs);

/**
 * Creates an {@link SvgFont} from glyph data, so text is measured with the real font metrics and
 * drawn as outlines that look the same whatever fonts the SVG rasterizer has. The nearest weight
 * is used; text with characters the font lacks is measured with Helvetica metrics and drawn as text.
 * Kerning is not applied.
 * @public
 */
export function createGlyphFont({ family, faces }: GlyphFontData): SvgFont {
  const sorted = [...faces].sort((a, b) => a.weight - b.weight);
  const getFace = (weight: number) =>
    sorted.reduce((best, face) => (Math.abs(face.weight - weight) < Math.abs(best.weight - weight) ? face : best));

  return {
    family,
    measure: (text, font) => {
      const { size, weight } = parseFont(font);
      const face = getFace(weight);
      if (!hasGlyphs(face, text)) return measureHelveticaTextWidth(text, font);
      let units = 0;
      for (const char of text) units += face.glyphs[char]?.[0] ?? 0;
      return (units / face.unitsPerEm) * size;
    },
    toPath: (text, font, x, baselineY) => {
      const { size, weight } = parseFont(font);
      const face = getFace(weight);
      if (!hasGlyphs(face, text)) return undefined;
      const scale = size / face.unitsPerEm;
      let penX = x;
      const parts: string[] = [];
      for (const char of text) {
        const [advance, path] = face.glyphs[char] ?? [0, ''];
        if (path) parts.push(transformPath(path, scale, penX, baselineY));
        penX += advance * scale;
      }
      return parts.join(' ');
    },
  };
}
