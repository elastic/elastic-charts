/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HorizontalLegendRowCountArgs } from './legend_row_count';
import { computeHorizontalLegendRowCount } from './legend_row_count';
import type { LegendItem } from '../../common/legend';
import { LegendValue } from '../../common/legend';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';

const mockTextMeasure: TextMeasure = (text: string) => ({
  width: text.length * 10,
  height: 16,
});

function getMockedLegendItem(label: string, values: LegendItem['values'] = []): LegendItem {
  return {
    seriesIdentifiers: [{ key: label, specId: label }],
    depth: 0,
    path: [],
    color: '#000',
    label,
    values,
    keys: [label],
  };
}

function getMockedArgs(overrides: Partial<HorizontalLegendRowCountArgs> = {}): HorizontalLegendRowCountArgs {
  return {
    items: [],
    legendValues: [],
    availableWidth: 1000,
    columnGap: 16,
    spacingBuffer: 8,
    actionDimension: 0,
    markerWidth: 16,
    sharedMargin: 4,
    widthLimit: 0,
    showValueTitle: false,
    textMeasure: mockTextMeasure,
    ...overrides,
  };
}

describe('computeHorizontalLegendRowCount', () => {
  it('returns single line for empty items', () => {
    const result = computeHorizontalLegendRowCount(getMockedArgs({ items: [] }));
    expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
  });

  it('returns single line when one item fits within available width', () => {
    const items = [getMockedLegendItem('Series A')];
    const result = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 500 }));
    expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
  });

  it('returns single line when all items fit in one row', () => {
    const items = [getMockedLegendItem('A'), getMockedLegendItem('B'), getMockedLegendItem('C')];
    const result = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 2000 }));
    expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
  });

  it('returns not single line when items overflow to two rows', () => {
    const items = [getMockedLegendItem('A long label one'), getMockedLegendItem('A long label two')];
    // Use a tight width to force wrapping onto two rows
    const result = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 250 }));
    expect(result).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
  });

  it('returns isMoreThanTwoLines when items overflow beyond two rows', () => {
    const items = Array.from({ length: 10 }, (_, i) => getMockedLegendItem(`Legend item number ${i}`));
    // Very narrow width forces many rows
    const result = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 100 }));
    expect(result).toEqual({ isSingleLine: false, isMoreThanTwoLines: true });
  });

  it('short-circuits as soon as a third row is reached', () => {
    const measureCalls: string[] = [];
    const spyTextMeasure: TextMeasure = (text: string) => {
      measureCalls.push(text);
      return { width: text.length * 10, height: 16 };
    };

    const items = Array.from({ length: 20 }, (_, i) => getMockedLegendItem(`Item ${i}`));
    // Each item is roughly 4+16+8+(6*10)+8+4 = 100px wide; available width = 90px forces every item onto a new row
    computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 90, textMeasure: spyTextMeasure }));

    // Should stop measuring after the 3rd item triggers a third row
    expect(measureCalls.length).toBe(3);
  });

  describe('widthLimit (label truncation)', () => {
    it('caps label width when widthLimit is set', () => {
      // "VeryLongSeriesLabel" => 19 chars * 10 = 190px without cap
      const items = [
        getMockedLegendItem('VeryLongSeriesLabel,OneThatShouldBeCapped,OtherwiseThisWillAddANewLine'),
        getMockedLegendItem('Another'),
      ];
      const withoutLimit = computeHorizontalLegendRowCount(
        getMockedArgs({ items, availableWidth: 350, widthLimit: 0 }),
      );

      const withLimit = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 350, widthLimit: 50 }));

      // Without limit, the first item is very wide and pushes the second item onto a new line → not a single line
      expect(withLimit).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
      expect(withoutLimit).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
    });

    it('does not alter width when label is shorter than widthLimit', () => {
      const items = [getMockedLegendItem('AB')]; // 2 chars * 10 = 20px
      const result = computeHorizontalLegendRowCount(getMockedArgs({ items, availableWidth: 500, widthLimit: 200 }));
      expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
    });
  });

  describe('legendValues', () => {
    it('adds value cell widths to the item width', () => {
      const values = [{ value: 123, label: '123', type: LegendValue.Average }];
      const items = [getMockedLegendItem('A', values), getMockedLegendItem('B', values)];

      const withoutValues = computeHorizontalLegendRowCount(
        getMockedArgs({ items, legendValues: [], availableWidth: 300 }),
      );
      const withValues = computeHorizontalLegendRowCount(
        getMockedArgs({ items, legendValues: [LegendValue.Average], availableWidth: 100 }),
      );

      expect(withoutValues).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
      expect(withValues).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
    });

    it('skips values whose type is not in legendValues', () => {
      const values = [{ value: 100, label: '100', type: LegendValue.Min }];
      const items = [getMockedLegendItem('Series A', values)];

      // Request Max but item only has Min → value cell should be skipped
      const result = computeHorizontalLegendRowCount(
        getMockedArgs({ items, legendValues: [LegendValue.Max], availableWidth: 50 }),
      );
      expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
    });

    it('skips non-CurrentAndLastValue entries with empty labels', () => {
      const values = [{ value: null, label: '', type: LegendValue.Average }];
      const items = [getMockedLegendItem('A', values)];

      const result = computeHorizontalLegendRowCount(
        getMockedArgs({ items, legendValues: [LegendValue.Average], availableWidth: 50 }),
      );
      expect(result).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
    });
  });

  describe('CurrentAndLastValue with maxFormattedValue', () => {
    it('uses maxFormattedValue when provided', () => {
      const values = [{ value: 5, label: '5', type: LegendValue.CurrentAndLastValue }];
      const items = [getMockedLegendItem('X', values), getMockedLegendItem('Y', values)];

      const withShortMax = computeHorizontalLegendRowCount(
        getMockedArgs({
          items,
          legendValues: [LegendValue.CurrentAndLastValue],
          availableWidth: 100,
          maxFormattedValue: '9',
        }),
      );

      const withLongMax = computeHorizontalLegendRowCount(
        getMockedArgs({
          items,
          legendValues: [LegendValue.CurrentAndLastValue],
          availableWidth: 100,
          maxFormattedValue: '999,999,999.99',
        }),
      );

      // The short maxFormattedValue ("9") should fit in 2 lines, the long one should overflow to 3 lines
      expect(withShortMax).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
      expect(withLongMax).toEqual({ isSingleLine: false, isMoreThanTwoLines: true });
    });

    it('uses dash when label is empty and maxFormattedValue is undefined', () => {
      const values = [{ value: null, label: '', type: LegendValue.CurrentAndLastValue }];
      const items = [getMockedLegendItem('X', values)];

      const result = computeHorizontalLegendRowCount(
        getMockedArgs({
          items,
          legendValues: [LegendValue.CurrentAndLastValue],
          availableWidth: 50,
        }),
      );
      // Should return two lines because the placeholder "—" is used for the value label
      // Without values, legend fits on a single line
      expect(result).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
    });
  });

  it('returns isMoreThanTwoLines when a single item with multiple values spreads across 3 rows', () => {
    const values = [
      { value: 1000000, label: '1,000,000', type: LegendValue.Average },
      { value: 2000000, label: '2,000,000', type: LegendValue.Min },
    ];
    const items = [getMockedLegendItem('A', values)];

    // Label part: 4 + 16 + 8 + 10 + 8 + 4 = 50px
    // Each value cell: 4 + textMeasure('1,000,000').width = 4 + 90 = 94px (mock: 9 chars * 10)
    // With availableWidth = 60, each part overflows to a new row:
    //   Row 1: label (50px), Row 2: avg value (94px capped to 60), Row 3: min value → triggers 3rd row
    const result = computeHorizontalLegendRowCount(
      getMockedArgs({
        items,
        legendValues: [LegendValue.Average, LegendValue.Min],
        availableWidth: 60,
      }),
    );
    expect(result).toEqual({ isSingleLine: false, isMoreThanTwoLines: true });
  });

  describe('showValueTitle', () => {
    it('prepends title to value text when showValueTitle is true', () => {
      const values = [{ value: 100, label: '100', type: LegendValue.Average }];
      const items = [getMockedLegendItem('S', values), getMockedLegendItem('T', values)];

      const withoutTitle = computeHorizontalLegendRowCount(
        getMockedArgs({
          items,
          legendValues: [LegendValue.Average],
          availableWidth: 200,
          showValueTitle: false,
        }),
      );

      const withTitle = computeHorizontalLegendRowCount(
        getMockedArgs({
          items,
          legendValues: [LegendValue.Average],
          availableWidth: 200,
          showValueTitle: true,
        }),
      );

      // With title the value text becomes "AVG: 100" which is longer
      expect(withoutTitle).toEqual({ isSingleLine: true, isMoreThanTwoLines: false });
      expect(withTitle).toEqual({ isSingleLine: false, isMoreThanTwoLines: false });
    });
  });
});
