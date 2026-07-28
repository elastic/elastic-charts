/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { wrapText } from './wrap';
import type { Font } from '../../common/text_utils';
import type { TextMeasure } from '../bbox/canvas_text_bbox_calculator';

const monospaceMeasure: TextMeasure = (text) => ({
  width: text.length,
  height: 12,
});

const font: Font = {
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontWeight: 400,
  fontFamily: 'sans-serif',
  textColor: '#000',
};

const fontSize = 12;

describe('wrapText', () => {
  it('returns the full text without truncation when it fits within maxLines', () => {
    const lines = wrapText('hello', font, fontSize, 100, 5, monospaceMeasure, 'en');
    expect([...lines]).toEqual(['hello']);
    expect(lines.meta.truncated).toBe(false);
  });

  it('keeps the full text on an overflowing last line when truncation is disabled', () => {
    const lines = wrapText('one two three four', font, fontSize, 5, 2, monospaceMeasure, 'en', 'word', false);
    expect(lines.meta.truncated).toBe(false);
    expect(lines.length).toBe(2);
    expect(lines.join('')).toBe('one two three four');
  });

  it('defaults to end truncation when maxLines is exceeded', () => {
    const lines = wrapText('abcdef', font, fontSize, 4, 1, monospaceMeasure, 'en');
    expect(lines.meta.truncated).toBe(true);
    expect([...lines]).toEqual(['abc…']);
  });

  it('truncates at the end when maxLines is exceeded', () => {
    const lines = wrapText('abcdef', font, fontSize, 4, 1, monospaceMeasure, 'en', 'word', 'end');
    expect(lines.meta.truncated).toBe(true);
    expect([...lines]).toEqual(['abc…']);
  });

  it('truncates at the start when maxLines is exceeded', () => {
    const lines = wrapText('abcdef', font, fontSize, 4, 1, monospaceMeasure, 'en', 'word', 'start');
    expect(lines.meta.truncated).toBe(true);
    expect([...lines]).toEqual(['…def']);
  });

  it('marks overflowing full text as not truncated when too few characters would be hidden', () => {
    const lines = wrapText('abcdef', font, fontSize, 5, 1, monospaceMeasure, 'en', 'word', 'end', {
      min: { visible: 4, hidden: 3 },
      overflow: true,
    });
    expect(lines.meta.truncated).toBe(false);
    expect([...lines]).toEqual(['abcdef']);
  });

  it('fits to maxLineWidth * maxLines then re-wraps for multi-line middle truncation', () => {
    const lines = wrapText('one two three four', font, fontSize, 5, 2, monospaceMeasure, 'en', 'word', 'middle');
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBe(2);
    expect(lines.join('')).toBe('one t…four');
  });

  it('relaxes the min visible characters to stay within maxLines when overflow is not explicitly enabled (middle)', () => {
    const lines = wrapText('abcdefghijklmnop', font, fontSize, 2, 2, monospaceMeasure, 'en', 'word', 'middle', {
      min: { visible: 5 },
    });
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBe(2);
    expect(lines.join('')).toBe('ab…p');
  });

  it('never wraps past maxLines when the min visible forces overflow (middle)', () => {
    // maxLineWidth * maxLines = 4 can't fit the 5-char min, so the last line must overflow
    // horizontally rather than the label wrapping onto a third line.
    const lines = wrapText('abcdefghijklmnop', font, fontSize, 2, 2, monospaceMeasure, 'en', 'word', 'middle', {
      min: { visible: 5 },
      overflow: true,
    });
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBe(2);
    expect(lines.at(-1)).toBe('c…op');
    expect(lines.join('')).toBe('abc…op');
  });
});
