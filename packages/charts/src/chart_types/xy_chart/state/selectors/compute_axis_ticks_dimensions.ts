/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../../../scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { AxisId } from '../../../../utils/ids';
import { Logger } from '../../../../utils/logger';
import { AxisStyle, GridLineStyle } from '../../../../utils/themes/theme';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import {
  computeRotatedLabelDimensions,
  defaultTickFormatter,
  getScaleForAxisSpec,
  TickLabelBounds,
} from '../../utils/axis_utils';
import { AxisSpec, TickFormatter } from '../../utils/specs';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getAxesStylesSelector } from './get_axis_styles';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export type AxesTicksDimensions = Map<AxisId, TickLabelBounds>;

const getScaleFunction = createCustomCachedSelector(
  [
    computeSeriesDomainsSelector,
    getSettingsSpecSelector,
    countBarsInClusterSelector,
    getBarPaddingsSelector,
    isHistogramModeEnabledSelector,
  ],
  getScaleForAxisSpec,
);

/** @internal */
export const getFallBackTickFormatter = createCustomCachedSelector(
  [getSeriesSpecsSelector],
  (seriesSpecs): TickFormatter => seriesSpecs.find(({ tickFormat }) => tickFormat)?.tickFormat ?? defaultTickFormatter,
);

const getUnitScales = createCustomCachedSelector([getScaleFunction, getAxisSpecsSelector], (getScale, axesSpecs) =>
  axesSpecs.reduce<Map<AxisId, Scale<string | number>>>((unitScales, axisSpec) => {
    const scale = getScale(axisSpec, [0, 1]);
    if (scale) unitScales.set(axisSpec.id, scale);
    else Logger.warn(`Cannot compute scale for axis spec ${axisSpec.id}. Axis will not be displayed.`);
    return unitScales;
  }, new Map()),
);

const getThemedAxesStyles = createCustomCachedSelector(
  [getChartThemeSelector, getAxesStylesSelector],
  (chartTheme, axesStyles): Map<AxisId, AxisStyle> =>
    [...axesStyles.keys()].reduce((styles, id) => styles.set(id, axesStyles.get(id) ?? chartTheme.axes), new Map()),
);

/** @internal */
export type JoinedAxisData = {
  axisSpec: AxisSpec;
  scale: Scale<number | string>;
  axesStyle: AxisStyle;
  gridLine: GridLineStyle;
  tickFormatter: (d: number | string) => string;
};

/** @internal */
export const getJoinedVisibleAxesData = createCustomCachedSelector(
  [getUnitScales, getAxisSpecsSelector, getThemedAxesStyles, getFallBackTickFormatter, computeSeriesDomainsSelector],
  (unitScales, axesSpecs, themedAxesStyles, fallBackTickFormatter, { xDomain: { timeZone } }) =>
    axesSpecs.reduce<Map<AxisId, JoinedAxisData>>((axisData, axisSpec) => {
      const { id, labelFormat, tickFormat, position } = axisSpec;
      const axesStyle = themedAxesStyles.get(id);
      const scale = unitScales.get(axisSpec.id);
      const format = labelFormat ?? tickFormat ?? fallBackTickFormatter; // this coalescing be extracted out too
      const formatOption = { timeZone };
      const tickFormatter = (d: number | string) => format(d, formatOption);
      if (scale && axesStyle) {
        const gridLine = isVerticalAxis(position) ? axesStyle.gridLine.vertical : axesStyle.gridLine.horizontal;
        const axisShown = gridLine.visible || !axisSpec.hide;
        if (axisShown) axisData.set(axisSpec.id, { axisSpec, scale, axesStyle, gridLine, tickFormatter });
      }
      return axisData;
    }, new Map()),
);

/** @internal */
export const getLabelBox = (
  axesStyle: AxisStyle,
  scale: Scale<string | number>,
  tickFormatter: JoinedAxisData['tickFormatter'],
  textMeasure: TextMeasure,
  axisSpec: AxisSpec,
  gridLine: GridLineStyle,
): TickLabelBounds => ({
  ...(axesStyle.tickLabel.visible ? scale.ticks().map(tickFormatter) : []).reduce(
    (sizes, labelText) => {
      const bbox = textMeasure(labelText, 0, axesStyle.tickLabel.fontSize, axesStyle.tickLabel.fontFamily);
      const rotatedBbox = computeRotatedLabelDimensions(bbox, axesStyle.tickLabel.rotation);
      sizes.maxLabelBboxWidth = Math.max(sizes.maxLabelBboxWidth, Math.ceil(rotatedBbox.width));
      sizes.maxLabelBboxHeight = Math.max(sizes.maxLabelBboxHeight, Math.ceil(rotatedBbox.height));
      sizes.maxLabelTextWidth = Math.max(sizes.maxLabelTextWidth, Math.ceil(bbox.width));
      sizes.maxLabelTextHeight = Math.max(sizes.maxLabelTextHeight, Math.ceil(bbox.height));
      return sizes;
    },
    { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 },
  ),
  isHidden: axisSpec.hide && gridLine.visible,
});

/** @internal */
export const computeAxisTicksDimensionsSelector = createCustomCachedSelector(
  [getJoinedVisibleAxesData],
  (joinedAxesData): AxesTicksDimensions =>
    withTextMeasure(
      (textMeasure): AxesTicksDimensions =>
        [...joinedAxesData].reduce<AxesTicksDimensions>(
          (axesTicksDimensions, [id, { axisSpec, scale, axesStyle, gridLine, tickFormatter }]) =>
            axesTicksDimensions.set(id, getLabelBox(axesStyle, scale, tickFormatter, textMeasure, axisSpec, gridLine)),
          new Map(),
        ),
    ),
);
