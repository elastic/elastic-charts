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
import { mergePartial, Position, type RecursivePartial } from '../../../../utils/common';
import { AxisId } from '../../../../utils/ids';
import { AxisStyle } from '../../../../utils/themes/theme';
import { isVerticalAxis } from '../../utils/axis_type_utils';

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
  [getAxisSpecsSelector, getChartThemeSelector],
  (axesSpecs, { axes: sharedAxesStyle }): Map<AxisId, AxisStyle | null> =>
    axesSpecs.reduce((axesStyles, { id, style, gridLine, position, timeAxisLayerCount }) => {
      const timeAxisStyle = timeAxisLayerCount > 0 ? MULTILAYER_TIME_AXIS_STYLE : undefined;
      const gridStyle = gridLine && { gridLine: { [isVerticalAxis(position) ? 'vertical' : 'horizontal']: gridLine } };
      return axesStyles.set(
        id,
        style || timeAxisStyle
          ? mergePartial(sharedAxesStyle, {
              ...(style ? style : {}),
              ...(timeAxisStyle ? timeAxisStyle : {}),
              ...gridStyle,
            })
          : null,
      );
    }, new Map()),
);
