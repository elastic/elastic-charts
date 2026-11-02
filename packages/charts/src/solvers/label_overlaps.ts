/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Pixels } from '../common/geometry';

/**
 * The screenspace occupied by a label along its axis: the label is anchored at `position`
 * and takes `before` pixels before it and `after` pixels after it, padding included.
 * @internal
 */
export interface LabelSpan {
  position: Pixels;
  before: Pixels;
  after: Pixels;
}

/**
 * A set of labels laid out along an axis (eg. axis tick labels, horizontal or vertical) is represented as
 * the list of their spans, sorted by position. Two labels must be at least `minGap` pixels apart.
 *
 * Returns the smallest cadence that keeps a constant rhythm of visible and hidden labels
 * (one label visible every `cadence` labels, starting from the first one) without overlaps between the visible labels.
 * Returns 1 if no label overlaps, and the number of labels if only the first one can be shown.
 * @internal
 */
export function getLabelsCadence(labels: LabelSpan[], minGap: Pixels = 0): number {
  for (let cadence = 1; cadence < labels.length; cadence++) {
    if (!hasOverlaps(labels, cadence, minGap)) return cadence;
  }
  return Math.max(labels.length, 1);
}

/**
 * Returns a stateful check to call label by label, sorted by position, while laying out an axis.
 * Two labels must be at least `minGap` pixels apart.
 *
 * Starting from the first one, a label is visible if it doesn't overlap with the last visible one.
 * Compared to `getLabelsCadence`, it shows more labels but without a constant rhythm.
 * The label span is passed as separate arguments to avoid allocations on hot paths.
 * @internal
 */
export function createGreedyLabelFitter(
  minGap: Pixels = 0,
): (position: LabelSpan['position'], before: LabelSpan['before'], after: LabelSpan['after']) => boolean {
  let occupiedUntil = -Infinity;
  return (position, before, after) => {
    const visible = fitsAfter(occupiedUntil, position, before, minGap);
    if (visible) occupiedUntil = position + after;
    return visible;
  };
}

function fitsAfter(occupiedUntil: Pixels, position: Pixels, before: Pixels, minGap: Pixels): boolean {
  return position >= occupiedUntil + before + minGap;
}

function hasOverlaps(labels: LabelSpan[], cadence: number, minGap: Pixels): boolean {
  for (let i = 0; i + cadence < labels.length; i += cadence) {
    const current = labels[i];
    const next = labels[i + cadence];
    if (current && next && !fitsAfter(current.position + current.after, next.position, next.before, minGap)) {
      return true;
    }
  }
  return false;
}
