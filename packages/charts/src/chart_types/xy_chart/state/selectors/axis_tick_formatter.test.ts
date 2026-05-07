/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { withTickLabelTruncation } from './axis_tick_formatter';
import { fitText } from '../../../../common/text_utils';

jest.mock('../../../../common/text_utils', () => ({
  ...jest.requireActual('../../../../common/text_utils'),
  fitText: jest.fn(),
}));

describe('withTickLabelTruncation', () => {
  const measure: TextMeasure = jest.fn(() => ({ width: 0, height: 0 }));
  const input = 'abcdefghijklmnopqrstuvwxyz';
  const formatter = () => input;
  const fitTextMock = fitText as jest.MockedFunction<typeof fitText>;

  beforeEach(() => {
    fitTextMock.mockReturnValue({ width: 10, text: 'truncated' });
  });

  afterEach(() => {
    fitTextMock.mockReset();
  });

  test('uses width when only width is provided', () => {
    const tickLabel = {
      ...LIGHT_THEME.axes.tickLabel,
      truncation: { width: 120 },
    };

    const truncated = withTickLabelTruncation(measure, tickLabel, 400)(formatter);
    expect(truncated(1)).toBe('truncated');
    expect(fitTextMock).toHaveBeenCalledWith(
      measure,
      input,
      120,
      tickLabel.fontSize,
      expect.any(Object),
      'end',
    );
  });

  test('uses relative width when only relative is provided', () => {
    const tickLabel = {
      ...LIGHT_THEME.axes.tickLabel,
      truncation: { relative: 0.25, position: 'middle' as const },
    };

    const truncated = withTickLabelTruncation(measure, tickLabel, 400)(formatter);
    expect(truncated(1)).toBe('truncated');
    expect(fitTextMock).toHaveBeenCalledWith(
      measure,
      input,
      100,
      tickLabel.fontSize,
      expect.any(Object),
      'middle',
    );
  });

  test('uses max of width and relative width when both are provided', () => {
    const tickLabel = {
      ...LIGHT_THEME.axes.tickLabel,
      truncation: { width: 90, relative: 0.3, position: 'start' as const },
    };

    const truncated = withTickLabelTruncation(measure, tickLabel, 400)(formatter);
    expect(truncated(1)).toBe('truncated');
    expect(fitTextMock).toHaveBeenCalledWith(
      measure,
      input,
      120,
      tickLabel.fontSize,
      expect.any(Object),
      'start',
    );
  });

  test('returns original formatter when no width and relative are provided', () => {
    const tickLabel = {
      ...LIGHT_THEME.axes.tickLabel,
      truncation: {},
    };

    const truncated = withTickLabelTruncation(measure, tickLabel, 400)(formatter);
    expect(truncated(1)).toBe(input);
    expect(fitTextMock).not.toHaveBeenCalled();
  });
});
