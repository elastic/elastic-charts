/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createTableMeasureContext, measureTextWidthFromTable } from './table_measure';

describe('text measured from the Helvetica table', () => {
  it('sums the advances of ASCII characters, scaled by the font size', () => {
    // H 722, e 556, l 222, l 222, o 556
    expect(measureTextWidthFromTable('Hello', '10px sans-serif')).toBeCloseTo(22.78, 5);
    expect(measureTextWidthFromTable('Hello', 'normal normal normal 20px Inter, Helvetica')).toBeCloseTo(45.56, 5);
    expect(measureTextWidthFromTable('', '10px sans-serif')).toBe(0);
  });

  it('widens bold text, by keyword or by numeric weight', () => {
    const regular = measureTextWidthFromTable('Hello', 'normal normal 400 10px sans-serif');
    expect(measureTextWidthFromTable('Hello', 'normal normal bold 10px sans-serif')).toBeCloseTo(regular * 1.07, 5);
    expect(measureTextWidthFromTable('Hello', 'normal normal 600 10px sans-serif')).toBeCloseTo(regular * 1.07, 5);
    // a family named like a weight is not a weight
    expect(measureTextWidthFromTable('Hello', '10px bold')).toBeCloseTo(regular, 5);
  });

  it('gives every other character one default advance', () => {
    expect(measureTextWidthFromTable('é', '10px sans-serif')).toBeCloseTo(5.56, 5);
    expect(measureTextWidthFromTable('日本', '10px sans-serif')).toBeCloseTo(11.12, 5);
    expect(measureTextWidthFromTable('😀', '10px sans-serif')).toBeCloseTo(5.56, 5);
    expect(measureTextWidthFromTable('\n', '10px sans-serif')).toBeCloseTo(5.56, 5);
  });

  it('behaves as a context: the font applies to what is measured and is restored', () => {
    const ctx = createTableMeasureContext();
    ctx.font = '10px sans-serif';
    ctx.save();
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    expect(ctx.measureText('Hello').width).toBeCloseTo(45.56, 5);
    ctx.restore();
    expect(ctx.font).toBe('10px sans-serif');
    expect(ctx.textBaseline).toBe('alphabetic');
    expect(ctx.measureText('Hello').width).toBeCloseTo(22.78, 5);
    expect(ctx.measureText('Hello').actualBoundingBoxAscent).toBeUndefined();
  });
});
