/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getXAxisSize, getYAxisHorizontalUsedSpace, getYAxisTickCadence } from './axis';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad } from '../../../../utils/common';
import { horizontalPad, pad } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { HeatmapStyle } from '../../../../utils/themes/theme';

const CHAR_WIDTH = 7;
const textMeasure: TextMeasure = (text, _font, fontSize) => ({ width: text.length * CHAR_WIDTH, height: fontSize });
const formatter = (value: string | number) => `${value}`;
const getLabels = (count: number) => Array.from({ length: count }, (_, i) => `Label-${String(i).padStart(2, '0')}`);
const getXStyle = (rotation = 0): HeatmapStyle['xAxisLabel'] => ({ ...LIGHT_THEME.heatmap.xAxisLabel, rotation });
const RANGE_STEP = 0.25;
const rangeFormatter = (value: string | number) => `${value} – ${Number(value) + RANGE_STEP}`;
const getRangeLabels = (count: number) => Array.from({ length: count }, (_, i) => i * RANGE_STEP);
const getMaxLabelWidth = (labels: (string | number)[], format: (value: string | number) => string) =>
  Math.max(...labels.map((label) => format(label).length * CHAR_WIDTH));

/** height of an unrotated label: measured font size, top padding, and the rotation origin */
const unrotatedAxisHeight = (style: HeatmapStyle['xAxisLabel']) =>
  style.fontSize + pad(style.padding, 'top') + style.fontSize / 2;

/** fields the heatmap view reads when placing and rotating x labels */
const expectRenderedAxis = (
  size: { left: number; height: number; tickCadence: number; minRotation: number },
  minRotation: number,
  height = unrotatedAxisHeight(getXStyle()),
) => {
  expect(Number.isFinite(size.left)).toBe(true);
  expect(size.left).toBeGreaterThanOrEqual(0);
  expect(size.height).toBeCloseTo(height);
  expect(Number.isFinite(size.tickCadence)).toBe(true);
  expect(size.minRotation).toBeCloseTo(minRotation);
};

describe('Heatmap axis', () => {
  describe('getXAxisSize with a categorical scale', () => {
    it('should render every label when they fit', () => {
      const labels = getLabels(3);
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 600, [0, 0], false);
      expect(size.tickCadence).toBe(1);
      expectRenderedAxis(size, 0);
    });

    it('should skip labels at a regular interval when they would overlap', () => {
      const style = getXStyle();
      const labels = getLabels(50);
      const size = getXAxisSize(true, style, formatter, labels, textMeasure, 400, [0, 0], false);
      expect(size.tickCadence).toBeGreaterThan(1);
      expect(size.tickCadence).toBeLessThan(labels.length);
      expectRenderedAxis(size, 0);
      // the distance between two rendered labels must fit the label width and its padding
      const labelWidth = (labels[0]?.length ?? 0) * CHAR_WIDTH + horizontalPad(style.padding);
      expect((size.width / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(labelWidth);
    });

    it('should keep a non-overlapping label that sets the right bound', () => {
      const labels = ['A', 'B'.repeat(20)];
      const containerWidth = 200;
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, containerWidth, [0, 0], false);
      // the long label compresses the scale from the right and still fits beside the short one
      expect(size.tickCadence).toBe(1);
      expect(size.width).toBeLessThan(containerWidth);
      expectRenderedAxis(size, 0);
    });

    it('should thin two labels when only that pair overlaps', () => {
      const labels = ['W'.repeat(10), 'W'.repeat(10)];
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 120, [0, 0], false);
      expect(size.tickCadence).toBe(2);
      expectRenderedAxis(size, 0);
    });

    it('should not reserve axis space for a wide label hidden by the cadence', () => {
      const labels = ['A', 'W'.repeat(26), 'B', 'C'];
      const containerWidth = 200;
      // fitting every label lets the wide one shrink the scale and push the axis right
      const fittingAll = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, containerWidth, [0, 0], true);
      const fittingVisible = getXAxisSize(
        true,
        getXStyle(),
        formatter,
        labels,
        textMeasure,
        containerWidth,
        [0, 0],
        false,
      );

      // cadence 2 keeps the narrow labels at index 0 and 2, centered on the full domain.
      // those two fit in the container, so the refit is the compression of only the kept labels
      expect(fittingVisible.tickCadence).toBe(2);
      expect(fittingVisible.width).toBe(containerWidth);
      expect(fittingVisible.left).toBe(0);
      expect(fittingVisible.right).toBe(0);
      expectRenderedAxis(fittingVisible, 0);
      expect(fittingAll.tickCadence).toBe(1);
      expect(fittingAll.width).toBeLessThan(fittingVisible.width);
      expect(fittingAll.left).toBeGreaterThan(fittingVisible.left);
      expectRenderedAxis(fittingAll, 0);
    });

    it('should render every overlapping label when showOverlappingLabels is set', () => {
      const labels = getLabels(50);
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 400, [0, 0], true);
      expect(size.tickCadence).toBe(1);
      expectRenderedAxis(size, 0);
    });

    it('should keep the requested rotation when rotated labels fit', () => {
      const labels = getLabels(5);
      const size = getXAxisSize(true, getXStyle(45), formatter, labels, textMeasure, 600, [0, 0], false);
      expect(size.tickCadence).toBe(1);
      expect(size.minRotation).toBeCloseTo(degToRad(45));
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThan(0);
    });

    it('should keep every slanted label when the glyphs clear and the horizontal boxes overlap', () => {
      const style = getXStyle(45);
      const labels = getLabels(10);
      const size = getXAxisSize(true, style, formatter, labels, textMeasure, 400, [0, 0], false);
      // the horizontal box of a 45° label is wider than the cell, but the font height fits the step
      expect(size.tickCadence).toBe(1);
      expect(size.minRotation).toBeCloseTo(degToRad(45));
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThan(style.fontSize);
    });

    it('should increase the rotation and skip labels when rotated labels would overlap', () => {
      const style = getXStyle(45);
      const labels = getLabels(200);
      const size = getXAxisSize(true, style, formatter, labels, textMeasure, 300, [0, 0], false);
      expect(size.minRotation).toBeGreaterThanOrEqual(degToRad(45));
      expect(size.tickCadence).toBeGreaterThan(1);
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThan(0);
      // vertical labels take the font size as horizontal space
      expect((size.width / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(style.fontSize);
    });

    it('should increase the rotation but render every rotated label when showOverlappingLabels is set', () => {
      const labels = getLabels(200);
      const size = getXAxisSize(true, getXStyle(45), formatter, labels, textMeasure, 300, [0, 0], true);
      expect(size.minRotation).toBeGreaterThanOrEqual(degToRad(45));
      expect(size.tickCadence).toBe(1);
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThan(0);
    });

    it.each([true, false])(
      'should hide the axis when no label can fit the container with showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const labels = getLabels(10);
        const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 20, [0, 0], showOverlappingLabels);
        expect(size.tickCadence).toBeNaN();
        expect(size.height).toBe(0);
        expect(size.left).toBe(0);
        expect(size.minRotation).toBe(0);
      },
    );
  });

  describe('getXAxisSize with range labels', () => {
    it('should render every range label when they fit', () => {
      const labels = getRangeLabels(4);
      const size = getXAxisSize(true, getXStyle(), rangeFormatter, labels, textMeasure, 800, [0, 0], false);
      expect(size.tickCadence).toBe(1);
      expectRenderedAxis(size, 0);
    });

    it('should not overlap rendered range labels of uneven width', () => {
      const style = getXStyle();
      // label widths vary, e.g. `0 – 0.25`, `10.25 – 10.5`, `24.75 – 25`
      const labels = getRangeLabels(100);
      const size = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, 600, [0, 0], false);
      expect(size.tickCadence).toBeGreaterThan(1);
      expect(size.tickCadence).toBeLessThan(labels.length);
      expectRenderedAxis(size, 0);
      const step = size.width / labels.length;
      const rendered = labels.filter((_, i) => i % size.tickCadence === 0);
      rendered.slice(1).forEach((label, i) => {
        const previous = rendered[i] ?? 0;
        // labels are centered on their cell: two neighbours share half of each width plus the padding
        const neededSpace =
          (getMaxLabelWidth([previous], rangeFormatter) + getMaxLabelWidth([label], rangeFormatter)) / 2 +
          horizontalPad(style.padding);
        expect(step * size.tickCadence).toBeGreaterThanOrEqual(neededSpace);
      });
    });

    it('should skip more range labels than shorter category labels', () => {
      const labels = getRangeLabels(100);
      const style = getXStyle();
      const range = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, 600, [0, 0], false);
      const category = getXAxisSize(true, style, formatter, labels, textMeasure, 600, [0, 0], false);
      expect(range.tickCadence).toBeGreaterThan(category.tickCadence);
      expectRenderedAxis(range, 0);
      expectRenderedAxis(category, 0);
    });

    it.each([45, 90])('should skip overlapping range labels with %d degree rotation', (rotation) => {
      const style = getXStyle(rotation);
      const labels = getRangeLabels(200);
      const size = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, 400, [0, 0], false);
      expect(size.minRotation).toBeGreaterThanOrEqual(degToRad(rotation));
      expect(size.tickCadence).toBeGreaterThan(1);
      expect(size.tickCadence).toBeLessThan(labels.length);
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThan(0);
      expect((size.width / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(style.fontSize);
    });
  });

  describe('getXAxisSize with a time scale', () => {
    const labels = Array.from({ length: 100 }, (_, i) => 1_600_000_000_000 + i * 60_000);

    it.each([true, false])(
      'should skip overlapping labels regardless of showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const size = getXAxisSize(
          false,
          getXStyle(),
          formatter,
          labels,
          textMeasure,
          400,
          [0, 0],
          showOverlappingLabels,
        );
        expect(size.tickCadence).toBeGreaterThan(1);
        expectRenderedAxis(size, 0);
      },
    );

    it.each([true, false])(
      'should keep every rotated label regardless of showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const size = getXAxisSize(
          false,
          getXStyle(45),
          formatter,
          labels,
          textMeasure,
          400,
          [0, 0],
          showOverlappingLabels,
        );
        expect(size.tickCadence).toBe(1);
        expect(size.minRotation).toBeGreaterThanOrEqual(degToRad(45));
        expect(size.left).toBeGreaterThanOrEqual(0);
        expect(size.height).toBeGreaterThan(0);
      },
    );
  });

  describe('getYAxisHorizontalUsedSpace with range labels', () => {
    const style = LIGHT_THEME.heatmap.yAxisLabel;
    const labels = getRangeLabels(100);
    const longestLabelWidth = getMaxLabelWidth(labels, rangeFormatter) + horizontalPad(style.padding);

    it('should fit the longest range label with an auto width', () => {
      expect(getYAxisHorizontalUsedSpace(labels, style, rangeFormatter, textMeasure)).toBe(longestLabelWidth);
    });

    it('should cap the width to the max width, truncating the longest range labels', () => {
      const max = longestLabelWidth / 2;
      expect(getYAxisHorizontalUsedSpace(labels, { ...style, width: { max } }, rangeFormatter, textMeasure)).toBe(max);
    });
  });

  describe('Y axis labels cadence', () => {
    const style = LIGHT_THEME.heatmap.yAxisLabel;
    // fontSize 12 + vertical padding 10
    const labelHeight = 22;

    it('should render every label when there are no values', () => {
      expect(getYAxisTickCadence(style, 500, 0)).toBe(1);
    });

    it('should render every label when the panel has no height', () => {
      expect(getYAxisTickCadence(style, 0, 10)).toBe(1);
    });

    it('should render every label on a tall panel', () => {
      expect(getYAxisTickCadence(style, 1000, 10)).toBe(1);
    });

    it('should skip labels when rows are smaller than the label height', () => {
      expect(getYAxisTickCadence(style, 100, 50)).toBe(Math.ceil(labelHeight / 2));
    });

    it('should render every label when rows exactly fit the label height', () => {
      expect(getYAxisTickCadence(style, labelHeight * 10, 10)).toBe(1);
    });

    it('should show only the first label when every row is shorter than the label', () => {
      expect(getYAxisTickCadence(style, 1, 1000)).toBe(1000);
    });
  });
});
