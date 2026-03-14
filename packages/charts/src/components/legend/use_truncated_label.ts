/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { startTransition as reactStartTransition, useLayoutEffect, useRef, useState } from 'react';

import type { Font } from '../../common/text_utils';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';

const ELLIPSIS = '…';
const MAX_MEASURE_ITERATIONS = 5;
const MIN_MIDDLE_TRUNCATION_CHARS = 4; // Minimum chars (available width) to consider middle truncation (2 on each side)

// React 18+ startTransition for low-priority updates, fallback to direct execution for React 16/17
const startTransition = reactStartTransition ?? ((fn: () => void) => fn());

/**
 * Returns a stable container width for truncation computation.
 * Prefers inline `maxWidth` (set in px truncation mode) as it is
 * content-independent. Falls back to `clientWidth` which, for flex items
 * with `overflow: hidden`, is decoupled from content width.
 */
function getStableContainerWidth(element: HTMLElement): number {
  const inlineMaxWidth = parseFloat(element.style.maxWidth);
  if (isFinite(inlineMaxWidth) && inlineMaxWidth > 0) {
    return inlineMaxWidth;
  }
  return element.clientWidth;
}

interface UseMiddleTruncatedLabelProps {
  label: string;
  maxLines: number;
  shouldTruncateMiddle: boolean;
}

interface UseMiddleTruncatedLabelResult {
  labelRef: React.RefObject<HTMLDivElement> | undefined;
  truncatedLabel: string;
  isComputed: boolean;
}

/**
 * Extracts font properties from computed styles to create a Font object
 * compatible with the TextMeasure utilities.
 */
function getFontFromComputedStyle(computedStyle: CSSStyleDeclaration): {
  font: Omit<Font, 'textColor'>;
  fontSize: number;
} {
  const fontSize = parseFloat(computedStyle.fontSize) || 12;
  const fontWeight = computedStyle.fontWeight as Font['fontWeight'];

  const font: Omit<Font, 'textColor'> = {
    fontStyle: (computedStyle.fontStyle || 'normal') as Font['fontStyle'],
    fontVariant: (computedStyle.fontVariant || 'normal') as Font['fontVariant'],
    fontWeight: fontWeight || 'normal',
    fontFamily: computedStyle.fontFamily || 'sans-serif',
  };

  return { font, fontSize };
}

/**
 * Builds a middle-truncated string from start and end portions with ellipsis.
 */
function buildTruncatedString(label: string, startChars: number, endChars: number): string {
  if (startChars + endChars >= label.length) return label;
  return `${label.slice(0, startChars)}${ELLIPSIS}${label.slice(-endChars)}`;
}

/**
 * Computes an accurately fitted middle-truncated label using iterative refinement.
 *
 * Algorithm:
 * 1. Start with an initial estimate based on average character width
 * 2. Measure the actual width and calculate remaining space
 * 3. Adjust character counts based on remaining space and average char width
 * 4. For odd positive adjustments, prefer adding to end; for odd negative, prefer subtracting from start
 * 5. Stop when text fits or max iterations reached
 */
function fitMiddleTruncation(
  label: string,
  availableWidth: number,
  measure: TextMeasure,
  font: Omit<Font, 'textColor'>,
  fontSize: number,
): string {
  const ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
  // Buffer ensures consistent right-side alignment and prevents CSS double truncation
  // Without this, Safari and Firefox are prone to double-truncate the text
  const buffer = ellipsisWidth;
  const targetWidth = availableWidth - buffer;

  if (targetWidth <= ellipsisWidth) return ELLIPSIS;

  // Calculate average character width for estimation
  const avgCharWidth = measure(label, font, fontSize).width / label.length;
  if (avgCharWidth <= 0) return ELLIPSIS;

  // Initial estimate: how many chars fit (excluding ellipsis width)
  const usableWidth = targetWidth - ellipsisWidth;
  const estimatedChars = Math.floor(usableWidth / avgCharWidth);
  if (estimatedChars >= label.length) return label;
  // If too few characters would fit, let CSS handle end truncation instead. This prevents '...x' effect.
  if (estimatedChars < MIN_MIDDLE_TRUNCATION_CHARS) return label;

  // Split evenly between start and end
  let startChars = Math.ceil(estimatedChars / 2);
  let endChars = Math.floor(estimatedChars / 2);

  for (let iteration = 0; iteration < MAX_MEASURE_ITERATIONS; iteration++) {
    const truncated = buildTruncatedString(label, startChars, endChars);
    const measuredWidth = measure(truncated, font, fontSize).width;
    // Compare against targetWidth (with buffer), not availableWidth
    const remainingSpace = targetWidth - measuredWidth;

    // Text fits within available width
    if (remainingSpace >= 0 && remainingSpace < avgCharWidth) {
      return truncated;
    }

    // Calculate adjustment based on remaining space
    const charAdjustment = Math.floor(Math.abs(remainingSpace) / avgCharWidth);

    if (charAdjustment === 0) {
      // No more adjustments possible
      if (remainingSpace >= 0) {
        return truncated;
      }
      // Text still exceeds, remove one char from start to ensure fit
      startChars = Math.max(0, startChars - 1);
      if (startChars + endChars === 0) return ELLIPSIS;
      continue;
    }

    if (remainingSpace > 0) {
      // Text is shorter than available, add characters
      const halfAdjust = Math.floor(charAdjustment / 2);
      const oddChar = charAdjustment % 2;
      // For odd positive chars, prefer adding at end
      startChars = Math.min(startChars + halfAdjust, label.length - endChars - 1);
      endChars = Math.min(endChars + halfAdjust + oddChar, label.length - startChars - 1);
    } else {
      // Text exceeds available width, remove characters
      const halfAdjust = Math.floor(charAdjustment / 2);
      const oddChar = charAdjustment % 2;
      // For odd negative chars, prefer subtracting from start
      startChars = Math.max(0, startChars - halfAdjust - oddChar);
      endChars = Math.max(0, endChars - halfAdjust);
    }

    // Safety: ensure we have at least some characters
    if (startChars + endChars === 0) return ELLIPSIS;
  }

  // Max iterations reached, return current result
  // Sub-pixel overflows (< 1px) are acceptable and handled gracefully by browser rendering
  return buildTruncatedString(label, startChars, endChars);
}

/**
 * Hook to compute middle-truncated label text based on container width.
 *
 * Runs on every render with an early bailout when the container width
 * hasn't changed.
 *
 * External resizes (window, chart, knobs) cause React re-renders via
 * Redux state updates, which should naturally re-trigger this measurement.
 *
 * @internal
 */
export function useMiddleTruncatedLabel({
  label,
  maxLines,
  shouldTruncateMiddle,
}: UseMiddleTruncatedLabelProps): UseMiddleTruncatedLabelResult {
  const labelRef = useRef<HTMLDivElement>(null);
  const [truncatedLabel, setTruncatedLabel] = useState(label);
  const [isComputed, setIsComputed] = useState(false);
  const lastWidthRef = useRef<number>(0);
  const lastLabelRef = useRef<string>(label);
  const lastMaxLinesRef = useRef<number>(maxLines);

  // Intentionally no dependency array: must re-evaluate on every render to detect
  // external container width changes (chart resize, legend size knobs, etc.) that
  // don't change our props. The early bailout when width is unchanged keeps this cheap.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!shouldTruncateMiddle) {
      setTruncatedLabel(label);
      setIsComputed(true);
      lastWidthRef.current = 0;
      lastLabelRef.current = label;
      lastMaxLinesRef.current = maxLines;
      return;
    }

    const element = labelRef.current;
    if (!element) return;

    const width = getStableContainerWidth(element);
    const labelChanged = label !== lastLabelRef.current;
    const maxLinesChanged = maxLines !== lastMaxLinesRef.current;

    if (width > 0 && width === lastWidthRef.current && !labelChanged && !maxLinesChanged && isComputed) {
      return;
    }

    if (labelChanged) {
      setTruncatedLabel(label);
      setIsComputed(false);
      lastLabelRef.current = label;
    }

    if (maxLinesChanged) {
      setIsComputed(false);
      lastMaxLinesRef.current = maxLines;
    }

    lastWidthRef.current = width;

    if (width <= 0) return;

    const rafId = requestAnimationFrame(() => {
      startTransition(() => {
        const el = labelRef.current;
        if (!el) return;

        const computedStyle = window.getComputedStyle(el);
        const { font, fontSize } = getFontFromComputedStyle(computedStyle);
        const containerWidth = getStableContainerWidth(el);

        if (containerWidth <= 0) return;

        lastWidthRef.current = containerWidth;
        const availableWidth = containerWidth * maxLines;

        const result = withTextMeasure((measure) => {
          const fullTextWidth = measure(label, font, fontSize).width;
          if (fullTextWidth <= availableWidth) return label;
          return fitMiddleTruncation(label, availableWidth, measure, font, fontSize);
        });

        setTruncatedLabel(result);
        setIsComputed(true);
      });
    });

    return () => cancelAnimationFrame(rafId);
  });

  return {
    labelRef: shouldTruncateMiddle ? labelRef : undefined,
    truncatedLabel,
    isComputed,
  };
}
