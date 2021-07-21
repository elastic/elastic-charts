/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { mergePartial, RecursivePartial } from '../../../../utils/common';
import { AxisId } from '../../../../utils/ids';
import { AxisStyle } from '../../../../utils/themes/theme';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import { getAxisSpecsSelector } from './get_specs';

/**
 * Get merged axis styles. **Only** include axes with styles overrides.
 *
 * @internal
 */
export const getAxesStylesSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getChartThemeSelector],
  (axesSpecs, { axes: sharedAxesStyle }): Map<AxisId, AxisStyle | null> => {
    const axesStyles = new Map<AxisId, AxisStyle | null>();
    axesSpecs.forEach(({ id, style, gridLine, position }) => {
      const isVertical = isVerticalAxis(position);
      const axisStyleMerge: RecursivePartial<AxisStyle> = {
        ...style,
      };
      if (gridLine) {
        axisStyleMerge.gridLine = { [isVertical ? 'vertical' : 'horizontal']: gridLine };
      }
      const newStyle = style
        ? mergePartial(sharedAxesStyle, axisStyleMerge, {
            mergeOptionalPartialValues: true,
          })
        : null;
      axesStyles.set(id, newStyle);
    });
    return axesStyles;
  },
);
