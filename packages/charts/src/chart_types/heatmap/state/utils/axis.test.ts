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
const FONT_SIZE = LIGHT_THEME.heatmap.xAxisLabel.fontSize;
const textMeasure: TextMeasure = (text, _font, fontSize) => ({ width: text.length * CHAR_WIDTH, height: fontSize });
const formatter = (value: string | number) => `${value}`;
const getLabels = (count: number) => Array.from({ length: count }, (_, i) => `Label-${String(i).padStart(2, '0')}`);
const getXStyle = (rotation = 0): HeatmapStyle['xAxisLabel'] => ({ ...LIGHT_THEME.heatmap.xAxisLabel, rotation });
const RANGE_STEP = 0.25;
const rangeFormatter = (value: string | number) => `${value} – ${Number(value) + RANGE_STEP}`;
const getRangeLabels = (count: number) => Array.from({ length: count }, (_, i) => i * RANGE_STEP);
const getMaxLabelWidth = (labels: (string | number)[], format: (value: string | number) => string) =>
  Math.max(...labels.map((label) => format(label).length * CHAR_WIDTH));
/** `Label-00` */
const LABEL_WIDTH = 8 * CHAR_WIDTH;

/** center of the i-th of `count` categorical bands, as a fraction of the axis */
const bandCenter = (i: number, count: number) => (i + 0.5) / count;

/** axis height: the rotated label box, the top padding, and the vertical position of the rotation origin */
const axisHeight = (labelWidth: number, rotation = 0, style = getXStyle()) =>
  labelWidth * Math.sin(rotation) + FONT_SIZE * Math.cos(rotation) + pad(style.padding, 'top') + style.fontSize / 2;

/** horizontal space a rotated label takes before and after its tick: rotated labels are right aligned */
const rotatedSides = (labelWidth: number, rotation: number, labelHeight = FONT_SIZE): [number, number] => [
  labelWidth * Math.cos(rotation) + (labelHeight / 2) * Math.sin(rotation),
  (labelHeight / 2) * Math.sin(rotation),
];

/**
 * `left` when the first visible label protrudes past the start of the axis.
 * The compressed scale spans from that label to the label, or the end of the domain, that bounds it on the right.
 */
const protrudingLeft = (
  containerWidth: number,
  [firstSide, firstCenter]: [number, number],
  [lastSide, lastCenter]: [number, number] = [0, 1],
) => {
  const width = (containerWidth - firstSide - lastSide) / (lastCenter - firstCenter);
  return firstSide - firstCenter * width;
};

/** fields the heatmap view reads when placing and rotating x labels */
const expectRenderedAxis = (
  size: { left: number; height: number; tickCadence: number; minRotation: number },
  expected: { left: number; height: number; tickCadence: number; minRotation: number },
) => {
  expect(size.tickCadence).toBe(expected.tickCadence);
  expect(size.left).toBeCloseTo(expected.left);
  expect(size.height).toBeCloseTo(expected.height);
  expect(size.minRotation).toBeCloseTo(expected.minRotation);
};

describe('Heatmap axis', () => {
  describe('getXAxisSize with a categorical scale', () => {
    it('should render every label when they fit', () => {
      const labels = getLabels(3);
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 600, [0, 0], false);
      expectRenderedAxis(size, { left: 0, height: axisHeight(LABEL_WIDTH), tickCadence: 1, minRotation: 0 });
    });

    it('should skip labels at a regular interval when they would overlap', () => {
      const style = getXStyle();
      const labels = getLabels(50);
      const containerWidth = 400;
      const size = getXAxisSize(true, style, formatter, labels, textMeasure, containerWidth, [0, 0], false);
      // the first label sets the left inset, so the scale is compressed to 375.8px: a 7.5px step.
      // a label and its padding take 66px, so 9 steps are needed
      expectRenderedAxis(size, {
        left: protrudingLeft(containerWidth, [LABEL_WIDTH / 2, bandCenter(0, labels.length)]),
        height: axisHeight(LABEL_WIDTH),
        tickCadence: 9,
        minRotation: 0,
      });
      // the rendered distance between two visible labels fits the label width and its padding
      const labelSpace = LABEL_WIDTH + horizontalPad(style.padding);
      expect((containerWidth / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(labelSpace);
    });

    it('should keep a non-overlapping label that sets the right bound', () => {
      const labels = ['A', 'B'.repeat(20)];
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 200, [0, 0], false);
      // the long label compresses the scale from the right and still fits beside the short one
      expectRenderedAxis(size, { left: 0, height: axisHeight(CHAR_WIDTH), tickCadence: 1, minRotation: 0 });
    });

    it('should thin two labels when only that pair overlaps', () => {
      const labels = ['W'.repeat(10), 'W'.repeat(10)];
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 120, [0, 0], false);
      expectRenderedAxis(size, { left: 0, height: axisHeight(10 * CHAR_WIDTH), tickCadence: 2, minRotation: 0 });
    });

    it('should not reserve axis space for a wide label hidden by the cadence', () => {
      const labels = ['A', 'W'.repeat(26), 'B', 'C'];
      const containerWidth = 200;
      const wideLabelWidth = 26 * CHAR_WIDTH;
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

      // cadence 2 keeps the narrow labels at index 0 and 2, and neither of them protrudes
      expectRenderedAxis(fittingVisible, { left: 0, height: axisHeight(CHAR_WIDTH), tickCadence: 2, minRotation: 0 });
      expectRenderedAxis(fittingAll, {
        left: protrudingLeft(containerWidth, [wideLabelWidth / 2, bandCenter(1, labels.length)]),
        height: axisHeight(CHAR_WIDTH),
        tickCadence: 1,
        minRotation: 0,
      });
    });

    it('should render every overlapping label when showOverlappingLabels is set', () => {
      const labels = getLabels(50);
      const containerWidth = 400;
      const size = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, containerWidth, [0, 0], true);
      // the first and the last labels protrude on both sides
      expectRenderedAxis(size, {
        left: protrudingLeft(
          containerWidth,
          [LABEL_WIDTH / 2, bandCenter(0, labels.length)],
          [LABEL_WIDTH / 2, bandCenter(labels.length - 1, labels.length)],
        ),
        height: axisHeight(LABEL_WIDTH),
        tickCadence: 1,
        minRotation: 0,
      });
    });

    it('should keep the requested rotation when rotated labels fit', () => {
      const rotation = degToRad(45);
      const size = getXAxisSize(true, getXStyle(45), formatter, getLabels(5), textMeasure, 600, [0, 0], false);
      expectRenderedAxis(size, {
        left: 0,
        height: axisHeight(LABEL_WIDTH, rotation),
        tickCadence: 1,
        minRotation: rotation,
      });
    });

    it('should keep every slanted label when the rotated boxes clear and the horizontal boxes overlap', () => {
      const rotation = degToRad(45);
      const labels = getLabels(10);
      const containerWidth = 400;
      const size = getXAxisSize(true, getXStyle(45), formatter, labels, textMeasure, containerWidth, [0, 0], false);
      // the horizontal box of a 45° label is wider than the cell, but the step projected on its normal
      // is larger than the font height
      const step = containerWidth / labels.length;
      expect(rotatedSides(LABEL_WIDTH, rotation)[0]).toBeGreaterThan(step);
      expect(step * Math.sin(rotation)).toBeGreaterThan(FONT_SIZE);
      expectRenderedAxis(size, {
        left: protrudingLeft(containerWidth, [rotatedSides(LABEL_WIDTH, rotation)[0], bandCenter(0, labels.length)]),
        height: axisHeight(LABEL_WIDTH, rotation),
        tickCadence: 1,
        minRotation: rotation,
      });
    });

    it('should skip rotated labels whose boxes intersect even if the font height fits the step', () => {
      const boxMeasure: TextMeasure = () => ({ width: 14, height: 12 });
      const rotation = degToRad(45);
      const labels = Array.from({ length: 20 }, (_, i) => `${i + 10}`);
      const containerWidth = 330;
      // a 16.5px step is wider than the label and taller than the font, so no extra rotation is needed.
      // at 45° it projects to 11.7px on both axes of the label box, under its 12px height and 14px width
      const step = containerWidth / labels.length;
      expect(step).toBeGreaterThan(14);
      expect(step).toBeGreaterThan(12);
      expect(step * Math.sin(rotation)).toBeLessThan(12);
      expect(step * Math.cos(rotation)).toBeLessThan(14);

      const expected = {
        left: protrudingLeft(containerWidth, [rotatedSides(14, rotation, 12)[0], bandCenter(0, labels.length)]),
        height: axisHeight(14, rotation),
        minRotation: rotation,
      };
      const showAll = getXAxisSize(true, getXStyle(45), formatter, labels, boxMeasure, containerWidth, [0, 0], true);
      const skip = getXAxisSize(true, getXStyle(45), formatter, labels, boxMeasure, containerWidth, [0, 0], false);
      expectRenderedAxis(showAll, { ...expected, tickCadence: 1 });
      expectRenderedAxis(skip, { ...expected, tickCadence: 2 });
    });

    it('should keep every label rotated exactly to the angle that clears the font height', () => {
      const boxMeasure: TextMeasure = () => ({ width: 30, height: 12 });
      const labels = getLabels(10);
      const yAxisWidth = 100;
      // the Y axis bounds the left side, so the raised rotation keeps the 22.5px step
      const step = 22.5;
      const containerWidth = yAxisWidth + step * labels.length;
      const minRotation = Math.asin(12 / step);
      // the rotation is picked so the step projects on the label normal to the label height,
      // but floating point rounding lands just under it
      expect(step * Math.sin(minRotation)).toBeLessThan(12);

      const size = getXAxisSize(
        true,
        getXStyle(1),
        formatter,
        labels,
        boxMeasure,
        containerWidth,
        [yAxisWidth, 0],
        false,
      );
      expectRenderedAxis(size, { left: yAxisWidth, height: axisHeight(30, minRotation), tickCadence: 1, minRotation });
    });

    it('should increase the rotation and skip labels when rotated labels would overlap', () => {
      const style = getXStyle(45);
      const labels = getLabels(200);
      const containerWidth = 300;
      const size = getXAxisSize(true, style, formatter, labels, textMeasure, containerWidth, [0, 0], false);
      // a 1.5px step forces vertical labels: each takes the font size and its padding, 22px, horizontally
      expectRenderedAxis(size, {
        left: protrudingLeft(containerWidth, [FONT_SIZE / 2, bandCenter(0, labels.length)]),
        height: axisHeight(9 * CHAR_WIDTH, Math.PI / 2),
        tickCadence: 15,
        minRotation: Math.PI / 2,
      });
      expect((containerWidth / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(
        FONT_SIZE + horizontalPad(style.padding),
      );
    });

    it('should increase the rotation but render every rotated label when showOverlappingLabels is set', () => {
      const labels = getLabels(200);
      const containerWidth = 300;
      const size = getXAxisSize(true, getXStyle(45), formatter, labels, textMeasure, containerWidth, [0, 0], true);
      expectRenderedAxis(size, {
        left: protrudingLeft(
          containerWidth,
          [FONT_SIZE / 2, bandCenter(0, labels.length)],
          [FONT_SIZE / 2, bandCenter(labels.length - 1, labels.length)],
        ),
        height: axisHeight(9 * CHAR_WIDTH, Math.PI / 2),
        tickCadence: 1,
        minRotation: Math.PI / 2,
      });
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
      expectRenderedAxis(size, { left: 0, height: axisHeight(CHAR_WIDTH), tickCadence: 1, minRotation: 0 });
    });

    it('should not overlap rendered range labels of uneven width', () => {
      const style = getXStyle();
      // label widths vary, e.g. `0 – 0.25`, `10.25 – 10.5`, `24.75 – 25`
      const labels = getRangeLabels(100);
      const containerWidth = 600;
      const size = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, containerWidth, [0, 0], false);
      // `0 – 0.25` protrudes on the left, and the last visible label `24 – 24.25` bounds the right side
      expectRenderedAxis(size, {
        left: protrudingLeft(
          containerWidth,
          [getMaxLabelWidth([0], rangeFormatter) / 2, bandCenter(0, labels.length)],
          [getMaxLabelWidth([24], rangeFormatter) / 2, bandCenter(96, labels.length)],
        ),
        height: axisHeight(CHAR_WIDTH),
        tickCadence: 16,
        minRotation: 0,
      });
      const step = containerWidth / labels.length;
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
      const containerWidth = 600;
      const range = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, containerWidth, [0, 0], false);
      const category = getXAxisSize(true, style, formatter, labels, textMeasure, containerWidth, [0, 0], false);
      expect(range.tickCadence).toBeGreaterThan(category.tickCadence);
      expectRenderedAxis(category, {
        left: protrudingLeft(containerWidth, [CHAR_WIDTH / 2, bandCenter(0, labels.length)]),
        height: axisHeight(CHAR_WIDTH),
        tickCadence: 6,
        minRotation: 0,
      });
    });

    it.each([45, 90])('should skip overlapping range labels with %d degree rotation', (rotation) => {
      const style = getXStyle(rotation);
      const labels = getRangeLabels(200);
      const containerWidth = 400;
      const size = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, containerWidth, [0, 0], false);
      // the rotation is raised to vertical labels, and only the visible ones set the axis height
      const visibleLabels = labels.filter((_, i) => i % 12 === 0);
      expectRenderedAxis(size, {
        left: protrudingLeft(containerWidth, [FONT_SIZE / 2, bandCenter(0, labels.length)]),
        height: axisHeight(getMaxLabelWidth(visibleLabels, rangeFormatter), Math.PI / 2),
        tickCadence: 12,
        minRotation: Math.PI / 2,
      });
      expect((containerWidth / labels.length) * size.tickCadence).toBeGreaterThanOrEqual(
        FONT_SIZE + horizontalPad(style.padding),
      );
    });
  });

  describe('getXAxisSize with a time scale', () => {
    const labels = Array.from({ length: 100 }, (_, i) => 1_600_000_000_000 + i * 60_000);
    const timeLabelWidth = formatter(labels[0] ?? 0).length * CHAR_WIDTH;

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
        // left aligned labels need 26 steps of 4px to not overlap, and the last visible label
        // must also end inside the container: 34 is the first cadence that also satisfies that
        expectRenderedAxis(size, { left: 0, height: axisHeight(timeLabelWidth), tickCadence: 34, minRotation: 0 });
      },
    );

    it.each([true, false])(
      'should raise the rotation but keep every rotated label that still collides regardless of showOverlappingLabels %s',
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
        // a 4px step is smaller than the font height even with vertical labels, but time labels are not thinned
        expectRenderedAxis(size, {
          left: FONT_SIZE / 2,
          height: axisHeight(timeLabelWidth, Math.PI / 2),
          tickCadence: 1,
          minRotation: Math.PI / 2,
        });
      },
    );

    it.each([true, false])(
      'should keep every rotated label when the rotated boxes clear regardless of showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const rotation = degToRad(45);
        const size = getXAxisSize(
          false,
          getXStyle(45),
          formatter,
          labels.slice(0, 10),
          textMeasure,
          400,
          [0, 0],
          showOverlappingLabels,
        );
        // the first label sits at the start of the axis, so it protrudes by its whole left side
        expectRenderedAxis(size, {
          left: rotatedSides(timeLabelWidth, rotation)[0],
          height: axisHeight(timeLabelWidth, rotation),
          tickCadence: 1,
          minRotation: rotation,
        });
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
