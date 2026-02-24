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

/** @internal */
export interface HorizontalLegendRowCountArgs {
  /** Legend items being rendered */
  items: LegendItem[];
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
  /** Formatted max Y domain value for reserving stable CurrentAndLastValue column width */
  maxFormattedValue?: string;
}

/**
 * Compute row count for the horizontal legend list layout.
 *
 * This mirrors the list layout behavior in `LegendList`:
 * - legend values can include titles
 * - the label can be truncated by a pixel width limit
 * - `CurrentAndLastValue` can reserve width using the max label
 *
 * Items are measured lazily and laid out greedily row-by-row.
 * The loop short-circuits as soon as a third row is reached, so remaining
 * items are never measured.
 *
 * @internal
 */
export function computeHorizontalLegendRowCount(args: HorizontalLegendRowCountArgs): {
  isSingleLine: boolean;
  isMoreThanTwoLines: boolean;
} {
  const {
    items,
    availableWidth,
    columnGap,
    spacingBuffer,
    actionDimension,
    markerWidth,
    sharedMargin,
    widthLimit,
    showValueTitle,
    textMeasure,
    maxFormattedValue,
  } = args;

  const font = {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontVariant: 'normal',
    fontWeight: 400,
    fontStyle: 'normal',
  } as const;

  let rows = 1;
  let currentRowWidth = 0;

  for (const item of items) {
    const { width: labelOnlyWidth } = textMeasure(item.label, font, 12, 1.5);
    const cappedLabelWidth = widthLimit > 0 ? Math.min(labelOnlyWidth, widthLimit) : labelOnlyWidth;

    const valuesWidth = item.values.map(({ type, label }) => {
      if (type !== LegendValue.CurrentAndLastValue && !label) return 0;

      const valueLabel = type === LegendValue.CurrentAndLastValue ? maxFormattedValue ?? (label || '—') : label;

      const valueText = !showValueTitle
        ? valueLabel
        : `${legendValueTitlesMap[type]?.toUpperCase() ?? ''}: ${valueLabel}`;
      return sharedMargin + textMeasure(valueText, font, 12, 1.5).width;
    });

    const itemWidths = [
      sharedMargin +
        markerWidth +
        spacingBuffer +
        cappedLabelWidth +
        spacingBuffer +
        (actionDimension ? spacingBuffer + actionDimension : 0) +
        sharedMargin,
      ...valuesWidth,
    ];

    for (const [index, itemWidth] of itemWidths.entries()) {
      if (itemWidth === 0) continue;
      const isFirst = index === 0;
      const nextRowWidth = currentRowWidth === 0 ? itemWidth : currentRowWidth + (isFirst ? 0 : columnGap) + itemWidth;

      if (nextRowWidth > availableWidth) {
        if (currentRowWidth > 0) {
          rows++;
          if (rows > 2) return { isSingleLine: false, isMoreThanTwoLines: true };
        }
        currentRowWidth = availableWidth > 0 ? Math.min(itemWidth, availableWidth) : itemWidth;
      } else {
        currentRowWidth = nextRowWidth;
      }
    }
  }

  return { isSingleLine: rows <= 1, isMoreThanTwoLines: false };
}
