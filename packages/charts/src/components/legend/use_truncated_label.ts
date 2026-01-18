/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { Font } from '../../common/text_utils';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';

const ELLIPSIS = '…';

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
 * Simple middle truncation based on character count.
 * Splits the label to show beginning and end with ellipsis in the middle.
 */
function truncateMiddle(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  if (maxChars < 2) return ELLIPSIS;

  // Reserve 1 char for ellipsis
  const availableChars = maxChars - 1;
  const startChars = Math.ceil(availableChars / 2);
  const endChars = Math.floor(availableChars / 2);

  return `${label.slice(0, startChars)}${ELLIPSIS}${label.slice(-endChars)}`;
}

/**
 * Hook to compute middle-truncated label text based on container width.
 * Uses average character width estimation for a simple and efficient approach (O(1) complexity).
 *
 * Middle truncation preserves both the beginning and end of the label text.
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

  const computeTruncatedLabel = useCallback(() => {
    if (!shouldTruncate || maxLines === 0) {
      setTruncatedLabel(label);
      return;
    }

    const element = labelRef.current;
    if (!element) {
      setTruncatedLabel(label);
      return;
    }

    const computedStyle = window.getComputedStyle(element);
    const { font, fontSize } = getFontFromComputedStyle(computedStyle);
    const containerWidth = element.clientWidth;

    if (containerWidth <= 0) {
      setTruncatedLabel(label);
      return;
    }

    const result = withTextMeasure((measure) => {
      const fullTextWidth = measure(label, font, fontSize).width;

      // If text fits, no truncation needed
      if (fullTextWidth <= containerWidth * maxLines) {
        return label;
      }

      // Use average character width estimation - simple and loop-free
      const avgCharWidth = measure('x', font, fontSize).width;
      const charsPerLine = Math.floor(containerWidth / avgCharWidth);
      const totalChars = charsPerLine * maxLines;

      return truncateMiddle(label, totalChars);
    });

    setTruncatedLabel(result);
  }, [label, maxLines, shouldTruncate]);

  useLayoutEffect(() => {
    if (!shouldTruncate) {
      setTruncatedLabel(label);
      return;
    }

    computeTruncatedLabel();

    const element = labelRef.current;
    if (!element) return;

    // Use ResizeObserver to recompute on size changes
    const resizeObserver = new ResizeObserver(() => {
      computeTruncatedLabel();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [computeTruncatedLabel, shouldTruncate, label]);

  return {
    labelRef: shouldTruncate ? labelRef : undefined,
    truncatedLabel,
  };
}
