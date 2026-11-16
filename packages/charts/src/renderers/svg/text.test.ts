/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { baselineOffset, textAnchor } from './text';

describe('textAnchor', () => {
  it('maps canvas alignments onto text-anchor, resolving left and right against the direction', () => {
    expect(textAnchor('center', 'ltr')).toBe('middle');
    expect(textAnchor('start', 'rtl')).toBe('start');
    expect(textAnchor('end', 'ltr')).toBe('end');
    expect(textAnchor('left', 'ltr')).toBe('start');
    expect(textAnchor('left', 'rtl')).toBe('end');
    expect(textAnchor('right', 'ltr')).toBe('end');
    expect(textAnchor('right', 'rtl')).toBe('start');
  });
});

describe('baselineOffset', () => {
  // jsdom has no canvas, so the fractions of the font size are used
  it('is zero for the alphabetic baseline', () => {
    expect(baselineOffset('12px Arial', 'alphabetic')).toBe(0);
  });

  it('falls back to fractions of the font size without a measuring canvas', () => {
    expect(baselineOffset('12px Arial', 'middle')).toBe(3.6);
    expect(baselineOffset('normal normal normal 20px sans-serif', 'top')).toBe(15.8);
    expect(baselineOffset('10px x', 'bottom')).toBe(-2.1);
  });
});
