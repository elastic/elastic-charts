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

  describe('minimum readable truncation', () => {
    it('keeps at least the min visible chars and overflows rather than truncating shorter (end)', () => {
      expect(
        fitText(monospaceMeasure, 'abcdefghij', 3, fontSize, font, 'end', {
          min: { visible: 5 },
          overflow: true,
        }),
      ).toEqual({
        width: 6,
        text: 'abcde…',
      });
    });

    it('keeps the min visible chars split on both sides for middle truncation', () => {
      expect(
        fitText(monospaceMeasure, 'abcdefghij', 3, fontSize, font, 'middle', {
          min: { visible: 5 },
          overflow: true,
        }),
      ).toEqual({
        width: 6,
        text: 'abc…ij',
      });
    });

    it('still fits within the budget when more than the min visible chars fits', () => {
      expect(
        fitText(monospaceMeasure, 'abcdefghij', 6, fontSize, font, 'end', {
          min: { visible: 5 },
          overflow: true,
        }),
      ).toEqual({
        width: 6,
        text: 'abcde…',
      });
    });

    it('does not returns an empty string when overflow is allowed', () => {
      const { text } = fitText(monospaceMeasure, 'abcdefghij', 0, fontSize, font, 'end', {
        min: { visible: 5 },
        overflow: true,
      });
      expect(text).toBe('abcde…');
    });

    it('does not truncate when it would hide fewer than 3 characters (overflows in full instead)', () => {
      // Budget of 5 would keep "abcd…" (4 visible), hiding only 2 chars, not enough for an ellipsis.
      expect(
        fitText(monospaceMeasure, 'abcdef', 5, fontSize, font, 'end', {
          min: { visible: 4, hidden: 3 },
          overflow: true,
        }),
      ).toEqual({
        width: 6,
        text: 'abcdef',
      });
    });

    it('truncates once it hides at least 3 characters', () => {
      // "abcdefg" (7) kept at the min visible chars of 4 hides that hides 3 chars.
      expect(
        fitText(monospaceMeasure, 'abcdefg', 5, fontSize, font, 'end', {
          min: { visible: 4, hidden: 3 },
          overflow: true,
        }),
      ).toEqual({
        width: 5,
        text: 'abcd…',
      });
    });

    it('relaxes the visible chars when overflow is disabled and the min visible chars does not fit', () => {
      // Without overflow, min visible chars loses to the allotted width.
      expect(fitText(monospaceMeasure, 'abcdefghij', 3, fontSize, font, 'end', { min: { visible: 5 } })).toEqual({
        width: 3,
        text: 'ab…',
      });
    });

    it('relaxes the hidden chars when overflow is disabled', () => {
      // 5 keeps "abcd…" that only hides 2 chars, but fitting wins if overflow is not enabled.
      expect(fitText(monospaceMeasure, 'abcdef', 5, fontSize, font, 'end', { min: { visible: 4, hidden: 3 } })).toEqual(
        {
          width: 5,
          text: 'abcd…',
        },
      );
    });
  });
});
