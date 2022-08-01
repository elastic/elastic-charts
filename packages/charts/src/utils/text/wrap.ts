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

const ELLIPSIS = '…';

/** @internal */
export function wrapText(
  text: string,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  maxLines: number,
  measure: TextMeasure,
): string[] {
  if (maxLines <= 0) {
    return [];
  }
  // TODO add locale
  const segmenter = textSegmenter([]);
  // remove new lines and multi-spaces.
  const cleanedText = text.replace(/\n/g, ' ').replace(/ +(?= )/g, '');

  const segments = Array.from(segmenter(cleanedText)).map((d) => ({
    ...d,
    width: measure(d.segment, font, fontSize).width,
  }));

  const ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
  const lines: string[] = [];
  let currentLineWidth = 0;
  for (const segment of segments) {
    // the word is longer then the available space and is not a space
    if (currentLineWidth + segment.width > maxLineWidth && segment.segment.trimStart().length > 0) {
      // TODO call breakLongTextIntoLines with the remaining lines
      const breakupWords = breakLongTextIntoLines(segment.segment, font, fontSize, maxLineWidth, Infinity, measure);
      if (breakupWords.length === 0) {
        break;
      }
      lines.push(...breakupWords);
      currentLineWidth =
        breakupWords.length > 0 ? measure(breakupWords[breakupWords.length - 1], font, fontSize).width : 0;
    } else {
      if (lines.length === 0) {
        lines.push(segment.segment.trimStart());
        currentLineWidth += measure(segment.segment.trimStart(), font, fontSize).width;
      } else {
        lines[lines.length - 1] += segment.segment;
        currentLineWidth += segment.width;
      }
    }
  }
  if (lines.length > maxLines) {
    const lastLineMaxLineWidth = maxLineWidth - ellipsisWidth;
    const lastLine = clipTextToWidth(lines[maxLines - 1], font, fontSize, lastLineMaxLineWidth, measure);
    if (lastLine.length > 0) {
      lines.splice(maxLines - 1, Infinity, `${lastLine}${ELLIPSIS}`);
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

function textSegmenter(locale: string[]): (text: string) => { segment: string; index: number; isWordLike?: boolean }[] {
  if ('Segmenter' in Intl) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const fn = new Intl.Segmenter(locale, { granularity: 'word' });
    return (text: string) => Array.from(fn.segment(text));
  } else {
    return (text: string) => {
      return text
        .split(' ')
        .reduce<{ segment: string; index: number; isWordLike?: boolean }[]>((acc, segment, index, array) => {
          const currentSegment = { segment, index: index === 0 ? 0 : acc[acc.length - 1].index + 1, isWordLike: true };
          acc.push(currentSegment);
          // adding space to simulate the same behaviour of the segmenter in firefox
          if (index < array.length - 1) {
            acc.push({ segment: ' ', index: currentSegment.index + segment.length, isWordLike: false });
          }
          return acc;
        }, []);
    };
  }
}

function breakLongTextIntoLines(
  text: string,
  font: Font,
  fontSize: number,
  lineWidth: number,
  maxLines: number,
  measure: TextMeasure,
) {
  const lines: string[] = [];
  let remainingText = text;
  while (maxLines > lines.length && remainingText.length > 0) {
    const lineClippedText = clipTextToWidth(remainingText, font, fontSize, lineWidth, measure);
    if (lineClippedText.length === 0) {
      break;
    } else {
      lines.push(lineClippedText.trimStart());
      remainingText = remainingText.slice(lineClippedText.length, Infinity);
    }
  }
  return lines;
}

function clipTextToWidth(text: string, font: Font, fontSize: number, width: number, measure: TextMeasure): string {
  const maxCharsInLine = monotonicHillClimb(
    (chars) => measure(text.slice(0, chars), font, fontSize).width,
    text.length,
    width,
    (n: number) => Math.floor(n),
    0,
  );
  return text.slice(0, maxCharsInLine || 0);
}
