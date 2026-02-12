/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeHorizontalLegendRowCount, computeWrappedRowCount } from './legend_row_count';
import { LegendValue } from '../../common/legend';
import type { LegendItem } from '../../common/legend';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';

describe('state utils - computeWrappedRowCount', () => {
  it('returns 1 for empty input', () => {
    expect(computeWrappedRowCount([], 100, 24)).toBe(1);
  });

  it('does not apply column-gap to the first item of a row', () => {
    // Two items of width 10 with a gap of 5 should fit exactly into 25.
    expect(computeWrappedRowCount([10, 10], 25, 5)).toBe(1);
  });

  it('wraps when adding a non-first item would exceed available width', () => {
    expect(computeWrappedRowCount([10, 10], 24, 5)).toBe(2);
  });

  it('keeps a single over-wide item on a single row', () => {
    expect(computeWrappedRowCount([200], 100, 24)).toBe(1);
  });

  it('wraps across multiple rows', () => {
    // With widths [10,10,10], available 25, gap 5:
    // row1: 10 + 5 + 10 = 25 fits, row2: 10
    expect(computeWrappedRowCount([10, 10, 10], 25, 5)).toBe(2);
  });

  it('treats negative widths as 0', () => {
    // Negative widths are clamped to 0 and should not force an extra wrap on their own
    expect(computeWrappedRowCount([-10, 10], 9, 5)).toBe(1);

    // Still wraps correctly when later items exceed the row width
    expect(computeWrappedRowCount([10, -10, 10], 19, 5)).toBe(2);
  });
});

describe('state utils - computeHorizontalLegendRowCount', () => {
  const measureByCharCount: TextMeasure = (text) => ({ width: text.length, height: 1 });

  const mkItem = (label: string, valueLabel = '10'): LegendItem =>
    ({
      seriesIdentifiers: [{ specId: 'spec', key: 'k', splitAccessors: new Map(), yAccessor: 'y' as any }],
      depth: 0,
      path: [],
      color: 'red',
      label,
      isItemHidden: false,
      isSeriesHidden: false,
      values: [{ type: LegendValue.CurrentAndLastValue, value: 10 as any, label: valueLabel }],
      keys: [],
    }) as any;

  const mkItemWithValues = (
    label: string,
    values: Array<{ type: LegendValue; label: string }>,
  ): LegendItem =>
    ({
      seriesIdentifiers: [{ specId: 'spec', key: 'k', splitAccessors: new Map(), yAccessor: 'y' as any }],
      depth: 0,
      path: [],
      color: 'red',
      label,
      isItemHidden: false,
      isSeriesHidden: false,
      values: values.map(({ type, label: valueLabel }) => ({
        type,
        value: 10 as any,
        label: valueLabel,
      })),
      keys: [],
    }) as any;

  const mkItemWithNoValues = (label: string): LegendItem =>
    ({
      seriesIdentifiers: [{ specId: 'spec', key: 'k', splitAccessors: new Map(), yAccessor: 'y' as any }],
      depth: 0,
      path: [],
      color: 'red',
      label,
      isItemHidden: false,
      isSeriesHidden: false,
      values: [],
      keys: [],
    }) as any;

  it('wraps rows based on computed item widths', () => {
    // Each item width ~= marker/sharedMargin/spacing/action are all 0, and text width is character count.
    // With available 5 and per-item width of 5: row1 has 5 + gap(1) + 5 => 11 wraps.
    const items = [mkItem('aaa'), mkItem('bbb')];
    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [LegendValue.CurrentAndLastValue],
        availableWidth: 5,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 0,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
      }),
    ).toBe(2);
  });

  it('reserves CurrentAndLastValue width using maxFormattedValue', () => {
    // maxFormattedValue length=4 ("9999") is used for every item, even if the current label is shorter.
    const items = [
      mkItemWithValues('a', [{ type: LegendValue.CurrentAndLastValue, label: '1' }]),
      mkItemWithValues('b', [{ type: LegendValue.CurrentAndLastValue, label: '2' }]),
    ];

    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [LegendValue.CurrentAndLastValue],
        // With per-item width 1(label)+4(value)=5 and available 7:
        // row1: 5 + gap(1) + 5 => 11 wraps.
        availableWidth: 7,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 0,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
        maxFormattedValue: '9999',
      }),
    ).toBe(2);
  });

  it('does not reserve max label width for non-CurrentAndLastValue values', () => {
    const items = [
      mkItemWithValues('a', [{ type: LegendValue.LastValue, label: '1' }]),
      mkItemWithValues('b', [{ type: LegendValue.LastValue, label: '2' }]),
    ];

    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [LegendValue.LastValue],
        // With per-item width 1(label)+1(value)=2 and available 7:
        // row1: 2 + gap(1) + 2 => 5 fits.
        availableWidth: 7,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 0,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
        maxFormattedValue: '9999',
      }),
    ).toBe(1);
  });

  it('adds sharedMargin before each value cell', () => {
    const items = [
      mkItemWithValues('a', [{ type: LegendValue.LastValue, label: '1' }]),
      mkItemWithValues('b', [{ type: LegendValue.LastValue, label: '2' }]),
    ];

    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [LegendValue.LastValue],
        // With sharedMargin=4 and no trailing margin (because there are value cells), per-item width becomes:
        // sharedMargin(start 4) + sharedMargin(before label 4) + label(1) + sharedMargin(before value 4) + value(1) = 14
        // so 14 + gap(1) + 14 = 29 wraps when availableWidth is 28 (but would fit if value margin wasn't counted).
        availableWidth: 28,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 4,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
      }),
    ).toBe(2);
  });

  it('does not add trailing sharedMargin when there are values but no action column', () => {
    const items = [
      mkItemWithValues('a', [{ type: LegendValue.LastValue, label: '1' }]),
      mkItemWithValues('b', [{ type: LegendValue.LastValue, label: '2' }]),
    ];

    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [LegendValue.LastValue],
        // Per-item width is 14 (see test above). 14 + gap(1) + 14 = 29 fits in 30.
        // If a trailing margin were added, per-item width would be 18 and it would wrap (37 > 30).
        availableWidth: 30,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 4,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
      }),
    ).toBe(1);
  });

  it('adds trailing sharedMargin only when there are no values and no action column', () => {
    const items = [mkItemWithNoValues('a'), mkItemWithNoValues('b')];

    expect(
      computeHorizontalLegendRowCount({
        items,
        legendValues: [],
        // With sharedMargin=4 and no values/action, per-item width becomes:
        // sharedMargin(start 4) + sharedMargin(before label 4) + label(1) + sharedMargin(trailing 4) = 13
        // so 13 + gap(1) + 13 = 27 wraps when availableWidth is 19.
        availableWidth: 19,
        columnGap: 1,
        spacingBuffer: 0,
        actionDimension: 0,
        markerWidth: 0,
        sharedMargin: 4,
        widthLimit: 0,
        showValueTitle: false,
        textMeasure: measureByCharCount,
      }),
    ).toBe(2);
  });
});
