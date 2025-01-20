/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAxisSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { mergePartial, Position, type RecursivePartial } from '../../../../utils/common';
import { AxisId } from '../../../../utils/ids';
import { AxisStyle } from '../../../../utils/themes/theme';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import { isXDomain } from '../../utils/axis_utils';

const MULTILAYER_TIME_AXIS_STYLE: RecursivePartial<AxisStyle> = {
  tickLabel: {
    visible: true,
    padding: 0,
    rotation: 0,
    alignment: {
      vertical: Position.Bottom,
      horizontal: Position.Left,
    },
  },
  tickLine: {
    visible: true,
    size: 0,
    padding: 4,
  },
};

/** @internal */
export const getAxesStylesSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getChartThemeSelector, getScaleConfigsFromSpecsSelector, getSettingsSpecSelector],
  (axesSpecs, { axes: sharedAxesStyle }, scaleConfigs, settingsSpec): Map<AxisId, AxisStyle | null> =>
    axesSpecs.reduce((axesStyles, { id, chartType, style, gridLine, position, timeAxisLayerCount }) => {
      let mergedStyle: AxisStyle | null = null;

      // apply multilayer time axis style to xy charts with time on the x axis.
      if (
        chartType === 'xy_axis' &&
        timeAxisLayerCount > 0 &&
        isXDomain(position, settingsSpec.rotation) &&
        settingsSpec.rotation === 0 &&
        scaleConfigs.x.type === 'time'
      ) {
        mergedStyle = mergePartial(sharedAxesStyle, MULTILAYER_TIME_AXIS_STYLE);
      }

      if (style) {
        const gridStyle = gridLine && {
          gridLine: { [isVerticalAxis(position) ? 'vertical' : 'horizontal']: gridLine },
        };
        mergedStyle = mergePartial(mergedStyle ?? sharedAxesStyle, { ...style, ...gridStyle });
      }

      return axesStyles.set(id, mergedStyle);
    }, new Map()),
);
