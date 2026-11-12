/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { MeasureContext } from './measure';

// Helvetica advance widths per 1000 em for ASCII 32..126 (standard AFM metrics)
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
  722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556,
  556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
  260, 334, 584,
];
/** the advance of anything outside the table, which is every character that is not printable ASCII */
const DEFAULT_GLYPH_WIDTH = 556;
/** Helvetica Bold runs about this much wider than the regular face */
const BOLD_WIDTH_FACTOR = 1.07;

const FONT_SIZE_RE = /(\d*\.?\d+)px/;
// the weight precedes the size in a CSS font shorthand
const BOLD_RE = /\b(bold|bolder|[5-9]00)\b(?=.*\dpx)/;

/**
 * Width of a text in CSS pixels for a CSS font shorthand, from Helvetica's advance widths.
 * It ignores the font family: whatever the font, the text is measured as Helvetica of that size.
 * @internal
 */
export function measureTextWidthFromTable(text: string, font: string): number {
  const fontSize = Number(FONT_SIZE_RE.exec(font)?.[1] ?? 10);
  let units = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    units += HELVETICA_WIDTHS[code - 32] ?? DEFAULT_GLYPH_WIDTH;
  }
  return (units / 1000) * fontSize * (BOLD_RE.test(font) ? BOLD_WIDTH_FACTOR : 1);
}

/**
 * A measuring context that needs no canvas and no DOM: widths come from a table of Helvetica
 * advances. Close to a browser for ASCII text in a Helvetica-like font, approximate otherwise.
 * It reports no vertical metrics, so baselines fall back to fixed fractions of the font size.
 * @internal
 */
export function createTableMeasureContext(): MeasureContext {
  const saved: Array<Pick<MeasureContext, 'font' | 'textBaseline'>> = [];
  return {
    font: '10px sans-serif',
    textBaseline: 'alphabetic',
    save() {
      saved.push({ font: this.font, textBaseline: this.textBaseline });
    },
    restore() {
      Object.assign(this, saved.pop());
    },
    measureText(text) {
      return { width: measureTextWidthFromTable(text, this.font) };
    },
  };
}
