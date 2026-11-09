/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const EPSILON = 1e-6;
const TAU = 2 * Math.PI;
const TAU_EPSILON = TAU - EPSILON;

/**
 * Rounds to a thousandth of a pixel: invisible, and keeps path data and transforms short and stable.
 * @internal
 */
export function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

const finite = (...values: number[]) => values.every((v) => Number.isFinite(v));

/**
 * Builds SVG path data from Canvas2D path calls, following the d3-path algorithm so that canvas
 * semantics are kept: a line connects the current point to an arc's start, a full circle becomes
 * two half arcs, an arc with equal angles only moves to its start point (partition's tapered
 * borders rely on that), and `arcTo` is the canvas tangent construction.
 *
 * Deviations from d3-path that match the canvas spec: a command with a non-finite argument is
 * skipped on its own (an SVG `d` with a NaN would be invalid as a whole), and a negative radius
 * is skipped instead of thrown.
 * @internal
 */
export class SvgPathBuilder {
  private d = '';
  // start of the current subpath
  private x0 = NaN;
  private y0 = NaN;
  // current point, NaN while the path is empty
  private x1 = NaN;
  private y1 = NaN;

  get isEmpty() {
    return this.d === '';
  }

  toString() {
    return this.d;
  }

  reset() {
    this.d = '';
    this.x0 = this.y0 = this.x1 = this.y1 = NaN;
  }

  moveTo(x: number, y: number) {
    if (!finite(x, y)) return;
    this.d += `M${round(x)},${round(y)}`;
    this.x0 = this.x1 = x;
    this.y0 = this.y1 = y;
  }

  closePath() {
    if (Number.isNaN(this.x1)) return;
    this.d += 'Z';
    this.x1 = this.x0;
    this.y1 = this.y0;
  }

  lineTo(x: number, y: number) {
    if (!finite(x, y)) return;
    this.d += `L${round(x)},${round(y)}`;
    this.x1 = x;
    this.y1 = y;
  }

  rect(x: number, y: number, width: number, height: number) {
    if (!finite(x, y, width, height)) return;
    this.d += `M${round(x)},${round(y)}h${round(width)}v${round(height)}h${round(-width)}Z`;
    this.x0 = this.x1 = x;
    this.y0 = this.y1 = y;
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) {
    if (!finite(x1, y1, x2, y2, r) || r < 0) return;
    const x0 = this.x1;
    const y0 = this.y1;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const l01s = x01 * x01 + y01 * y01;

    if (Number.isNaN(this.x1)) {
      // empty path: just move to (x1, y1)
      this.moveTo(x1, y1);
    } else if (!(l01s > EPSILON)) {
      // (x0, y0) coincides with (x1, y1): nothing to draw
    } else if (!(Math.abs(y01 * x21 - y21 * x01) > EPSILON) || !r) {
      // collinear points or zero radius: a straight line to (x1, y1)
      this.lineTo(x1, y1);
    } else {
      const x20 = x2 - x0;
      const y20 = y2 - y0;
      const l21s = x21 * x21 + y21 * y21;
      const l20s = x20 * x20 + y20 * y20;
      const l21 = Math.sqrt(l21s);
      const l01 = Math.sqrt(l01s);
      const l = r * Math.tan((Math.PI - Math.acos((l21s + l01s - l20s) / (2 * l21 * l01))) / 2);
      const t01 = l / l01;
      const t21 = l / l21;
      // line to the start tangent point unless we are already there
      if (Math.abs(t01 - 1) > EPSILON) {
        this.d += `L${round(x1 + t01 * x01)},${round(y1 + t01 * y01)}`;
      }
      this.x1 = x1 + t21 * x21;
      this.y1 = y1 + t21 * y21;
      this.d += `A${round(r)},${round(r)},0,0,${+(y01 * x20 > x01 * y20)},${round(this.x1)},${round(this.y1)}`;
    }
  }

  arc(x: number, y: number, r: number, a0: number, a1: number, ccw = false) {
    if (!finite(x, y, r, a0, a1) || r < 0) return;
    const dx = r * Math.cos(a0);
    const dy = r * Math.sin(a0);
    const x0 = x + dx;
    const y0 = y + dy;
    const cw = ccw ? 0 : 1;
    let da = ccw ? a0 - a1 : a1 - a0;

    if (Number.isNaN(this.x1)) {
      // empty path: move to the arc start
      this.moveTo(x0, y0);
    } else if (Math.abs(this.x1 - x0) > EPSILON || Math.abs(this.y1 - y0) > EPSILON) {
      // the current point is not the arc start: connect with a line
      this.lineTo(x0, y0);
    }

    // a zero radius arc is just that point
    if (!r) return;

    // angle going the wrong way: flip the direction
    if (da < 0) da = (da % TAU) + TAU;

    if (da > TAU_EPSILON) {
      // a complete circle: two half arcs, since one SVG arc cannot end where it starts
      this.d += `A${round(r)},${round(r)},0,1,${cw},${round(x - dx)},${round(y - dy)}`;
      this.d += `A${round(r)},${round(r)},0,1,${cw},${round(x0)},${round(y0)}`;
      this.x1 = x0;
      this.y1 = y0;
    } else if (da > EPSILON) {
      this.x1 = x + r * Math.cos(a1);
      this.y1 = y + r * Math.sin(a1);
      this.d += `A${round(r)},${round(r)},0,${+(da >= Math.PI)},${cw},${round(this.x1)},${round(this.y1)}`;
    }
  }
}
