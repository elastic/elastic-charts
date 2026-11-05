/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getXAxisSize, getYAxisHorizontalUsedSpace, getYAxisLabelSpans } from './axis';
import { getLabelsCadence } from '../../../../solvers/label_overlaps';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad } from '../../../../utils/common';
import { horizontalPad } from '../../../../utils/dimensions';
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

describe('Heatmap axis', () => {
  describe('getXAxisSize with a categorical scale', () => {
    it('should render every label when they fit', () => {
      const labels = getLabels(3);
      const { tickCadence, minRotation } = getXAxisSize(
        true,
        getXStyle(),
        formatter,
        labels,
        textMeasure,
        600,
        [0, 0],
        false,
      );
      expect(tickCadence).toBe(1);
      expect(minRotation).toBe(0);
    });

    it('should skip labels at a regular interval when they would overlap', () => {
      const style = getXStyle();
      const labels = getLabels(50);
      const { tickCadence, width } = getXAxisSize(true, style, formatter, labels, textMeasure, 400, [0, 0], false);
      expect(tickCadence).toBeGreaterThan(1);
      expect(tickCadence).toBeLessThan(labels.length);
      // the distance between two rendered labels must fit the label width and its padding
      const labelWidth = (labels[0]?.length ?? 0) * CHAR_WIDTH + horizontalPad(style.padding);
      expect((width / labels.length) * tickCadence).toBeGreaterThanOrEqual(labelWidth);
    });

    it('should render every overlapping label when showOverlappingLabels is set', () => {
      const labels = getLabels(50);
      const { tickCadence } = getXAxisSize(true, getXStyle(), formatter, labels, textMeasure, 400, [0, 0], true);
      expect(tickCadence).toBe(1);
    });

    it('should keep the requested rotation when rotated labels fit', () => {
      const labels = getLabels(5);
      const { tickCadence, minRotation } = getXAxisSize(
        true,
        getXStyle(45),
        formatter,
        labels,
        textMeasure,
        600,
        [0, 0],
        false,
      );
      expect(tickCadence).toBe(1);
      expect(minRotation).toBeCloseTo(degToRad(45));
    });

    it('should increase the rotation and skip labels when rotated labels would overlap', () => {
      const style = getXStyle(45);
      const labels = getLabels(200);
      const { tickCadence, minRotation, width } = getXAxisSize(
        true,
        style,
        formatter,
        labels,
        textMeasure,
        300,
        [0, 0],
        false,
      );
      expect(minRotation).toBeGreaterThanOrEqual(degToRad(45));
      expect(tickCadence).toBeGreaterThan(1);
      // vertical labels take the font size as horizontal space
      expect((width / labels.length) * tickCadence).toBeGreaterThanOrEqual(style.fontSize);
    });

    it('should increase the rotation but render every rotated label when showOverlappingLabels is set', () => {
      const labels = getLabels(200);
      const { tickCadence, minRotation } = getXAxisSize(
        true,
        getXStyle(45),
        formatter,
        labels,
        textMeasure,
        300,
        [0, 0],
        true,
      );
      expect(minRotation).toBeGreaterThanOrEqual(degToRad(45));
      expect(tickCadence).toBe(1);
    });

    it.each([true, false])(
      'should hide the axis when no label can fit the container with showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const labels = getLabels(10);
        const { tickCadence, height } = getXAxisSize(
          true,
          getXStyle(),
          formatter,
          labels,
          textMeasure,
          20,
          [0, 0],
          showOverlappingLabels,
        );
        expect(tickCadence).toBeNaN();
        expect(height).toBe(0);
      },
    );
  });

  describe('getXAxisSize with range labels', () => {
    it('should render every range label when they fit', () => {
      const labels = getRangeLabels(4);
      const { tickCadence } = getXAxisSize(true, getXStyle(), rangeFormatter, labels, textMeasure, 800, [0, 0], false);
      expect(tickCadence).toBe(1);
    });

    it('should not overlap rendered range labels of uneven width', () => {
      const style = getXStyle();
      // label widths vary, e.g. `0 – 0.25`, `10.25 – 10.5`, `24.75 – 25`
      const labels = getRangeLabels(100);
      const { tickCadence, width } = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, 600, [0, 0], false);
      expect(tickCadence).toBeGreaterThan(1);
      expect(tickCadence).toBeLessThan(labels.length);
      const step = width / labels.length;
      const rendered = labels.filter((_, i) => i % tickCadence === 0);
      rendered.slice(1).forEach((label, i) => {
        const previous = rendered[i] ?? 0;
        // labels are centered on their cell: two neighbours share half of each width plus the padding
        const neededSpace =
          (getMaxLabelWidth([previous], rangeFormatter) + getMaxLabelWidth([label], rangeFormatter)) / 2 +
          horizontalPad(style.padding);
        expect(step * tickCadence).toBeGreaterThanOrEqual(neededSpace);
      });
    });

    it('should skip more range labels than shorter category labels', () => {
      const labels = getRangeLabels(100);
      const style = getXStyle();
      const range = getXAxisSize(true, style, rangeFormatter, labels, textMeasure, 600, [0, 0], false);
      const category = getXAxisSize(true, style, formatter, labels, textMeasure, 600, [0, 0], false);
      expect(range.tickCadence).toBeGreaterThan(category.tickCadence);
    });

    it.each([45, 90])('should skip overlapping range labels with %d degree rotation', (rotation) => {
      const style = getXStyle(rotation);
      const labels = getRangeLabels(200);
      const { tickCadence, minRotation, width } = getXAxisSize(
        true,
        style,
        rangeFormatter,
        labels,
        textMeasure,
        400,
        [0, 0],
        false,
      );
      expect(minRotation).toBeGreaterThanOrEqual(degToRad(rotation));
      expect(tickCadence).toBeGreaterThan(1);
      expect(tickCadence).toBeLessThan(labels.length);
      expect((width / labels.length) * tickCadence).toBeGreaterThanOrEqual(style.fontSize);
    });
  });

  describe('getXAxisSize with a time scale', () => {
    it.each([true, false])(
      'should skip overlapping labels regardless of showOverlappingLabels %s',
      (showOverlappingLabels) => {
        const labels = Array.from({ length: 100 }, (_, i) => 1_600_000_000_000 + i * 60_000);
        const { tickCadence } = getXAxisSize(
          false,
          getXStyle(),
          formatter,
          labels,
          textMeasure,
          400,
          [0, 0],
          showOverlappingLabels,
        );
        expect(tickCadence).toBeGreaterThan(1);
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
    const getYAxisTickCadence = (panelHeight: number, valuesCount: number) =>
      getLabelsCadence(getYAxisLabelSpans(style, panelHeight, valuesCount));

    it('should center each label span on its row', () => {
      expect(getYAxisLabelSpans(style, 100, 2)).toEqual([
        { position: 25, before: labelHeight / 2, after: labelHeight / 2 },
        { position: 75, before: labelHeight / 2, after: labelHeight / 2 },
      ]);
    });

    it('should render every label when there are no values', () => {
      expect(getYAxisTickCadence(500, 0)).toBe(1);
    });

    it('should render every label when the panel has no height', () => {
      expect(getYAxisTickCadence(0, 10)).toBe(1);
    });

    it('should render every label on a tall panel', () => {
      expect(getYAxisTickCadence(1000, 10)).toBe(1);
    });

    it('should skip labels when rows are smaller than the label height', () => {
      expect(getYAxisTickCadence(100, 50)).toBe(Math.ceil(labelHeight / 2));
    });

    it('should render every label when rows exactly fit the label height', () => {
      expect(getYAxisTickCadence(labelHeight * 10, 10)).toBe(1);
    });
  });
});
