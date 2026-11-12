/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { measureWithRegisteredFonts } from './font/registry';
import { isServerSide } from '../../utils/common';
import type { Ctx2d } from '../painter';

/**
 * The part of a 2D context that text measurement needs.
 * @internal
 */
export type MeasureContext = Pick<Ctx2d, 'save' | 'restore' | 'measureText' | 'font' | 'textBaseline'>;

let measureContext: MeasureContext | null | undefined;

/**
 * One shared offscreen canvas context for text measurement, so the SVG backend measures text
 * exactly like the layout code does on canvas and both renderers lay out identically.
 * On the server it measures with the fonts given to `registerFont`, or estimates from average glyph
 * proportions without any; `null` where a DOM exists without canvas support (jsdom).
 * @internal
 */
export function getMeasureContext(): MeasureContext | null {
  if (measureContext === undefined) {
    measureContext = isServerSide()
      ? serverMeasureContext()
      : document.createElement('canvas').getContext('2d') ?? null;
  }
  return measureContext;
}

const FONT_SIZE_RE = /(\d*\.?\d+)px/;
const BOLD_RE = /\b(bold|bolder|[6-9]00)\b/;

/** glyph advance in em of a typical UI sans-serif, by character class */
function glyphWidth(char: string): number {
  if (/[!',.:;Iijl|]/.test(char)) return 0.28;
  if (char === ' ') return 0.27;
  if (/[()/[\\\]frt{}\-]/.test(char)) return 0.38;
  if (/[%@MWmw]/.test(char)) return 0.86;
  if (/\d/.test(char)) return 0.58;
  if (/[A-Z]/.test(char)) return 0.66;
  return 0.54;
}

function serverMeasureContext(): MeasureContext {
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
      const measured = measureWithRegisteredFonts(text, this.font, this.textBaseline);
      if (measured) return measured;
      const fontSize = Number(FONT_SIZE_RE.exec(this.font)?.[1] ?? 10);
      const weight = BOLD_RE.test(this.font) ? 1.06 : 1;
      let em = 0;
      for (const char of text) em += glyphWidth(char);
      return { width: em * fontSize * weight };
    },
  };
}
