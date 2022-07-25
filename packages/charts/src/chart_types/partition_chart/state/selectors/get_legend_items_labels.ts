/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getLegendLabelsAndValue } from '../../layout/utils/legend_labels';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';

/** @internal */
export const getLegendItemsLabels = createCustomCachedSelector(
  [getPartitionSpecs, getSettingsSpecSelector, getTrees],
  (specs, { legendMaxDepth, showLegend, showLegendExtra }, trees): LegendItemLabel[] =>
    specs.flatMap(({ layers, valueFormatter }) =>
      showLegend
        ? trees.flatMap(({ tree }) =>
            getLegendLabelsAndValue(layers, tree, legendMaxDepth, showLegendExtra ? valueFormatter : () => ''),
          )
        : [],
    ),
);
