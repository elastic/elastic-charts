/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from './scenegraph';
import { SpecType } from '../../../../specs/spec_type';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecFromStore } from '../../../../state/utils/get_spec_from_store';
import { ChartType } from '../../../chart_type';
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
