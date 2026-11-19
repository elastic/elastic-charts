/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createTableMeasureContext, measureTextWidthFromTable } from './table_measure';

describe('text measured from the Inter tables', () => {
  it('sums the advances of ASCII characters, scaled by the font size', () => {
    // Regular: H 740, e 582, l 237, l 237, o 597
    expect(measureTextWidthFromTable('Hello', '10px sans-serif')).toBeCloseTo(23.93, 5);
    expect(measureTextWidthFromTable('Hello', 'normal normal normal 20px Inter, Helvetica')).toBeCloseTo(47.86, 5);
    expect(measureTextWidthFromTable('', '10px sans-serif')).toBe(0);
  });

  it('measures at the weight of the font, between and beyond the Regular and Bold faces', () => {
    const at = (weight: string | number) => measureTextWidthFromTable('Hello', `normal normal ${weight} 10px Inter`);
    // Bold: H 746, e 598, l 272, l 272, o 614
    expect(at('bold')).toBeCloseTo(25.02, 5);
    expect(at(700)).toBeCloseTo(25.02, 5);
    expect(at(400)).toBeCloseTo(23.93, 5);
    // a third of the way from Regular to Bold, and two thirds past Bold
    expect(at(500)).toBeCloseTo(23.93 + (25.02 - 23.93) / 3, 5);
    expect(at(900)).toBeCloseTo(23.93 + ((25.02 - 23.93) * 5) / 3, 5);
    // lighter faces are measured as Regular
    expect(at(300)).toBeCloseTo(23.93, 5);
    // a family named like a weight is not a weight, and neither is a font size
    expect(measureTextWidthFromTable('Hello', '10px bold')).toBeCloseTo(23.93, 5);
    expect(measureTextWidthFromTable('Hello', '700px Inter')).toBeCloseTo(23.93 * 70, 5);
  });

  it('gives every other character one default advance', () => {
    expect(measureTextWidthFromTable('é', '10px sans-serif')).toBeCloseTo(6.03, 5);
    expect(measureTextWidthFromTable('日本', '10px sans-serif')).toBeCloseTo(12.06, 5);
    expect(measureTextWidthFromTable('😀', '10px sans-serif')).toBeCloseTo(6.03, 5);
    expect(measureTextWidthFromTable('\n', '10px sans-serif')).toBeCloseTo(6.03, 5);
    expect(measureTextWidthFromTable('é', 'bold 10px sans-serif')).toBeCloseTo(6.32, 5);
  });

  it('behaves as a context: the font applies to what is measured and is restored', () => {
    const ctx = createTableMeasureContext();
    ctx.font = '10px sans-serif';
    ctx.save();
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    expect(ctx.measureText('Hello').width).toBeCloseTo(47.86, 5);
    ctx.restore();
    expect(ctx.font).toBe('10px sans-serif');
    expect(ctx.textBaseline).toBe('alphabetic');
    expect(ctx.measureText('Hello').width).toBeCloseTo(23.93, 5);
    expect(ctx.measureText('Hello').actualBoundingBoxAscent).toBeUndefined();
  });
});
