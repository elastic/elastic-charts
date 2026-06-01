/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisLabelFormatter } from './axis_tick_formatter';
import { getAxisTickLabelFormatter } from './axis_tick_formatter';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getAxesStylesSelector } from './get_axis_styles';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import type { ScaleBand, ScaleContinuous } from '../../../../scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import type { AxisId } from '../../../../utils/ids';
import { Logger } from '../../../../utils/logger';
import type { AxisStyle, GridLineStyle } from '../../../../utils/themes/theme';
import { measureAxisStatic, resolveTickLabelConstraints } from '../../axes/dimensions';
import { createTickLayout } from '../../axes/tick_labels';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import type { AxisTick } from '../../utils/axis_utils';
import { defaultTickFormatter, getScaleForAxisSpec, isXDomain } from '../../utils/axis_utils';
import type { AxisSpec, TickFormatter } from '../../utils/specs';

/** @internal */
export type AxesTicksDimensions = Map<AxisId, AxisTick['layout'][]>;

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
  axesSpecs.reduce<Map<AxisId, ScaleBand | ScaleContinuous>>((unitScales, axisSpec) => {
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
  scale: ScaleContinuous | ScaleBand;
  axesStyle: AxisStyle;
  gridLine: GridLineStyle;
  isXAxis: boolean;
  labelFormatter: AxisLabelFormatter;
};

/** @internal */
export const getJoinedVisibleAxesData = createCustomCachedSelector(
  [getUnitScales, getAxisSpecsSelector, getThemedAxesStyles, getSettingsSpecSelector, getAxisTickLabelFormatter],
  (unitScales, axesSpecs, themedAxesStyles, { rotation }, axisTickLabelFormatters) =>
    axesSpecs.reduce<Map<AxisId, JoinedAxisData>>((axisData, axisSpec) => {
      const { id, position, hide } = axisSpec;
      const axesStyle = themedAxesStyles.get(id);
      const scale = unitScales.get(id);

      if (scale && axesStyle) {
        const gridLine = isVerticalAxis(position) ? axesStyle.gridLine.vertical : axesStyle.gridLine.horizontal;
        const axisShown = gridLine.visible || !hide;
        const isXAxis = isXDomain(position, rotation);
        const labelFormatter = axisTickLabelFormatters[isXAxis ? 'x' : 'y'].get(id) ?? defaultTickFormatter;

        if (axisShown)
          axisData.set(id, {
            axisSpec,
            scale,
            axesStyle,
            gridLine,
            labelFormatter,
            isXAxis,
          });
      }
      return axisData;
    }, new Map()),
);

/** @internal */
export const computeBaselineAxisTicksDimensionsSelector = createCustomCachedSelector(
  [getJoinedVisibleAxesData, getSettingsSpecSelector, getChartContainerDimensionsSelector, getSmallMultiplesSpec],
  (joinedAxesData, { locale }, containerDimensions, smSpec): AxesTicksDimensions =>
    withTextMeasure((textMeasure): AxesTicksDimensions => {
      return [...joinedAxesData].reduce<AxesTicksDimensions>(
        (axesTicksDimensions, [id, { axisSpec, scale, axesStyle, labelFormatter }]) => {
          const hasPanelTitle = isVerticalAxis(axisSpec.position) ? smSpec?.splitVertically : smSpec?.splitHorizontally;
          const staticBand = measureAxisStatic(axisSpec, axesStyle, Boolean(hasPanelTitle));

          const { maxLineLength, maxWrapLines } = resolveTickLabelConstraints({
            position: axisSpec.position,
            style: axesStyle,
            staticBand,
            containerWidth: containerDimensions.width,
            containerHeight: containerDimensions.height,
            scale,
          });

          const layoutTickLabel = createTickLayout(axesStyle, textMeasure, locale, maxWrapLines, maxLineLength);
          const tickDimensions = scale.ticks().map((tick) => layoutTickLabel(labelFormatter(tick)));

          axesTicksDimensions.set(id, tickDimensions);
          return axesTicksDimensions;
        },
        new Map(),
      );
    }),
);
