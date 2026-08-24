/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { partitionMultiGeometries } from './geometries';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHighlightedPaths } from '../../../../state/selectors/get_highlighted_paths';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { QuadViewModel } from '../../layout/types/viewmodel_types';
import { highlightedGeoms } from '../../layout/utils/highlighted_geoms';

/** @internal */
export const legendHoverHighlightNodes = createCustomCachedSelector(
  [getSettingsSpecSelector, getHighlightedPaths, partitionMultiGeometries],
  ({ legendStrategy, flatLegend }, highlightedPaths, geometries): QuadViewModel[] => {
    if (highlightedPaths.length === 0) return [];
    return geometries.flatMap(({ quadViewModel }) =>
      highlightedGeoms(legendStrategy, flatLegend, quadViewModel, highlightedPaths),
    );
  },
);
