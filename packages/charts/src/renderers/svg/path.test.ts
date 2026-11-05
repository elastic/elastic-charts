/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SvgPathBuilder } from './path';

const d = (build: (p: SvgPathBuilder) => void) => {
  const p = new SvgPathBuilder();
  build(p);
  return p.toString();
};

describe('SvgPathBuilder', () => {
  it('emits a rect as a closed relative subpath', () => {
    expect(d((p) => p.rect(1, 2, 3, 4))).toBe('M1,2h3v4h-3Z');
  });

  it('draws a full circle as two half arcs', () => {
    expect(d((p) => p.arc(0, 0, 10, 0, 2 * Math.PI))).toBe('M10,0A10,10,0,1,1,-10,0A10,10,0,1,1,10,0');
  });

  it('connects the current point to the arc start with a line', () => {
    expect(d((p) => (p.moveTo(0, 0), p.arc(0, 0, 10, 0, Math.PI / 2)))).toBe('M0,0L10,0A10,10,0,0,1,0,10');
  });

  it('uses sweep flag 0 for counterclockwise arcs and the large arc flag past half a turn', () => {
    expect(d((p) => p.arc(0, 0, 10, 0, Math.PI / 2, true))).toBe('M10,0A10,10,0,1,0,0,10');
    expect(d((p) => p.arc(0, 0, 10, 0, (3 * Math.PI) / 2))).toBe('M10,0A10,10,0,1,1,0,-10');
  });

  it('treats an arc with equal angles as a move to its start point, like canvas', () => {
    expect(d((p) => p.arc(0, 0, 10, 1, 1))).toBe('M5.403,8.415');
    expect(d((p) => (p.moveTo(0, 0), p.arc(0, 0, 10, 1, 1)))).toBe('M0,0L5.403,8.415');
  });

  it('skips a zero radius arc after the connecting line and a negative radius entirely', () => {
    expect(d((p) => (p.moveTo(0, 0), p.arc(5, 5, 0, 0, 1)))).toBe('M0,0L5,5');
    expect(d((p) => (p.moveTo(0, 0), p.arc(5, 5, -1, 0, 1)))).toBe('M0,0');
  });

  it('builds the canvas tangent arc for arcTo', () => {
    expect(d((p) => (p.moveTo(0, 10), p.arcTo(0, 0, 10, 0, 5)))).toBe('M0,10L0,5A5,5,0,0,1,5,0');
  });

  it('skips a command with a non finite argument but keeps the rest of the path', () => {
    expect(d((p) => (p.moveTo(0, 0), p.lineTo(NaN, 1), p.lineTo(Infinity, 1), p.lineTo(5, 5)))).toBe('M0,0L5,5');
  });

  it('closes a subpath and continues from its start', () => {
    expect(d((p) => (p.moveTo(1, 1), p.lineTo(5, 5), p.closePath(), p.lineTo(2, 2)))).toBe('M1,1L5,5ZL2,2');
  });

  it('rounds to a thousandth', () => {
    expect(d((p) => (p.moveTo(1 / 3, 2 / 3), p.lineTo(1e-4, 1)))).toBe('M0.333,0.667L0,1');
  });
});
