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
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geoms, Mark } from '../../layout/viewmodel/geoms';
import { GoalSpec } from '../../specs';
import { render } from './scenegraph';

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCustomCachedSelector(
  [getSpecs, getParentDimensions, getChartThemeSelector],
  (specs, parentDimensions, theme): ShapeViewModel => {
    const goalSpecs = getSpecsFromStore<GoalSpec>(specs, ChartType.Goal, SpecType.Series);
    return goalSpecs.length === 1 ? render(goalSpecs[0], parentDimensions, theme) : nullShapeViewModel(theme);
  },
);

/** @internal */
export const getPrimitiveGeoms = createCustomCachedSelector(
  [geometries, getParentDimensions],
  (shapeViewModel, parentDimensions): Mark[] => {
    const { chartCenter, bulletViewModel, theme } = shapeViewModel;
    return geoms(bulletViewModel, theme, parentDimensions, chartCenter);
  },
);
