/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLegendTableSize } from './get_legend_table_size';
import { LEGEND_TO_FULL_CONFIG } from '../../components/legend/position_style';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../utils/common';
import { LIGHT_THEME } from '../../utils/themes/light_theme';

type Args = Parameters<typeof getLegendTableSize>;

// Deterministic text measure: height is fontSize * lineHeight, like the real canvas measure.
const fakeTextMeasure = ((text: string, _font: unknown, fontSize: number, lineHeight: number) => ({
  width: text.length * 7,
  height: fontSize * lineHeight,
})) as unknown as TextMeasure;

const horizontalConfig = {
  legendSize: NaN,
  legendValues: ['average', 'min', 'max'],
  legendPosition: LEGEND_TO_FULL_CONFIG[Position.Bottom],
  legendAction: undefined,
  legendTitle: '',
} as unknown as Args[0];

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    label: `series-${i}`,
    values: [{ label: '1.00' }, { label: '2.00' }, { label: '3.00' }],
  })) as unknown as Args[3];

const parentDimensions = { width: 800, height: 300, left: 0, top: 0 };

describe('Legend table size - horizontal legend', () => {
  // Legend cells render with `line-height: 18px`, 4px vertical padding and a 1px border,
  // so a row is 18 + 8 + 1 = 27px. The table adds 8px of padding.
  it('is 62px for a single series (header + 1 row), so no scrollbar appears', () => {
    const { height } = getLegendTableSize(
      horizontalConfig,
      LIGHT_THEME,
      parentDimensions,
      makeItems(1),
      fakeTextMeasure,
    );
    expect(height).toBe(62);
  });

  it('adds 27px for each additional visible row', () => {
    const { height } = getLegendTableSize(
      horizontalConfig,
      LIGHT_THEME,
      parentDimensions,
      makeItems(3),
      fakeTextMeasure,
    );
    expect(height).toBe(4 * 27 + 8);
  });
});