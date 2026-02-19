/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { startTransition as reactStartTransition, useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { Font } from '../../common/text_utils';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';

const ELLIPSIS = '…';
const MAX_MEASURE_ITERATIONS = 5;
const MIN_MIDDLE_TRUNCATION_CHARS = 4; // Minimum chars (available width) to consider middle truncation (2 on each side)

// React 18+ startTransition for low-priority updates, fallback to direct execution for React 16/17
const startTransition = reactStartTransition ?? ((fn: () => void) => fn());

interface UseMiddleTruncatedLabelProps {
  label: string;
  maxLines: number;
  /**
   * When true, applies middle truncation via JS.
   * When false, returns the original label (CSS will handle end truncation).
   */
  shouldTruncate: boolean;
}

interface UseMiddleTruncatedLabelResult {
  /** Ref to attach to the label element. Undefined when truncation is disabled. */
  labelRef: React.RefObject<HTMLDivElement> | undefined;
  /** The truncated label - middle (JS) or end (CSS) truncated based on shouldTruncate */
  truncatedLabel: string;
  /** Whether the JS truncation computation has completed */
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
 * Uses iterative refinement for accurate text fitting.
 *
 * Initially renders the full label (CSS handles end truncation), then
 * computes the middle-truncated version asynchronously via requestAnimationFrame.
 *
 * @internal
 */
export function useMiddleTruncatedLabel({
  label,
  maxLines,
  shouldTruncate,
}: UseMiddleTruncatedLabelProps): UseMiddleTruncatedLabelResult {
  const labelRef = useRef<HTMLDivElement>(null);
  const [truncatedLabel, setTruncatedLabel] = useState(label);
  const [isComputed, setIsComputed] = useState(false);

  const computeTruncatedLabel = useCallback(() => {
    if (!shouldTruncate || maxLines === 0) {
      setTruncatedLabel(label);
      setIsComputed(true);
      return;
    }

    const element = labelRef.current;
    if (!element) {
      setTruncatedLabel(label);
      setIsComputed(false);
      return;
    }

    const computedStyle = window.getComputedStyle(element);
    const { font, fontSize } = getFontFromComputedStyle(computedStyle);
    const containerWidth = element.clientWidth;

    if (containerWidth <= 0) {
      setTruncatedLabel(label);
      setIsComputed(false);
      return;
    }

    const availableWidth = containerWidth * maxLines;

    const result = withTextMeasure((measure) => {
      const fullTextWidth = measure(label, font, fontSize).width;

      // If text fits, no truncation needed
      if (fullTextWidth <= availableWidth) {
        return label;
      }

      return fitMiddleTruncation(label, availableWidth, measure, font, fontSize);
    });

    setTruncatedLabel(result);
    setIsComputed(true);
  }, [label, maxLines, shouldTruncate]);

  useLayoutEffect(() => {
    if (!shouldTruncate) {
      setTruncatedLabel(label);
      setIsComputed(true);
      return;
    }

    // Reset state: show full label with CSS truncation until computed
    setTruncatedLabel(label);
    setIsComputed(false);

    // Track rAF IDs to cancel pending computations
    let rafId = 0;
    let resizeRafId = 0;

    // Defer computation to next frame, marked as low-priority transition in React 18+
    rafId = requestAnimationFrame(() => {
      startTransition(() => {
        computeTruncatedLabel();
      });
    });

    const element = labelRef.current;
    if (!element) {
      return () => cancelAnimationFrame(rafId);
    }

    // Per-element ResizeObserver is necessary since label width varies by rendering mode (list, table, horizontal)
    const resizeObserver = new ResizeObserver(() => {
      setIsComputed(false);
      // Cancel any pending resize computation to avoid queuing multiple calls
      cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        startTransition(() => {
          computeTruncatedLabel();
        });
      });
    });

    resizeObserver.observe(element);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRafId);
      resizeObserver.disconnect();
    };
  }, [computeTruncatedLabel, shouldTruncate, label]);

  return {
    labelRef: shouldTruncate ? labelRef : undefined,
    truncatedLabel,
    isComputed,
  };
}
