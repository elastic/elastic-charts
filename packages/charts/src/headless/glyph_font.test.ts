/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createGlyphFont, measureHelveticaTextWidth, SvgCanvas } from '.';

// Two 1000-unit faces: a square "A" and a 500-unit "i" bar, at weights 400 and 700.
const face = (weight: number, advance: number) => ({
  weight,
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  glyphs: {
    A: [advance, 'M0 0H600V700H0Z'] as [number, string],
    i: [500, 'M100 0 100 500 200 500 200 0Z'] as [number, string],
    ' ': [250, ''] as [number, string],
  },
});
const font = createGlyphFont({ family: 'Test', faces: [face(400, 600), face(700, 800)] });

describe('createGlyphFont', () => {
  it('measures with the nearest weight', () => {
    expect(font.measure('Ai', '10px Test')).toBe(11);
    expect(font.measure('Ai', 'bold 10px Test')).toBe(13);
    expect(font.measure('Ai', '600 10px Test')).toBe(13);
  });

  it('falls back to Helvetica metrics for characters it lacks', () => {
    expect(font.measure('Az', '10px Test')).toBe(measureHelveticaTextWidth('Az', '10px Test'));
    expect(font.toPath('Az', '10px Test', 0, 0)).toBeUndefined();
  });

  it('scales, flips and advances glyph outlines', () => {
    expect(font.toPath('A i', '10px Test', 5, 20)).toBe('M 5 20 H 11 V 13 H 5 Z M 14.5 20 14.5 15 15.5 15 15.5 20 Z');
  });

  it('makes SvgCanvas draw text as paths aligned like canvas text', () => {
    const svg = new SvgCanvas(100, 50, { font });
    const ctx = svg.context;
    ctx.font = '10px Test';
    ctx.fillStyle = '#123456';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('A', 50, 20);
    expect(ctx.measureText('AA').width).toBe(12);
    const markup = svg.toSvg();
    expect(markup).toContain('d="M 44 20 H 50 V 13 H 44 Z" fill="#123456"/>');
    expect(markup).not.toContain('<text');
  });

  it('keeps drawing SVG text for characters the font lacks', () => {
    const svg = new SvgCanvas(100, 50, { font });
    svg.context.font = '10px Test';
    svg.context.fillText('Az', 0, 20);
    expect(svg.toSvg()).toContain('>Az</text>');
  });
});
