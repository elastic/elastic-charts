/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { MeasureContext } from './measure';

// Advance widths of Inter, the first font of the default theme, per 1000 em for ASCII 32..126, in its Regular
// (400) and Bold (700) faces. The advances of every weight from 400 to 900 lie on the line through these two.
const INTER_REGULAR = [
  281, 278, 403, 631, 638, 812, 639, 222, 362, 362, 500, 659, 280, 460, 276, 357, 625, 464, 605, 636, 642, 608, 624,
  571, 616, 624, 276, 280, 659, 659, 659, 507, 936, 676, 651, 727, 719, 598, 587, 743, 740, 264, 543, 652, 562, 889,
  753, 761, 635, 761, 639, 638, 642, 741, 676, 949, 642, 665, 625, 362, 357, 362, 469, 452, 497, 564, 621, 558, 621,
  582, 361, 609, 591, 237, 237, 544, 237, 869, 585, 597, 609, 609, 372, 523, 364, 581, 557, 812, 540, 557, 541, 362,
  327, 362, 659,
];
const INTER_BOLD = [
  232, 325, 392, 650, 655, 859, 674, 209, 409, 409, 565, 680, 303, 469, 298, 390, 688, 489, 630, 659, 678, 645, 660,
  595, 661, 660, 298, 303, 680, 680, 680, 562, 1031, 748, 661, 752, 727, 613, 585, 761, 746, 281, 570, 690, 567, 915,
  735, 782, 648, 783, 656, 655, 668, 729, 748, 1036, 714, 724, 667, 409, 390, 409, 488, 477, 497, 580, 635, 587, 635,
  598, 386, 633, 624, 272, 272, 582, 272, 912, 622, 614, 632, 632, 409, 562, 388, 622, 586, 850, 574, 586, 572, 409,
  374, 409, 680,
];
/** the advance of anything outside the tables, which is every character that is not printable ASCII */
const DEFAULT_REGULAR = 603;
const DEFAULT_BOLD = 632;

const FONT_SIZE_RE = /(\d*\.?\d+)px/;
const WEIGHT_RE = /\b(bold|bolder|\d{3,4})\b/;

/**
 * Width of a text in CSS pixels for a CSS font shorthand, from Inter's advance widths at the weight of the font.
 * It ignores the font family: whatever the font, the text is measured as Inter of that size and weight.
 * Kerning is left out, so a text comes out up to a few percent wider than a browser draws it, or a fraction of
 * a percent narrower.
 * @internal
 */
export function measureTextWidthFromTable(text: string, font: string): number {
  const size = FONT_SIZE_RE.exec(font);
  const fontSize = Number(size?.[1] ?? 10);
  // the weight precedes the size in a CSS font shorthand; what follows it, the size included, can look like one
  const [, weight = '400'] = WEIGHT_RE.exec(font.slice(0, size?.index ?? 0)) ?? [];
  // faces lighter than Regular are a little narrower; measuring them as Regular errs on the side of room
  const bolder = Math.max(0, ((Number(weight) || 700) - 400) / 300);
  let units = 0;
  for (const char of text) {
    const index = (char.codePointAt(0) ?? 0) - 32;
    const regular = INTER_REGULAR[index] ?? DEFAULT_REGULAR;
    units += regular + ((INTER_BOLD[index] ?? DEFAULT_BOLD) - regular) * bolder;
  }
  return (units / 1000) * fontSize;
}

/**
 * A measuring context that needs no canvas and no DOM: widths come from tables of Inter's
 * advances. Close to a browser for ASCII text drawn in Inter, approximate otherwise.
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
