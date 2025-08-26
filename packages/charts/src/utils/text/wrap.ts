/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Font } from '../../common/text_utils';
import { monotonicHillClimb } from '../../solvers/monotonic_hill_climb';
import type { TextMeasure } from '../bbox/canvas_text_bbox_calculator';

const ELLIPSIS = '…';

interface WrapTextLines extends Array<string> {
  meta: {
    truncated: boolean;
  };
}

type Granularity = 'grapheme' | 'word' | 'sentence';

/** @internal */
export function wrapText(
  text: string,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  maxLines: number,
  measure: TextMeasure,
  locale: string,
  granularity: Granularity = 'word',
): WrapTextLines {
  const lines: WrapTextLines = [] as any;
  lines.meta = {
    truncated: false,
  };

  if (maxLines <= 0) {
    return lines;
  }
  const segmenter = textSegmenter(locale, granularity);
  // remove new lines and multi-spaces.
  const cleanedText = text.replaceAll('\n', ' ').replaceAll(/ +(?= )/g, '');

  const segments = Array.from(segmenter(cleanedText)).map((d) => ({
    ...d,
    width: measure(d.segment, font, fontSize).width,
  }));

  const ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
  let currentLineWidth = 0;
  for (const segment of segments) {
    // the word is longer then the available space and is not a space
    if (currentLineWidth + segment.width > maxLineWidth && segment.segment.trimStart().length > 0) {
      // TODO call breakLongTextIntoLines with the remaining lines
      const multilineText = breakLongTextIntoLines(segment.segment, font, fontSize, maxLineWidth, Infinity, measure);
      // required to break the loop when a word can't fit into the next line. In this case, we don't want to skip that
      // long word, but we want to interrupt the loop
      if (multilineText.length === 0) {
        break;
      }
      lines.push(...multilineText);
      currentLineWidth = multilineText.length > 0 ? measure(multilineText.at(-1) ?? '', font, fontSize).width : 0;
    } else {
      const lineIndex = lines.length > 0 ? lines.length - 1 : 0;
      lines[lineIndex] = (lines[lineIndex] ?? '') + segment.segment;
      currentLineWidth += segment.width;
    }
  }
  if (lines.length > maxLines) {
    lines.meta.truncated = true;
    const lastLineMaxLineWidth = maxLineWidth - ellipsisWidth;
    const lineToTruncate = lines[maxLines - 1] ?? '';
    const lastLine = clipTextToWidth(lineToTruncate, font, fontSize, lastLineMaxLineWidth, measure);
    if (lastLine.length > 0) {
      lines.splice(maxLines - 1, Infinity, `${lastLine}${ELLIPSIS}`);
    } else {
      if (lastLineMaxLineWidth > 0) {
        // Not enough space for both a character and ellipsis; if 1 line → first char; if >1 lines → only ellipsis
        lines.splice(maxLines - 1, Infinity, maxLines > 1 ? ELLIPSIS : lineToTruncate.slice(0, 1));
      } else {
        lines.splice(maxLines, Infinity);
      }
    }
  }
  return lines;
}

function textSegmenter(
  locale: string,
  granularity: Granularity,
): (text: string) => { segment: string; index: number; isWordLike?: boolean }[] {
  if ('Segmenter' in Intl) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const fn = new Intl.Segmenter(locale, { granularity });
    return (text: string) => Array.from(fn.segment(text));
  } else {
    return (text: string) => {
      return text
        .split(' ')
        .reduce<{ segment: string; index: number; isWordLike?: boolean }[]>((acc, segment, index, array) => {
          const currentSegment = {
            segment,
            index: index === 0 ? 0 : (acc.at(-1)?.index ?? 0) + 1,
            isWordLike: true,
          };
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
