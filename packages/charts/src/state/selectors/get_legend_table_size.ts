/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { getLegendConfigSelector } from './get_legend_config_selector';
import type { LegendSizing } from './get_legend_size';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import type { LegendItem, LegendItemValue } from '../../common/legend';
import { legendValueTitlesMap } from '../../common/legend';
import type { Font } from '../../common/text_utils';
import {
  GRID_ACTION_WIDTH,
  GRID_COLOR_WIDTH,
  MIN_LABEL_WIDTH,
} from '../../components/legend/legend_table/legend_table';
import type { TextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { isDefined, LayoutDirection } from '../../utils/common';
import type { Dimensions } from '../../utils/dimensions';
import type { Theme } from '../../utils/themes/theme';

const MONO_LETTER_WIDTH = 8.5;
const MONO_SEPARATOR_WIDTH = 4.5;

const SCROLL_BAR_WIDTH = 16; // ~1em
const VERTICAL_PADDING = 4;
const TOP_MARGIN = 2;

const GRID_CELL_PADDING = { height: 4, width: 8 };
const GRID_MARGIN = 8;
const HORIZONTAL_VISIBLE_LINES_NUMBER = 4;
const GRID_CELL_BORDER_WIDTH = 1;

const fontArgs: [Font, number, number] = [
  {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: 400,
    fontVariant: 'normal',
    fontStyle: 'normal',
    textColor: 'black',
  },
  12,
  1.34,
];

const headerFontArgs: [Font, number, number] = [
  {
    ...fontArgs[0],
    fontWeight: 600,
  },
  fontArgs[1],
  fontArgs[2],
];

const calcApprValuesWidth = ({ label }: LegendItemValue) =>
  label.includes('.')
    ? (label.length - 1) * MONO_LETTER_WIDTH + MONO_SEPARATOR_WIDTH
    : label.length * MONO_LETTER_WIDTH;

/** @internal */
export function getLegendTableSize(
  config: ReturnType<typeof getLegendConfigSelector>,
  theme: Theme,
  parentDimensions: Dimensions,
  items: LegendItem[],
  textMeasure: TextMeasure,
): LegendSizing {
  const {
    legend: { verticalWidth, spacingBuffer, margin },
  } = theme;

  const { legendSize, legendValues, legendPosition, legendAction } = config;

  const { width: titleWidth, height } = textMeasure(config.legendTitle || '', ...headerFontArgs);
  const valuesTitlesWidth = legendValues.map((v) => textMeasure(legendValueTitlesMap[v], ...headerFontArgs).width);

  const widestLabelWidth = items.reduce(
    (acc, { label }) => Math.max(acc, textMeasure(label, ...fontArgs).width),
    Math.max(titleWidth, MIN_LABEL_WIDTH),
  );

  const widestValuesWidths = items.reduce((acc, { values }) => {
    const valuesWidths = values.map(calcApprValuesWidth);
    return acc.map((w, i) => Math.ceil(Math.max(w, valuesWidths[i] || 0)));
  }, valuesTitlesWidth);

  const seriesWidth = Math.ceil(widestLabelWidth + GRID_CELL_PADDING.width * 2);

  const legendItemWidth =
    seriesWidth + widestValuesWidths.reduce((acc, w) => acc + w + GRID_CELL_PADDING.width * 2, 0) + 1;

  const actionWidth = isDefined(legendAction) ? GRID_ACTION_WIDTH : 0;

  if (legendPosition.direction === LayoutDirection.Vertical) {
    const maxAvailableWidth = parentDimensions.width * 0.5;
    const legendItemHeight = height + VERTICAL_PADDING * 2;
    const legendHeight = legendItemHeight * items.length + TOP_MARGIN;
    const scrollBarDimension = legendHeight > parentDimensions.height ? SCROLL_BAR_WIDTH : 0;
    const staticWidth = GRID_COLOR_WIDTH + GRID_MARGIN * 2 + actionWidth + scrollBarDimension;

    const width = Number.isFinite(legendSize)
      ? Math.min(Math.max(legendSize, legendItemWidth * 0.3 + staticWidth), maxAvailableWidth)
      : Math.ceil(Math.min(legendItemWidth + staticWidth, maxAvailableWidth));

    return {
      height: legendHeight,
      width,
      margin,
      position: legendPosition,
      seriesWidth: Math.min(seriesWidth, (Number.isFinite(legendSize) ? legendSize : maxAvailableWidth) / 2),
    };
  }

  const visibleLinesNumber = Math.min(items.length + 1, HORIZONTAL_VISIBLE_LINES_NUMBER);
  const singleLineHeight = height + GRID_CELL_PADDING.height * 2 + GRID_CELL_BORDER_WIDTH;
  return {
    height: singleLineHeight * visibleLinesNumber + GRID_MARGIN,
    width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionWidth, verticalWidth)),
    margin,
    position: legendPosition,
  };
}
