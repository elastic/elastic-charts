/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fitText, type Font, type TruncateConfig } from '../../common/text_utils';
import { monotonicHillClimb } from '../../solvers/monotonic_hill_climb';
import type { TextMeasure } from '../bbox/canvas_text_bbox_calculator';
import type { Truncate } from '../themes/theme';

/** @internal */
export interface WrapTextLines extends Array<string> {
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
  truncate: Truncate | false = 'end',
  truncateConfig?: TruncateConfig,
): WrapTextLines {
  if (maxLines <= 0) return Object.assign([], { meta: { truncated: false } });

  const cleanedText = text.replaceAll('\n', ' ').replaceAll(/ +(?= )/g, '');
  const lines = wrapTextLines(cleanedText, font, fontSize, maxLineWidth, measure, locale, granularity);

  if (lines.length <= maxLines) return Object.assign(lines, { meta: { truncated: false } });

  if (!truncate) {
    const head = lines.slice(0, Math.max(0, maxLines - 1));
    const overflow = lines.slice(Math.max(0, maxLines - 1)).join('');
    return Object.assign([...head, overflow], { meta: { truncated: false } });
  }

  // 'end' and 'start' truncate at a line edge, so we keep the wrapped lines on the visible
  // side intact and only fit the one that shares its line with the ellipsis.
  if (truncate === 'end' || truncate === 'start') {
    return truncateLinesAtEdge(lines, maxLines, font, fontSize, maxLineWidth, measure, truncate, truncateConfig);
  }

  // find the width of the text that will fit within the maxLineWidth * maxLines budget
  const allottedWidth = findAllottedWidth(
    cleanedText,
    font,
    fontSize,
    maxLineWidth,
    maxLines,
    measure,
    locale,
    granularity,
    truncate,
  );

  // truncate the text to the allotted width
  const { text: truncatedText } = fitText(
    measure,
    cleanedText,
    allottedWidth,
    fontSize,
    font,
    truncate,
    truncateConfig,
  );

  // wrap the truncated text to the maxLineWidth
  const rewrapped = wrapTextLines(truncatedText, font, fontSize, maxLineWidth, measure, locale, granularity);

  // options.overflow could keep more text than the budget search assumed which would make rewrap go over
  // maxLines. So we need to fold the overflown lines into the last visible line and let it overflow horizontally.
  if (rewrapped.length > maxLines) {
    if (!truncateConfig?.overflow) {
      const { text: fittedText } = fitText(measure, cleanedText, allottedWidth, fontSize, font, truncate);
      const fittedLines = wrapTextLines(fittedText, font, fontSize, maxLineWidth, measure, locale, granularity);
      return Object.assign(fittedLines, { meta: { truncated: fittedText !== cleanedText } });
    }

    const head = rewrapped.slice(0, maxLines - 1);
    const lastLine = rewrapped.slice(maxLines - 1).join('');
    return Object.assign([...head, lastLine], { meta: { truncated: truncatedText !== cleanedText } });
  }

  return Object.assign(rewrapped, { meta: { truncated: truncatedText !== cleanedText } });
}

function truncateLinesAtEdge(
  lines: string[],
  maxLines: number,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  measure: TextMeasure,
  edge: 'start' | 'end',
  truncateConfig?: TruncateConfig,
): WrapTextLines {
  const overflow =
    edge === 'end' ? lines.slice(maxLines - 1).join('') : lines.slice(0, lines.length - maxLines + 1).join('');
  const { text: truncatedLine } = fitText(measure, overflow, maxLineWidth, fontSize, font, edge, truncateConfig);
  const result =
    edge === 'end'
      ? [...lines.slice(0, maxLines - 1), truncatedLine]
      : [truncatedLine, ...lines.slice(lines.length - maxLines + 1)];
  return Object.assign(result, { meta: { truncated: truncatedLine !== overflow } });
}

function findAllottedWidth(
  cleanedText: string,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  maxLines: number,
  measure: TextMeasure,
  locale: string,
  granularity: Granularity,
  truncate: Truncate,
): number {
  const wrapLineCount = (budget: number) =>
    wrapTextLines(
      fitText(measure, cleanedText, budget, fontSize, font, truncate).text,
      font,
      fontSize,
      maxLineWidth,
      measure,
      locale,
      granularity,
    ).length;

  const maxBudget = maxLineWidth * maxLines;
  const allottedWidth = monotonicHillClimb(wrapLineCount, maxBudget, maxLines, (n) => n, 0);

  return allottedWidth;
}

function wrapTextLines(
  cleanedText: string,
  font: Font,
  fontSize: number,
  maxLineWidth: number,
  measure: TextMeasure,
  locale: string,
  granularity: Granularity,
): string[] {
  const lines: string[] = [];

  const segmenter = textSegmenter(locale, granularity);
  const segments = Array.from(segmenter(cleanedText)).map((d) => ({
    ...d,
    width: measure(d.segment, font, fontSize).width,
  }));

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
