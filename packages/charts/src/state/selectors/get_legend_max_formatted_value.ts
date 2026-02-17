/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { LegendValue, legendValueTitlesMap } from '../../common/legend';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const LEGEND_VALUE_FONT = {
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 900,
  fontStyle: 'normal',
} as const;

/** @internal */
export const getLegendMaxFormattedValueSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): string | undefined => {
    return internalChartState?.getLegendMaxFormattedValue(globalChartState);
  },
);

/**
 * Returns the pixel width to reserve for the CurrentAndLastValue legend column,
 * computed via canvas text measurement including the title prefix (e.g. "VALUE: ").
 * Returns `undefined` when no max-formatted value is available.
 * @internal
 */
export const getLegendMaxFormattedValueWidthSelector = createCustomCachedSelector(
  [getLegendMaxFormattedValueSelector],
  (maxFormattedValue): number | undefined => {
    if (!maxFormattedValue) return undefined;
    const title = legendValueTitlesMap[LegendValue.CurrentAndLastValue] ?? '';
    const fullText = `${title.toUpperCase()}: ${maxFormattedValue}`;
    return withTextMeasure((textMeasure) => textMeasure(fullText, LEGEND_VALUE_FONT, 12, 1.5).width);
  },
);
