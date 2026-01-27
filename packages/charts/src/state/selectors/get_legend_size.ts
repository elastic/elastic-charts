/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartThemeSelector } from './get_chart_theme';
import { getLegendConfigSelector } from './get_legend_config_selector';
import { getLegendItemsSelector } from './get_legend_items';
import { getLegendTableSize } from './get_legend_table_size';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { shouldDisplayTable } from '../../common/legend';
import { LEGEND_HIERARCHY_MARGIN } from '../../components/legend/constants';
import { LEGEND_TO_FULL_CONFIG } from '../../components/legend/position_style';
import type { LegendPositionConfig } from '../../specs';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { isDefined, LayoutDirection, Position } from '../../utils/common';
import type { Size } from '../../utils/dimensions';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const getParentDimensionSelector = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const SCROLL_BAR_WIDTH = 16; // ~1em
/** @internal */
export const MARKER_WIDTH = 16;
const SHARED_MARGIN = 4;
const VERTICAL_PADDING = 4;
/** @internal */
export const TOP_MARGIN = 2;
const COLUMN_GAP = 24;

/** @internal */
export type LegendSizing = Size & {
  margin: number;
  position: LegendPositionConfig;
  seriesWidth?: number;
};

/** @internal */
export const getLegendSizeSelector = createCustomCachedSelector(
  [getLegendConfigSelector, getChartThemeSelector, getParentDimensionSelector, getLegendItemsSelector],
  (config, theme, parentDimensions, items): LegendSizing => {
    const { showLegend, legendSize, legendValues, legendPosition, legendAction, legendLayout } = config;
    if (!showLegend) {
      return { width: 0, height: 0, margin: 0, position: LEGEND_TO_FULL_CONFIG[Position.Right] };
    }
    if (shouldDisplayTable(legendValues, legendLayout)) {
      return withTextMeasure((textMeasure) => getLegendTableSize(config, theme, parentDimensions, items, textMeasure));
    }

    const bbox = withTextMeasure((textMeasure) =>
      items.reduce(
        (acc, { label, depth, values }) => {
          const itemLabel = `${label}${legendValues.length > 0 ? values[0]?.label ?? '' : ''}`;
          const { width, height } = textMeasure(
            itemLabel,
            { fontFamily: DEFAULT_FONT_FAMILY, fontVariant: 'normal', fontWeight: 400, fontStyle: 'normal' },
            12,
            1.5,
          );
          acc.width = Math.max(acc.width, width + depth * LEGEND_HIERARCHY_MARGIN);
          acc.height = Math.max(acc.height, height);
          return acc;
        },
        { width: 0, height: 0 },
      ),
    );

    const {
      legend: { verticalWidth, spacingBuffer, margin },
    } = theme;

    const actionDimension = isDefined(legendAction) ? 24 : 0; // max width plus margin
    const showExtraMargin = legendValues.length > 0; // && items.every(({ values }) => values.length > 0); // remove unnecessary margin
    const legendItemWidth = MARKER_WIDTH + SHARED_MARGIN + bbox.width + (showExtraMargin ? SHARED_MARGIN : 0);

    if (legendPosition.direction === LayoutDirection.Vertical) {
      const legendItemHeight = bbox.height + VERTICAL_PADDING * 2;
      const legendHeight = legendItemHeight * items.length + TOP_MARGIN;
      const scrollBarDimension = legendHeight > parentDimensions.height ? SCROLL_BAR_WIDTH : 0;
      const staticWidth = spacingBuffer + actionDimension + scrollBarDimension;

      const width = Number.isFinite(legendSize)
        ? Math.min(Math.max(legendSize, legendItemWidth * 0.3 + staticWidth), parentDimensions.width * 0.7)
        : Math.floor(Math.min(legendItemWidth + staticWidth, verticalWidth));

      return {
        width,
        height: legendHeight,
        margin,
        position: legendPosition,
      };
    }
    const availableWidth = parentDimensions.width - 20;
    // Calculate rows by tracking cumulative width
    let numRows = 1;
    let currentRowWidth = 0;
    // Calculate width for the max current and last value
    const maxCurrentAndLastValue = config.legendValues.includes('currentAndLastValue')
      ? items?.[0]?.values?.[0]?.maxLabel
      : undefined;

    for (const item of items) {
      // Calculate width for this specific item
      const { width: labelWidth } = withTextMeasure((textMeasure) =>
        textMeasure(
          `${item.label}${legendValues.length > 0 ? item.values[0]?.label ?? '' : ''}${maxCurrentAndLastValue ? ` ${maxCurrentAndLastValue}` : ''}`,
          { fontFamily: DEFAULT_FONT_FAMILY, fontVariant: 'normal', fontWeight: 400, fontStyle: 'normal' },
          12,
          1.5,
        ),
      );

      const gap = currentRowWidth > 0 ? COLUMN_GAP : 0;
      const thisItemWidth = MARKER_WIDTH + SHARED_MARGIN + labelWidth + spacingBuffer + actionDimension + gap;

      if (currentRowWidth + thisItemWidth > availableWidth && currentRowWidth > 0) {
        numRows++;
        currentRowWidth = thisItemWidth;
      } else {
        currentRowWidth += thisItemWidth;
      }
    }

    const isSingleLine = numRows === 1;
    const isMoreThanTwoLines = numRows > 2;
    const height = Number.isFinite(legendSize)
      ? Math.min(legendSize, parentDimensions.height * 0.7)
      : isSingleLine
        ? bbox.height + 16
        : isMoreThanTwoLines
          ? bbox.height * 2.5 + 24
          : bbox.height * 2 + 24;

    return {
      height,
      width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionDimension, verticalWidth)),
      margin,
      position: legendPosition,
    };
  },
);
