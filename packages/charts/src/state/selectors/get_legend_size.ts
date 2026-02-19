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
import { getLegendMaxFormattedValueSelector } from './get_legend_max_formatted_value';
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
import { computeHorizontalLegendRowCount } from '../utils/legend_row_count';

const getParentDimensionSelector = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const SCROLL_BAR_WIDTH = 16; // ~1em
/** @internal */
export const MARKER_WIDTH = 16;
const SHARED_MARGIN = 4;
const VERTICAL_PADDING = 4;
/** @internal */
export const TOP_MARGIN = 2;
const BETWEEN_ROW_GAP = 24;
const WITHIN_ROW_GAP = 8;
const ACTION_WIDTH = 16;

/** @internal */
export type LegendSizing = Size & {
  margin: number;
  position: LegendPositionConfig;
  seriesWidth?: number;
};

/** @internal */
export const getLegendSizeSelector = createCustomCachedSelector(
  [
    getLegendConfigSelector,
    getChartThemeSelector,
    getParentDimensionSelector,
    getLegendItemsSelector,
    getLegendMaxFormattedValueSelector,
  ],
  (config, theme, parentDimensions, items, maxFormattedValue): LegendSizing => {
    const { showLegend, legendSize, legendValues, legendPosition, legendAction, legendLayout } = config;
    if (!showLegend) {
      return { width: 0, height: 0, margin: 0, position: LEGEND_TO_FULL_CONFIG[Position.Right] };
    }
    if (shouldDisplayTable(legendValues, legendPosition, legendLayout)) {
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
    let height;

    if (!legendLayout) {
      const numberOfItemsPerRow = (parentDimensions.width - 20) / 200;
      const isSingleLine = numberOfItemsPerRow > items.length;
      const isMoreThanTwoLines = numberOfItemsPerRow * 2 < items.length;
      height = Number.isFinite(legendSize)
        ? Math.min(legendSize, parentDimensions.height * 0.7)
        : isSingleLine
          ? bbox.height + 16
          : isMoreThanTwoLines
            ? bbox.height * 2.5 + 24
            : bbox.height * 2 + 24;
    } else {
      // This section is related to the list layout
      const widthLimit = Math.abs(theme.legend.labelOptions.widthLimit ?? 250);
      const { isSingleLine, isMoreThanTwoLines } = withTextMeasure((textMeasure) =>
        computeHorizontalLegendRowCount({
          items,
          legendValues,
          availableWidth,
          columnGap: BETWEEN_ROW_GAP,
          spacingBuffer: WITHIN_ROW_GAP,
          actionDimension: ACTION_WIDTH,
          markerWidth: MARKER_WIDTH,
          sharedMargin: SHARED_MARGIN,
          widthLimit,
          showValueTitle: legendLayout === 'list',
          textMeasure,
          maxFormattedValue,
        }),
      );

      height = Number.isFinite(legendSize)
        ? Math.min(legendSize, parentDimensions.height * 0.7)
        : isSingleLine
          ? bbox.height + 22
          : isMoreThanTwoLines
            ? bbox.height * 2.5 + 28
            : bbox.height * 2 + 28;
    }

    return {
      height,
      width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionDimension, verticalWidth)),
      margin,
      position: legendPosition,
    };
  },
);
