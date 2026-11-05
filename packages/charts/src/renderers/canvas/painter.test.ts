/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CanvasPainter } from './painter';

class FakePath2D {
  constructor(readonly d: string) {}
}

const fakeContext = () => {
  const canvas = { width: 200, height: 100 };
  const calls: unknown[][] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) =>
      calls.push([name, ...args]);
  const ctx = {
    canvas,
    calls,
    fillStyle: '#000',
    lineWidth: 1,
    save: record('save'),
    restore: record('restore'),
    setTransform: record('setTransform'),
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    fill: record('fill'),
    stroke: record('stroke'),
    translate: record('translate'),
  };
  return ctx;
};

describe('CanvasPainter', () => {
  beforeAll(() => {
    (globalThis as { Path2D?: unknown }).Path2D = FakePath2D;
  });

  it('delegates calls and properties to the context', () => {
    const ctx = fakeContext();
    const painter = new CanvasPainter(ctx as unknown as CanvasRenderingContext2D);
    painter.translate(1, 2);
    painter.fillStyle = 'red';
    painter.lineWidth = 3;
    expect(ctx.calls).toEqual([['translate', 1, 2]]);
    expect(ctx.fillStyle).toBe('red');
    expect(painter.lineWidth).toBe(3);
  });

  it('maps css pixels onto the bitmap at the start of a frame', () => {
    const ctx = fakeContext();
    new CanvasPainter(ctx as unknown as CanvasRenderingContext2D).begin(2);
    expect(ctx.calls).toEqual([['setTransform', 2, 0, 0, 2, 0, 0]]);
  });

  it('clears the whole bitmap under the identity transform and paints a non transparent background', () => {
    const ctx = fakeContext();
    const painter = new CanvasPainter(ctx as unknown as CanvasRenderingContext2D);
    painter.clear('transparent');
    expect(ctx.calls).toEqual([
      ['save'],
      ['setTransform', 1, 0, 0, 1, 0, 0],
      ['clearRect', 0, 0, 200, 100],
      ['restore'],
    ]);
    ctx.calls.length = 0;
    painter.clear('white');
    expect(ctx.calls).toEqual([
      ['save'],
      ['setTransform', 1, 0, 0, 1, 0, 0],
      ['clearRect', 0, 0, 200, 100],
      ['fillRect', 0, 0, 200, 100],
      ['restore'],
    ]);
    expect(ctx.fillStyle).toBe('white');
  });

  it('fills and strokes string paths through Path2D', () => {
    const ctx = fakeContext();
    const painter = new CanvasPainter(ctx as unknown as CanvasRenderingContext2D);
    painter.fillPath('M0,0L1,1', 'evenodd');
    painter.strokePath('M2,2L3,3');
    expect(ctx.calls).toEqual([
      ['fill', new FakePath2D('M0,0L1,1'), 'evenodd'],
      ['stroke', new FakePath2D('M2,2L3,3')],
    ]);
  });
});
