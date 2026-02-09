/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import type { LegendItem } from '../../common/legend';
import { LegendValue, legendValueTitlesMap } from '../../common/legend';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { isDefined } from '../../utils/common';

/**
 * Compute how many rows a wrapping flex container will use.
 *
 * The `column-gap` applies **between** items, not at the beginning of a row.
 *
 * @internal
 */
export function computeWrappedRowCount(itemWidths: number[], availableWidth: number, columnGap: number): number {
  if (itemWidths.length === 0) {
    return 1;
  }

  let numRows = 1;
  let currentRowWidth = 0;

  for (const rawItemWidth of itemWidths) {
    const itemWidth = Math.max(0, rawItemWidth);
    const nextRowWidth = currentRowWidth === 0 ? itemWidth : currentRowWidth + columnGap + itemWidth;

    // Only wrap when there is already something on the current row.
    // A single over-wide item still occupies a single row (it can overflow/scroll).
    if (nextRowWidth > availableWidth && currentRowWidth > 0) {
      numRows++;
      currentRowWidth = itemWidth;
    } else {
      currentRowWidth = nextRowWidth;
    }
  }

  return numRows;
}

/** @internal */
export interface HorizontalLegendRowCountArgs {
  /** Legend items being rendered */
  items: LegendItem[];
  /**
   * Legend values configured to show (affects extra columns rendered in list layout).
   * This is the same `legendValues` from the legend spec.
   */
  legendValues: LegendValue[];
  /** Available width for the wrapping `<ul>` */
  availableWidth: number;
  /** The `column-gap` used by the wrapping `<ul>` (px) */
  columnGap: number;
  /** Static buffer added between label and values (px) */
  spacingBuffer: number;
  /** Optional action column width (px) */
  actionDimension: number;
  /** Color marker width (px) */
  markerWidth: number;
  /** Shared per-item margin used in sizing math (px) */
  sharedMargin: number;
  /** Pixel width cap applied to the label in list layout (0 disables truncation) */
  widthLimit: number;
  /** Whether legend values include titles (eg `VALUE: 10`) */
  showValueTitle: boolean;
  /** Text measurement function to avoid DOM dependencies */
  textMeasure: TextMeasure;
}

/**
 * Compute row count for the horizontal legend list layout.
 *
 * This mirrors the list layout behavior in `LegendList`:
 * - legend values can include titles
 * - the label can be truncated by a pixel width limit
 * - `CurrentAndLastValue` can reserve width using the max label
 *
 * @internal
 */
export function computeHorizontalLegendRowCount(args: HorizontalLegendRowCountArgs): number {
  const {
    items,
    legendValues,
    availableWidth,
    columnGap,
    spacingBuffer,
    actionDimension,
    markerWidth,
    sharedMargin,
    widthLimit,
    showValueTitle,
    textMeasure,
  } = args;

  const font = {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontVariant: 'normal',
    fontWeight: 400,
    fontStyle: 'normal',
  } as const;

  const itemWidths = items.map((item) => {
    const { width: labelOnlyWidth } = textMeasure(item.label, font, 12, 1.5);
    // Match list-layout px truncation: the label itself is capped at `widthLimit` px (0 means no truncation)
    const cappedLabelWidth = widthLimit > 0 ? Math.min(labelOnlyWidth, widthLimit) : labelOnlyWidth;

    // Compute value widths independently so we can account for per-cell margins and placeholders.
    const valueCellWidths = legendValues
      .map((type) => {
        const v = item.values.find((vv) => vv.type === type);
        if (!v) return;

        // Only CurrentAndLastValue reserves width even when the current/hover label is empty (placeholder rendered).
        if (type !== LegendValue.CurrentAndLastValue && !v.label) return;

        // Reserve width for CurrentAndLastValue using the max label
        const maxCurrentAndLastValue = v.maxLabel;
        const valueLabel =
          type === LegendValue.CurrentAndLastValue ? maxCurrentAndLastValue ?? v.maxLabel ?? (v.label || '—') : v.label;

        const valueText = (() => {
          if (!showValueTitle) return valueLabel;
          const title = legendValueTitlesMap[type] ?? '';
          return `${title.toUpperCase()}: ${valueLabel}`;
        })();

        return textMeasure(valueText, font, 12, 1.5).width;
      })
      .filter(isDefined);

    // Add sharedMargin before the label and each rendered value cell (matches list layout spacing).
    const valuesWidth = valueCellWidths.reduce((acc, w) => acc + sharedMargin + w, 0);
    const labelAndValuesWidth = cappedLabelWidth + valuesWidth;
    const hasAdditionalValues = valueCellWidths.length > 0;
    // Add a trailing margin only when the label is the last cell (no action column and no value cells).
    const trailingMargin = actionDimension || hasAdditionalValues ? 0 : sharedMargin;
    return (
      sharedMargin +
      markerWidth +
      spacingBuffer +
      (sharedMargin + labelAndValuesWidth + trailingMargin) +
      (actionDimension ? spacingBuffer + actionDimension : 0)
    );
  });

  return computeWrappedRowCount(itemWidths, availableWidth, columnGap);
}
