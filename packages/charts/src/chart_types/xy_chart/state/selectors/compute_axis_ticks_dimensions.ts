/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { AxisId } from '../../../../utils/ids';
import { Logger } from '../../../../utils/logger';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import {
  TickLabelBounds,
  computeRotatedLabelDimensions,
  defaultTickFormatter,
  getScaleForAxisSpec,
} from '../../utils/axis_utils';
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
export const computeAxisTicksDimensionsSelector = createCustomCachedSelector(
  [
    getScaleFunction,
    getAxisSpecsSelector,
    getChartThemeSelector,
    getSeriesSpecsSelector,
    getAxesStylesSelector,
    computeSeriesDomainsSelector,
  ],
  (getScale, axesSpecs, chartTheme, seriesSpecs, axesStyles, { xDomain: { timeZone } }): AxesTicksDimensions => {
    const fallBackTickFormatter = seriesSpecs.find(({ tickFormat }) => tickFormat)?.tickFormat ?? defaultTickFormatter;
    return withTextMeasure(
      (textMeasure): AxesTicksDimensions =>
        axesSpecs.reduce<AxesTicksDimensions>((axesTicksDimensions, axisSpec) => {
          const { id, hide, position, labelFormat: axisLabelFormat, tickFormat: axisTickFormat } = axisSpec;
          const { gridLine, tickLabel } = axesStyles.get(id) ?? chartTheme.axes;
          const gridLineVisible = isVerticalAxis(position) ? gridLine.vertical.visible : gridLine.horizontal.visible;
          if (gridLineVisible || !hide) {
            const scale = getScale(axisSpec, [0, 1]);
            if (scale) {
              const tickFormat = axisLabelFormat ?? axisTickFormat ?? fallBackTickFormatter;
              const tickLabels = scale.ticks().map((d) => tickFormat(d, { timeZone }));
              const maxLabelSizes = (tickLabel.visible ? tickLabels : []).reduce(
                (sizes, labelText) => {
                  const bbox = textMeasure(labelText, 0, tickLabel.fontSize, tickLabel.fontFamily);
                  const rotatedBbox = computeRotatedLabelDimensions(bbox, tickLabel.rotation);
                  sizes.maxLabelBboxWidth = Math.max(sizes.maxLabelBboxWidth, Math.ceil(rotatedBbox.width));
                  sizes.maxLabelBboxHeight = Math.max(sizes.maxLabelBboxHeight, Math.ceil(rotatedBbox.height));
                  sizes.maxLabelTextWidth = Math.max(sizes.maxLabelTextWidth, Math.ceil(bbox.width));
                  sizes.maxLabelTextHeight = Math.max(sizes.maxLabelTextHeight, Math.ceil(bbox.height));
                  return sizes;
                },
                { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 },
              );
              axesTicksDimensions.set(id, { ...maxLabelSizes, isHidden: axisSpec.hide && gridLineVisible });
            } else {
              Logger.warn(`Cannot compute scale for axis spec ${axisSpec.id}. Axis will not be displayed.`);
            }
          }
          return axesTicksDimensions;
        }, new Map()),
    );
  },
);
