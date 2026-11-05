/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LabelSpan } from './label_overlaps';
import { createGreedyLabelFitter, getLabelsCadence } from './label_overlaps';

/** a label occupying the `[start, end]` interval */
const span = (start: number, end: number): LabelSpan => ({ position: start, before: 0, after: end - start });

const getGreedyLabelsVisibility = (labels: LabelSpan[], minGap?: number) => {
  const labelFits = createGreedyLabelFitter(minGap);
  return labels.map(({ position, before, after }) => labelFits(position, before, after));
};

// only the label at index 2 is wide enough to overlap with the labels at index 3 and 4
const UNEVEN_LABELS: LabelSpan[] = [span(0, 5), span(10, 15), span(20, 45), span(30, 35), span(40, 45), span(50, 55)];

describe('Label overlaps', () => {
  describe('getLabelsCadence', () => {
    it('should return 1 without labels', () => {
      expect(getLabelsCadence([])).toBe(1);
    });

    it('should return 1 with a single label', () => {
      expect(getLabelsCadence([span(0, 100)])).toBe(1);
    });

    it('should return 1 when labels do not overlap', () => {
      expect(getLabelsCadence([span(0, 10), span(10, 20), span(20, 30)])).toBe(1);
    });

    it('should skip labels at a regular interval when they overlap', () => {
      // each label is 25px wide every 10px: one label every 3 fits
      const labels = Array.from({ length: 10 }, (_, i) => span(i * 10, i * 10 + 25));
      expect(getLabelsCadence(labels)).toBe(3);
    });

    it('should consider every visible pair with uneven label widths', () => {
      expect(getLabelsCadence(UNEVEN_LABELS)).toBe(3);
    });

    it('should account for the gap between labels', () => {
      expect(getLabelsCadence([span(0, 10), span(10, 20), span(20, 30)], 5)).toBe(2);
    });

    it('should show only the first label when every label overlaps with all the others', () => {
      const labels = Array.from({ length: 4 }, (_, i) => span(i, 100));
      expect(getLabelsCadence(labels)).toBe(4);
    });
  });

  describe('createGreedyLabelFitter', () => {
    it('should return no visibility without labels', () => {
      expect(getGreedyLabelsVisibility([])).toEqual([]);
    });

    it('should show every label when they do not overlap', () => {
      expect(getGreedyLabelsVisibility([span(0, 10), span(10, 20), span(20, 30)])).toEqual([true, true, true]);
    });

    it('should account for the gap between labels', () => {
      expect(getGreedyLabelsVisibility([span(0, 10), span(10, 20), span(20, 30)], 5)).toEqual([true, false, true]);
    });

    it('should hide the labels overlapping the last visible one', () => {
      const labels = Array.from({ length: 7 }, (_, i) => span(i * 10, i * 10 + 25));
      expect(getGreedyLabelsVisibility(labels)).toEqual([true, false, false, true, false, false, true]);
    });

    it('should resume showing labels after a wide label without a constant rhythm', () => {
      expect(getGreedyLabelsVisibility(UNEVEN_LABELS)).toEqual([true, true, true, false, false, true]);
    });

    it('should show only the first label when every label overlaps with all the others', () => {
      const labels = Array.from({ length: 4 }, (_, i) => span(i, 100));
      expect(getGreedyLabelsVisibility(labels)).toEqual([true, false, false, false]);
    });

    it('should match the XY axis tick labels culling', () => {
      const MIN_LABEL_GAP = 4;
      // the XY axis culling before being moved to `createGreedyLabelFitter`
      const xyVisibility = (ticks: Array<{ position: number; size: number }>) =>
        ticks.reduce(
          (prev, tick) => {
            const requiredSpace = tick.size / 2;
            const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace + MIN_LABEL_GAP;
            prev.visibility.push(tickLabelFits);
            if (tickLabelFits) prev.occupiedSpace = tick.position + requiredSpace;
            return prev;
          },
          { visibility: [] as boolean[], occupiedSpace: -Infinity },
        ).visibility;

      // deterministic pseudo random generator, to produce fractional positions and sizes
      let seed = 42;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };

      for (let run = 0; run < 200; run++) {
        const step = random() * 50;
        const ticks = Array.from({ length: 50 }, (_, i) => ({ position: i * step, size: random() * 120 }));
        const labels = ticks.map(({ position, size }) => ({ position, before: size / 2, after: size / 2 }));
        expect(getGreedyLabelsVisibility(labels, MIN_LABEL_GAP)).toEqual(xyVisibility(ticks));
      }
    });
  });
});
