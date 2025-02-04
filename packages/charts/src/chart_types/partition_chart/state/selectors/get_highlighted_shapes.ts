/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { partitionMultiGeometries } from './geometries';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { highlightedGeoms } from '../../layout/utils/highlighted_geoms';

const getHighlightedLegendItemPath = (state: GlobalChartState) => state.interactions.highlightedLegendPath;

/** @internal */
export const legendHoverHighlightNodes = createCustomCachedSelector(
  [getSettingsSpecSelector, getHighlightedLegendItemPath, partitionMultiGeometries],
  ({ legendStrategy, flatLegend }, highlightedLegendItemPath, geometries): QuadViewModel[] => {
    if (highlightedLegendItemPath.length === 0) return [];
    return geometries.flatMap(({ quadViewModel }) =>
      highlightedGeoms(legendStrategy, flatLegend, quadViewModel, highlightedLegendItemPath),
    );
  },
);
