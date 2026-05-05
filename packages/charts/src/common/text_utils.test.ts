/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Font } from './text_utils';
import { fitText } from './text_utils';
import type { TextMeasure } from '../utils/bbox/canvas_text_bbox_calculator';

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

describe('fitText', () => {
  it('returns the full string when it already fits (end)', () => {
    expect(fitText(monospaceMeasure, 'abc', 10, fontSize, font, 'end')).toEqual({
      width: 3,
      text: 'abc',
    });
  });

  it('truncates at the end with an ellipsis when width is constrained', () => {
    expect(fitText(monospaceMeasure, 'abcdef', 4, fontSize, font, 'end')).toEqual({
      width: 4,
      text: 'abc…',
    });
  });

  it('truncates at the start when position is start', () => {
    expect(fitText(monospaceMeasure, 'abcdef', 4, fontSize, font, 'start')).toEqual({
      width: 4,
      text: '…def',
    });
  });

  it('truncates in the middle when position is middle', () => {
    expect(fitText(monospaceMeasure, 'abcdef', 4, fontSize, font, 'middle')).toEqual({
      width: 4,
      text: 'ab…f',
    });
  });
});
