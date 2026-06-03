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

  it('truncates in the middle when maxLines is exceeded', () => {
    const lines = wrapText('abcdef', font, fontSize, 4, 1, monospaceMeasure, 'en', 'word', 'middle');
    expect(lines.meta.truncated).toBe(true);
    expect([...lines]).toEqual(['ab…f']);
  });

  it('fits to maxLineWidth * maxLines then re-wraps for multi-line middle truncation', () => {
    const lines = wrapText('one two three four', font, fontSize, 5, 2, monospaceMeasure, 'en', 'word', 'middle');
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBe(2);
    expect(lines.join('')).toBe('one t…four');
  });

  it('truncates at the end when word wrap needs more lines than a single-line width budget allows', () => {
    const lines = wrapText(
      'this is an even longer category name',
      font,
      fontSize,
      18,
      2,
      monospaceMeasure,
      'en',
      'word',
      'end',
    );
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.at(-1)).toMatch(/…$/);
  });

  it('truncates at the start when word wrap needs more lines than a single-line width budget allows', () => {
    const lines = wrapText(
      'this is an even longer category name',
      font,
      fontSize,
      18,
      2,
      monospaceMeasure,
      'en',
      'word',
      'start',
    );
    expect(lines.meta.truncated).toBe(true);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines[0]).toMatch(/^…/);
  });
});
