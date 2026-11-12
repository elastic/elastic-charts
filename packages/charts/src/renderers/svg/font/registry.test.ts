/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureWithRegisteredFonts, registerFontFaces } from './registry';
import type { FontFaceMetrics } from './sfnt';

/** a face with one glyph per code point but U+2603, each `advance` units wide, kerning `AV` by -100 */
const face = (names: string[], weight: number, advance: number, coversAll = false): FontFaceMetrics => ({
  names,
  weight,
  italic: false,
  unitsPerEm: 1000,
  ascent: 900,
  descent: 200,
  typoAscent: 800,
  typoDescent: 200,
  capHeight: 700,
  glyphIndex: (codePoint) => (codePoint === 0x2603 && !coversAll ? 0 : codePoint),
  advance: () => advance,
  kerning: (left, right) => (left === 65 && right === 86 ? -100 : 0),
});

describe('measureWithRegisteredFonts', () => {
  beforeAll(() => {
    registerFontFaces([face(['Liberation Sans'], 400, 500), face(['Liberation Sans'], 700, 600)], {
      aliases: ['Arial'],
      generic: 'sans-serif',
    });
    registerFontFaces([face(['Mono'], 400, 1000, true)], { generic: 'monospace' });
  });

  it('measures with the first registered family of the stack, by alias', () => {
    expect(measureWithRegisteredFonts('ab', '10px Inter, Arial, sans-serif', 'alphabetic')?.width).toBe(10);
    expect(measureWithRegisteredFonts('ab', '10px Inter, monospace', 'alphabetic')?.width).toBe(20);
  });

  it('picks the weight as CSS does: 500 and lighter take the regular face, 600 and heavier the bold one', () => {
    expect(measureWithRegisteredFonts('a', 'normal normal 500 10px Arial', 'alphabetic')?.width).toBe(5);
    expect(measureWithRegisteredFonts('a', 'normal normal 600 10px Arial', 'alphabetic')?.width).toBe(6);
    expect(measureWithRegisteredFonts('a', 'bold 10px Arial', 'alphabetic')?.width).toBe(6);
  });

  it('kerns pairs of glyphs, but not across spaces', () => {
    expect(measureWithRegisteredFonts('AV', '10px Arial', 'alphabetic')?.width).toBe(9);
    expect(measureWithRegisteredFonts('A V', '10px Arial', 'alphabetic')?.width).toBe(15);
  });

  it('takes each character from the first face of the stack that has it', () => {
    expect(measureWithRegisteredFonts('a\u2603', '10px Arial, monospace', 'alphabetic')?.width).toBe(15);
  });

  it('places the baselines like Chrome: top and bottom on the typographic em box', () => {
    const ascent = (baseline: CanvasTextBaseline) =>
      measureWithRegisteredFonts('M', '10px Arial', baseline)?.actualBoundingBoxAscent ?? Number.NaN;
    expect(ascent('alphabetic')).toBeCloseTo(7);
    expect(ascent('top')).toBeCloseTo(-1);
    expect(ascent('bottom')).toBeCloseTo(9);
    expect(ascent('middle')).toBeCloseTo(4);
    expect(ascent('hanging')).toBeCloseTo(7 - 9 * 0.8);
    expect(ascent('ideographic')).toBeCloseTo(9);
  });
});
