/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  measureAxisBand,
  getAxesDimensions,
  getAxisBand,
  getTitleDimension,
  measureAxisFixedBand,
  resolveTickLabelConstraints,
  type AxisLayoutContext,
} from './dimensions';
import type { TickLabelBox } from './ticks/labels';
import { MockGlobalSpec } from '../../../mocks/specs/specs';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import { mergePartial, Position } from '../../../utils/common';
import { innerPad, outerPad } from '../../../utils/dimensions';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';

const AXIS_STYLE = LIGHT_THEME.axes;
// Primitive theme inputs the band-size formulas should consume.
const TITLE = AXIS_STYLE.axisTitle;
const PANEL_TITLE = AXIS_STYLE.axisPanelTitle;
const TICK_LABEL_PADDING = AXIS_STYLE.tickLabel.padding;

const expectedTitleBand = innerPad(TITLE.padding) + TITLE.fontSize + outerPad(TITLE.padding);
const expectedPanelTitleBand = innerPad(PANEL_TITLE.padding) + PANEL_TITLE.fontSize + outerPad(PANEL_TITLE.padding);
const expectedTickLabelBand = innerPad(TICK_LABEL_PADDING) + outerPad(TICK_LABEL_PADDING);

const tickBox = (overrides: Partial<TickLabelBox> = {}): TickLabelBox => ({
  width: 0,
  height: 0,
  bboxWidth: 0,
  bboxHeight: 0,
  lines: Object.assign([] as string[], { meta: { truncated: false } }),
  ...overrides,
});

const layoutFor = (style: AxisStyle, position: Position, fixed: number, w = 200, h = 100): AxisLayoutContext => ({
  band: getAxisBand(position, style, fixed, w, h),
  multilayerTimeAxis: false,
});

describe('getTitleDimension', () => {
  test('returns inner padding + font size + outer padding when visible with non-zero font size', () => {
    expect(getTitleDimension(TITLE)).toBe(innerPad(TITLE.padding) + TITLE.fontSize + outerPad(TITLE.padding));
  });

  test('returns 0 when invisible', () => {
    expect(getTitleDimension({ ...TITLE, visible: false })).toBe(0);
  });
});

describe('measureAxisFixedBand', () => {
  test('sums tickLabel padding and axis title when title is present', () => {
    expect(measureAxisFixedBand({ title: 'Y', hide: false }, AXIS_STYLE)).toBe(
      expectedTickLabelBand + expectedTitleBand,
    );
  });

  test('omits the axis title when no title is provided', () => {
    expect(measureAxisFixedBand({ title: undefined, hide: false }, AXIS_STYLE)).toBe(expectedTickLabelBand);
  });

  test('adds the panel title contribution when requested', () => {
    expect(measureAxisFixedBand({ title: 'Y', hide: false }, AXIS_STYLE, true)).toBe(
      expectedTickLabelBand + expectedTitleBand + expectedPanelTitleBand,
    );
  });

  test('omits tickLabel padding when tickLabel is not visible', () => {
    const hidden = mergePartial(AXIS_STYLE, { tickLabel: { visible: false } });
    expect(measureAxisFixedBand({ title: 'Y', hide: false }, hidden)).toBe(expectedTitleBand);
  });

  test('adds tick line size + padding only when ticks are shown', () => {
    const tickLineSize = 5;
    const tickLinePadding = 3;
    const withTicks = mergePartial(AXIS_STYLE, {
      tickLine: { visible: true, size: tickLineSize, padding: tickLinePadding },
    });

    expect(measureAxisFixedBand({ title: undefined, hide: false }, withTicks)).toBe(
      expectedTickLabelBand + tickLineSize + tickLinePadding,
    );
    expect(measureAxisFixedBand({ title: undefined, hide: true }, withTicks)).toBe(expectedTickLabelBand);
  });
});

describe('getAxisBand', () => {
  test('vertical axes pick container width as the cross-axis dimension', () => {
    const band = getAxisBand(Position.Left, AXIS_STYLE, 30, 200, 100);
    expect(band).toMatchObject({
      container: 200,
      maxExtent: 200,
      minExtent: 0,
      labelBudget: 200 - 30,
      fixed: 30,
    });
  });

  test('horizontal axes pick container height as the cross-axis dimension', () => {
    const band = getAxisBand(Position.Bottom, AXIS_STYLE, 30, 200, 100);
    expect(band).toMatchObject({ container: 100, maxExtent: 100, minExtent: 0, labelBudget: 70 });
  });

  test('percentage minExtent and maxExtent are resolved against the cross-axis container size', () => {
    const band = getAxisBand(
      Position.Left,
      mergePartial(AXIS_STYLE, { maxExtent: '40%', minExtent: '10%' }),
      30,
      200,
      100,
    );
    expect(band).toMatchObject({ maxExtent: 80, minExtent: 20, labelBudget: 50 });
  });
});

describe('resolveTickLabelConstraints', () => {
  const ordinalScale = { bandwidth: 50, barsPadding: 0.2 } as unknown as ScaleBand;
  const continuousScale = { bandwidth: 0, barsPadding: 0 } as unknown as ScaleContinuous;
  const style = mergePartial(LIGHT_THEME.axes, { tickLabel: { fontSize: 10, lineHeight: 1, wrapLines: 5 } });

  test('vertical axes cap maxLineLength by labelBudget; wrapLines unchanged', () => {
    const band = getAxisBand(Position.Left, style, 0, 100, 200);
    const result = resolveTickLabelConstraints({ position: Position.Left, style, band, scale: continuousScale });
    expect(result.maxLineLength).toBe(100);
    expect(result.maxWrapLines).toBe(5);
  });

  test('horizontal ordinal axes cap maxLineLength by bandwidth + half barsPadding', () => {
    const band = getAxisBand(Position.Bottom, style, 0, 200, 200);
    const result = resolveTickLabelConstraints({ position: Position.Bottom, style, band, scale: ordinalScale });
    expect(result.maxLineLength).toBe(50 + 0.2 / 2);
  });

  test('horizontal axes clamp wrapLines to what fits in the labelBudget', () => {
    const band = getAxisBand(Position.Bottom, style, 0, 200, 40);
    const result = resolveTickLabelConstraints({ position: Position.Bottom, style, band, scale: continuousScale });
    expect(result.maxWrapLines).toBe(4);
  });
});

describe('measureAxisBand', () => {
  const baseSpec = MockGlobalSpec.yAxis({ id: 'y', title: undefined });

  test('clamps the band to minExtent when labels are tiny', () => {
    const style = mergePartial(LIGHT_THEME.axes, { minExtent: 50 });
    const layout = layoutFor(style, Position.Left, 0);
    expect(measureAxisBand(baseSpec, style, [tickBox()], layout)).toBe(50);
  });

  test('clamps the band to maxExtent when labels are wider than the budget', () => {
    const style = mergePartial(LIGHT_THEME.axes, { maxExtent: 60 });
    const layout = layoutFor(style, Position.Left, 10);
    const ticks = [tickBox({ bboxWidth: 200, bboxHeight: 16 })];
    expect(measureAxisBand(baseSpec, style, ticks, layout)).toBe(60);
  });

  test('uses tick bboxWidth on vertical axes and bboxHeight on horizontal axes', () => {
    const style = LIGHT_THEME.axes;

    const vertical = measureAxisBand(
      baseSpec,
      style,
      [tickBox({ bboxWidth: 40, bboxHeight: 10 })],
      layoutFor(style, Position.Left, 5),
    );
    const horizontal = measureAxisBand(
      MockGlobalSpec.xAxis({ id: 'x', title: undefined }),
      style,
      [tickBox({ bboxWidth: 100, bboxHeight: 18 })],
      layoutFor(style, Position.Bottom, 5),
    );

    expect(vertical).toBe(5 + 40);
    expect(horizontal).toBe(5 + 18);
  });

  test('multilayer time axis multiplies the label girth by the layer count', () => {
    const spec = MockGlobalSpec.xAxis({ id: 'x', title: undefined, timeAxisLayerCount: 3 });
    const style = LIGHT_THEME.axes;
    const layout: AxisLayoutContext = {
      band: getAxisBand(Position.Bottom, style, 5, 200, 200),
      multilayerTimeAxis: true,
    };
    const size = measureAxisBand(spec, style, [tickBox({ bboxHeight: 12 })], layout);
    expect(size).toBe(5 + 3 * 12);
  });
});

describe('getAxesDimensions', () => {
  const theme: Theme = { ...LIGHT_THEME, chartMargins: { top: 1, bottom: 2, left: 3, right: 4 } };

  const yAxis = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left, title: undefined });
  const xAxis = MockGlobalSpec.xAxis({ id: 'x', position: Position.Bottom, title: undefined });

  test('overflow from a horizontal axis can extend the orthogonal margin', () => {
    // First/last tick on a bottom axis push half their bboxWidth into left/right overflow.
    // chartMargins.left=3, chartMargins.right=4. With first/last bbox=80, half=40 → overflow wins.
    const ticks = [tickBox({ bboxWidth: 80, bboxHeight: 10 }), tickBox({ bboxWidth: 80, bboxHeight: 10 })];
    const result = getAxesDimensions(theme, [
      { spec: xAxis, style: AXIS_STYLE, ticks, layout: layoutFor(AXIS_STYLE, Position.Bottom, 5) },
    ]);
    expect(result.left).toBe(3 + 40);
    expect(result.right).toBe(4 + 40);
  });

  test('returns chartMargins on each side when no axes are provided', () => {
    expect(getAxesDimensions(theme, [])).toEqual({
      top: 1,
      bottom: 2,
      left: 3,
      right: 4,
      margin: { left: 0 },
    });
  });

  test('reserves the band per side and keeps unaffected sides at chartMargins', () => {
    // bboxHeight=0 keeps the orthogonal overflow at 0 so we can assert top/bottom == chartMargins
    const result = getAxesDimensions(theme, [
      {
        spec: yAxis,
        style: AXIS_STYLE,
        ticks: [tickBox({ bboxWidth: 40, bboxHeight: 0 })],
        layout: layoutFor(AXIS_STYLE, Position.Left, 5),
      },
    ]);
    expect(result.left).toBe(3 + 5 + 40);
    expect(result.right).toBe(4);
    expect(result.top).toBe(1);
    expect(result.bottom).toBe(2);
  });

  test('skips hidden axes', () => {
    const result = getAxesDimensions(theme, [
      {
        spec: yAxis,
        style: AXIS_STYLE,
        ticks: [tickBox({ bboxWidth: 100 })],
        layout: layoutFor(AXIS_STYLE, Position.Left, 5),
        isHidden: true,
      },
    ]);
    expect(result.left).toBe(3);
  });
});
