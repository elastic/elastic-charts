/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Font } from '../../common/text_utils';
import { monotonicHillClimb } from '../../solvers/monotonic_hill_climb';
import { TextMeasure } from '../bbox/canvas_text_bbox_calculator';

/** @internal */
export function textSegmenter(
  granularity: 'word' | 'grapheme',
  locale: string[],
): (text: string) => { segment: string; index: number; isWordLike?: boolean }[] {
  if ('Segmenter' in Intl) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const fn = new Intl.Segmenter(locale, { granularity });
    return (text: string) => Array.from(fn.segment(text));
  } else {
    return function (text: string) {
      return text.split(' ').map((segment, index) => {
        return { segment, index, isWordLike: true };
      });
    };
  }
}

/** @internal */
export function wrapText(
  text: string,
  measure: TextMeasure,
  lineHeight: number,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  maxLines: number,
): string[] {
  if (maxLines <= 0) {
    return [];
  }
  const segmenter = textSegmenter('word', []);
  // remove new lines and multi-spaces.
  const cleanedText = text.replace(/\n/g, ' ').replace(/ +(?= )/g, '');
  const segments = Array.from(segmenter(cleanedText)).map((d) => ({
    ...d,
    width: measure(d.segment, font, fontSize, lineHeight).width,
  }));
  const ELLIPSIS = '…';
  const ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
  const lines: string[] = [];
  let currentLineWidth = 0;
  for (const segment of segments) {
    if (segment.width + currentLineWidth > maxLineWidth) {
      const breakupWords = breakLongWordIntoLines(
        segment.segment,
        measure,
        lineHeight,
        font,
        fontSize,
        maxLineWidth,
        Infinity,
      );
      lines.push(...breakupWords);
      currentLineWidth =
        breakupWords.length > 0 ? measure(breakupWords[breakupWords.length - 1], font, fontSize, lineHeight).width : 0;
    } else {
      if (lines.length === 0) {
        lines.push(segment.segment.trimStart());
        currentLineWidth += measure(segment.segment.trimStart(), font, fontSize, lineHeight).width;
      } else {
        lines[lines.length - 1] += segment.segment;
        currentLineWidth += segment.width;
      }
    }
  }
  if (lines.length > maxLines) {
    const lastLineMaxLineWidth = maxLineWidth - ellipsisWidth;
    const lastLine = breakLongWord(lines[maxLines - 1], measure, lineHeight, font, fontSize, lastLineMaxLineWidth);
    if (lastLine.length > 0) {
      lines.splice(maxLines - 1, Infinity, `${lastLine[0]}${ELLIPSIS}`);
    } else {
      if (lastLineMaxLineWidth > 0) {
        lines.splice(maxLines - 1, Infinity, ELLIPSIS);
      } else {
        lines.splice(maxLines, Infinity);
      }
    }
  }
  return lines;
}

/** @internal */
export function breakLongWordIntoLines(
  word: string,
  measure: TextMeasure,
  lineHeight: number,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  maxLines: number, // just for optimization
) {
  const lines: string[] = [];
  let currentWordSection = word;
  while (maxLines > lines.length && currentWordSection.length > 0) {
    const line = breakLongWord(currentWordSection, measure, lineHeight, font, fontSize, maxLineWidth);
    if (line.length === 0) {
      break;
    } else {
      lines.push(line[0].trimStart());
      currentWordSection = currentWordSection.slice(line[0].length, Infinity);
    }
  }
  return lines;
}

/** @internal */
export function breakLongWord(
  word: string,
  measure: TextMeasure,
  lineHeight: number,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
): string[] {
  const maxCharsInLine = monotonicHillClimb(
    (chars) => measure(word.slice(0, chars), font, fontSize, lineHeight).width,
    word.length,
    maxLineWidth,
    (n: number) => Math.floor(n),
    0,
  );

  if (maxCharsInLine === 0) {
    return [];
  }

  if (maxCharsInLine < word.length) {
    return [word.slice(0, maxCharsInLine)];
  }

  if (Number.isNaN(maxCharsInLine)) {
    return [];
  }
  return [word];
}
