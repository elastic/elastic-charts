/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAxisSpecsSelector } from './get_specs';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isXDomain } from '../../utils/axis_utils';

/** @internal */
export const isMultilayerTimeAxisSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getScaleConfigsFromSpecsSelector, getSettingsSpecSelector],
  (axesSpecs, scaleConfigs, { rotation }): boolean => {
    return axesSpecs.some(({ chartType, timeAxisLayerCount, position }) => {
      return (
        chartType === 'xy_axis' &&
        timeAxisLayerCount > 0 &&
        isXDomain(position, rotation) &&
        rotation === 0 &&
        scaleConfigs.x.type === ScaleType.Time
      );
    });
  },
);
