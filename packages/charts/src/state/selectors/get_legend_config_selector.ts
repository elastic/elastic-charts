/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLegendPositionConfig } from '../../components/legend/position_style';
import { createCustomCachedSelector } from '../create_selector';
import { getSettingsSpecSelector } from './get_settings_spec';

/** @internal */
export const getLegendConfigSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  ({
    flatLegend,
    legendAction,
    legendColorPicker,
    legendMaxDepth,
    legendSize,
    legendPosition,
    legendStrategy,
    onLegendItemClick,
    showLegend,
    onLegendItemMinusClick,
    onLegendItemOut,
    onLegendItemOver,
    onLegendItemPlusClick,
    showLegendExtra,
  }) => {
    return {
      flatLegend,
      legendAction,
      legendColorPicker,
      legendMaxDepth,
      legendSize,
      legendPosition: getLegendPositionConfig(legendPosition),
      legendStrategy,
      onLegendItemClick,
      showLegend,
      onLegendItemMinusClick,
      onLegendItemOut,
      onLegendItemOver,
      onLegendItemPlusClick,
      showLegendExtra,
    };
  },
);
