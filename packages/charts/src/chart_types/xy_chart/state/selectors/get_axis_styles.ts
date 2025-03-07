/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getAxisSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { mergePartial } from '../../../../utils/common';
import type { AxisId } from '../../../../utils/ids';
import type { AxisStyle } from '../../../../utils/themes/theme';
import { isVerticalAxis } from '../../utils/axis_type_utils';

/** @internal */
export const getAxesStylesSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getChartThemeSelector],
  (axesSpecs, { axes: sharedAxesStyle }): Map<AxisId, AxisStyle | null> =>
    axesSpecs.reduce((axesStyles, { id, style, gridLine, position }) => {
      const gridStyle = gridLine && { gridLine: { [isVerticalAxis(position) ? 'vertical' : 'horizontal']: gridLine } };
      return axesStyles.set(id, style ? mergePartial(sharedAxesStyle, { ...style, ...gridStyle }) : null);
    }, new Map()),
);
