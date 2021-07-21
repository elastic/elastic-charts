/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecs } from '../../../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geoms, Mark } from '../../layout/viewmodel/geoms';
import { GoalSpec } from '../../specs';
import { render } from './scenegraph';

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCustomCachedSelector(
  [getSpecs, getParentDimensions],
  (specs, parentDimensions): ShapeViewModel => {
    const goalSpecs = getSpecsFromStore<GoalSpec>(specs, ChartType.Goal, SpecType.Series);
    return goalSpecs.length === 1 ? render(goalSpecs[0], parentDimensions) : nullShapeViewModel();
  },
);

/** @internal */
export const getPrimitiveGeoms = createCustomCachedSelector(
  [geometries, getParentDimensions],
  (shapeViewModel: ShapeViewModel, { width, height }): Mark[] => {
    const { config, chartCenter, bulletViewModel } = shapeViewModel;
    return geoms(bulletViewModel, { ...config, width, height }, chartCenter);
  },
);
