/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMeasureContext } from './measure';
import { round } from './path';

/**
 * Canvas `textAlign` to SVG `text-anchor`. `left` and `right` are absolute on canvas but
 * `start`/`end` follow the writing direction in SVG, hence the direction argument.
 * @internal
 */
export function textAnchor(align: CanvasTextAlign, direction: 'ltr' | 'rtl'): 'start' | 'middle' | 'end' {
  switch (align) {
    case 'center':
      return 'middle';
    case 'left':
      return direction === 'rtl' ? 'end' : 'start';
    case 'right':
      return direction === 'rtl' ? 'start' : 'end';
    case 'end':
      return 'end';
    case 'start':
    default:
      return 'start';
  }
}

/**
 * Fractions of the font size used when no canvas is available to measure the font
 * (the same constants Vega uses across its renderers).
 */
const FALLBACK_BASELINE_FRACTION: Record<CanvasTextBaseline, number> = {
  alphabetic: 0,
  top: 0.79,
  hanging: 0.63,
  middle: 0.3,
  ideographic: -0.21,
  bottom: -0.21,
};

const baselineOffsetCache = new Map<string, number>();

// a web font finishing to load changes the metrics of any text measured before
if (typeof document !== 'undefined' && document.fonts?.addEventListener) {
  document.fonts.addEventListener('loadingdone', () => baselineOffsetCache.clear());
}

const FONT_SIZE_RE = /(\d*\.?\d+)px/;

/**
 * Vertical offset, in user units, from the alphabetic baseline to the line canvas would use for
 * the given `textBaseline`. SVG text is always anchored on the alphabetic baseline and shifted
 * by this `dy`, instead of relying on `dominant-baseline`, whose keywords mean different things
 * than canvas's and vary across engines.
 *
 * Measured rather than tabulated: the same glyph is measured with the requested baseline and
 * with `alphabetic`; the difference of the two ascents is exactly the offset the canvas applies
 * for that font, in whichever browser runs this.
 * @internal
 */
export function baselineOffset(font: string, baseline: CanvasTextBaseline): number {
  if (baseline === 'alphabetic') return 0;
  const key = `${baseline}|${font}`;
  const cached = baselineOffsetCache.get(key);
  if (cached !== undefined) return cached;

  const ctx = getMeasureContext();
  let offset: number | undefined;
  if (ctx) {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'alphabetic';
    const alphabetic = ctx.measureText('M');
    ctx.textBaseline = baseline;
    const requested = ctx.measureText('M');
    ctx.restore();
    if (
      typeof alphabetic.actualBoundingBoxAscent === 'number' &&
      typeof requested.actualBoundingBoxAscent === 'number'
    ) {
      offset = round(alphabetic.actualBoundingBoxAscent - requested.actualBoundingBoxAscent);
    }
  }
  if (offset === undefined) {
    const fontSize = Number(FONT_SIZE_RE.exec(font)?.[1] ?? 10);
    offset = round(FALLBACK_BASELINE_FRACTION[baseline] * fontSize);
  }
  baselineOffsetCache.set(key, offset);
  return offset;
}
