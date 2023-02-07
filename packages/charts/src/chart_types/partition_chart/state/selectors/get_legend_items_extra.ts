/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPartitionSpec } from './partition_spec';
import { getTrees } from './tree';
import { LegendItemExtraValues } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getExtraValueMap } from '../../layout/viewmodel/hierarchy_of_arrays';

/** @internal */
export const getLegendItemsExtra = createCustomCachedSelector(
  [getPartitionSpec, getSettingsSpecSelector, getTrees],
  (spec, { legendMaxDepth }, trees): Map<SeriesKey, LegendItemExtraValues> => {
    const emptyMap = new Map<SeriesKey, LegendItemExtraValues>();
    return spec && !Number.isNaN(legendMaxDepth) && legendMaxDepth > 0
      ? trees.reduce((result, { tree }) => {
          const treeData = getExtraValueMap(spec.layers, spec.valueFormatter, tree, legendMaxDepth);
          for (const [key, value] of treeData) {
            result.set(key, value);
          }
          return result;
        }, emptyMap)
      : emptyMap;
  },
);
