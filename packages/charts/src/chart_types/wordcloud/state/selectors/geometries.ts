/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from './scenegraph';
import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecFromStore } from '../../../../state/utils';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { WordcloudSpec } from '../../specs';

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCustomCachedSelector(
  [getSpecs, getChartThemeSelector, getParentDimensions],
  (specs, theme, parentDimensions): ShapeViewModel => {
    const wordcloudSpec = getSpecFromStore<WordcloudSpec, false>(specs, ChartType.Wordcloud, SpecType.Series, false);
    return wordcloudSpec ? render(wordcloudSpec, theme, parentDimensions) : nullShapeViewModel();
  },
);
