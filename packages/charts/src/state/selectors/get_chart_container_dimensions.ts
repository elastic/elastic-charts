/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLegendConfigSelector } from './get_legend_config_selector';
import { getLegendSizeSelector } from './get_legend_size';
import { LayoutDirection } from '../../utils/common';
import { Dimensions } from '../../utils/dimensions';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const getChartContainerDimensionsSelector = createCustomCachedSelector(
  [getLegendConfigSelector, getLegendSizeSelector, getParentDimension],
  ({ showLegend, legendPosition: { floating, direction } }, legendSize, parentDimensions): Dimensions =>
    floating || !showLegend
      ? parentDimensions
      : direction === LayoutDirection.Vertical
        ? {
            left: 0,
            top: 0,
            width: parentDimensions.width - legendSize.width - legendSize.margin * 2,
            height: parentDimensions.height,
          }
        : {
            left: 0,
            top: 0,
            width: parentDimensions.width,
            height: parentDimensions.height - legendSize.height - legendSize.margin * 2,
          },
);
