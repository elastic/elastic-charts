/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  computeRotatedLabelDimensions,
  createTickLabelLayout,
  getMaxLabelDimensions,
  resolveTickLabelConstraints,
  type TickLabelBox,
} from './labels';
import { MockGlobalSpec } from '../../../../mocks/specs';
import type { ScaleBand, ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { mergePartial, Position } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { AxisStyle } from '../../../../utils/themes/theme';
import { getAxisBand } from '../dimensions';

const monospaceMeasure: TextMeasure = (text, _font, fontSize) => ({
  width: text.length,
  height: fontSize,
});

const styleWith = (overrides: Partial<AxisStyle['tickLabel']> = {}): AxisStyle =>
  mergePartial(LIGHT_THEME.axes, {
    tickLabel: { lineHeight: 1, rotation: 0, ...overrides },
  });

const axisSpec = MockGlobalSpec.yAxis();

const emptyLines = Object.assign([] as string[], { meta: { truncated: false } });

const box = (overrides: Partial<TickLabelBox> = {}): TickLabelBox => ({
  width: 0,
  height: 0,
  bboxWidth: 0,
  bboxHeight: 0,
  lines: emptyLines,
  ...overrides,
});

describe('computeRotatedLabelDimensions', () => {
  test('returns input dimensions when not rotated', () => {
    expect(computeRotatedLabelDimensions({ width: 1, height: 2 }, 0)).toEqual({ width: 1, height: 2 });
  });

  test('swaps width and height for a 90 degree rotation', () => {
    const result = computeRotatedLabelDimensions({ width: 1, height: 2 }, 90);
    expect(result.width).toBeCloseTo(2);
    expect(result.height).toBeCloseTo(1);
  });

  test('produces sqrt(2) bounding box for a unit square at 45 degrees', () => {
    const result = computeRotatedLabelDimensions({ width: 1, height: 1 }, 45);
    expect(result.width).toBeCloseTo(Math.sqrt(2));
    expect(result.height).toBeCloseTo(Math.sqrt(2));
  });
});

describe('createTickLabelLayout', () => {
  test('returns a single line when the label fits within maxLineLength', () => {
    const layout = createTickLabelLayout(styleWith(), axisSpec, monospaceMeasure, 'en', 1, 100);
    const result = layout('hello');
    expect(result.lines[0]).toEqual('hello');
    expect(result.width).toBe(5);
    expect(result.height).toBe(LIGHT_THEME.axes.tickLabel.fontSize);
    expect(result.bboxWidth).toBe(5);
    expect(result.bboxHeight).toBe(LIGHT_THEME.axes.tickLabel.fontSize);
  });

  test('wraps a long label across multiple lines using lineHeight for inner-line spacing', () => {
    const lineHeight = 1.5;
    const { fontSize } = LIGHT_THEME.axes.tickLabel;
    const layout = createTickLabelLayout(styleWith({ lineHeight }), axisSpec, monospaceMeasure, 'en', 5, 5);
    const result = layout('one two three');
    expect(result.lines.length).toBeGreaterThan(1);
    // n - 1 inner lines spaced by lineHeight*fontSize, plus the last line at its measured height (= fontSize).
    const innerLines = result.lines.length - 1;
    const expectedHeight = innerLines * lineHeight * fontSize + fontSize;
    expect(result.height).toBe(expectedHeight);
  });

  test('rotation produces a different bounding box than the unrotated text box', () => {
    const layout = createTickLabelLayout(styleWith({ rotation: 90 }), axisSpec, monospaceMeasure, 'en', 1, 100);
    const result = layout('hello');
    expect(result.width).toBe(5);
    expect(result.height).toBe(LIGHT_THEME.axes.tickLabel.fontSize);
    expect(result.bboxWidth).toBe(LIGHT_THEME.axes.tickLabel.fontSize);
    expect(result.bboxHeight).toBe(6);
  });

  describe('compact single-word labels', () => {
    const xAxisSpec = MockGlobalSpec.xAxis();

    test('keeps a short single word whole on one line when it overflows its slot', () => {
      const layout = createTickLabelLayout(styleWith(), xAxisSpec, monospaceMeasure, 'en', 2, 4, true);
      const result = layout('Monday');
      expect([...result.lines]).toEqual(['Monday']);
      expect(result.lines.meta.truncated).toBe(false);
      expect(result.width).toBe(6);
    });

    test('still truncates a long single token that overflows its slot', () => {
      const layout = createTickLabelLayout(styleWith(), xAxisSpec, monospaceMeasure, 'en', 2, 4, true);
      const result = layout('abcdefghijklmnopqrst');
      expect(result.lines.meta.truncated).toBe(true);
    });

    test('still wraps multi-word labels across lines', () => {
      const layout = createTickLabelLayout(styleWith(), xAxisSpec, monospaceMeasure, 'en', 5, 5, true);
      const result = layout('one two three');
      expect(result.lines.length).toBeGreaterThan(1);
    });
  });
});

describe('getMaxLabelDimensions', () => {
  test('returns zero dimensions for an empty input', () => {
    expect(getMaxLabelDimensions([])).toEqual({
      width: 0,
      height: 0,
      bboxWidth: 0,
      bboxHeight: 0,
      lines: emptyLines,
    });
  });

  test('returns the per-dimension max across ticks', () => {
    const result = getMaxLabelDimensions([
      box({ width: 10, height: 12, bboxWidth: 10, bboxHeight: 12 }),
      box({ width: 5, height: 20, bboxWidth: 5, bboxHeight: 20 }),
    ]);
    expect(result).toMatchObject({ width: 10, height: 20, bboxWidth: 10, bboxHeight: 20 });
  });
});

describe('resolveTickLabelConstraints', () => {
  const ordinalScale = { type: ScaleType.Ordinal, step: 50, bandwidth: 50, barsPadding: 0.2 } as unknown as ScaleBand;
  const continuousScale = { type: ScaleType.Linear, bandwidth: 0, barsPadding: 0 } as unknown as ScaleContinuous;
  const style = mergePartial(LIGHT_THEME.axes, { tickLabel: { fontSize: 10, lineHeight: 1, wrapLines: 5 } });

  test('vertical axes cap maxLineLength by labelBudget; wrapLines unchanged', () => {
    const band = getAxisBand(Position.Left, style, 0, 100, 200);
    const result = resolveTickLabelConstraints({
      axisSpec: MockGlobalSpec.yAxis(),
      style,
      band,
      scale: continuousScale,
      containerWidth: 100,
    });
    expect(result.maxLineLength).toBe(100);
    expect(result.maxWrapLines).toBe(5);
  });

  test('horizontal ordinal axes cap maxLineLength by bandwidth + half barsPadding', () => {
    const band = getAxisBand(Position.Bottom, style, 0, 200, 200);
    const result = resolveTickLabelConstraints({
      axisSpec: MockGlobalSpec.xAxis(),
      style,
      band,
      scale: ordinalScale,
      containerWidth: 100,
    });
    expect(result.maxLineLength).toBe(50 * (1 + 0.2));
  });

  test('horizontal axes clamp wrapLines to what fits in the labelBudget', () => {
    const band = getAxisBand(Position.Bottom, style, 0, 200, 40);
    const result = resolveTickLabelConstraints({
      axisSpec: MockGlobalSpec.xAxis(),
      style,
      band,
      scale: continuousScale,
      containerWidth: 100,
    });
    expect(result.maxWrapLines).toBe(4);
  });

  test('multilayer time axes cap maxLineLength by labelBudget, not single-bar bandwidth', () => {
    const histogramScale = { type: ScaleType.Time, bandwidth: 12, barsPadding: 0.2 } as unknown as ScaleContinuous;
    const band = getAxisBand(Position.Bottom, style, 0, 200, 200);
    const result = resolveTickLabelConstraints({
      axisSpec: MockGlobalSpec.xAxis(),
      style,
      band,
      scale: histogramScale,
      containerWidth: 200,
      multilayerTimeAxis: true,
    });
    expect(result.maxLineLength).toBe(200);
  });
});
