/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPartitionSpecs } from './get_partition_specs';
import { getTrees } from './tree';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getLegendLabelsAndValue } from '../../layout/utils/legend_labels';

/** @internal */
export const getLegendItemsLabels = createCustomCachedSelector(
  [getPartitionSpecs, getSettingsSpecSelector, getTrees],
  (specs, { legendMaxDepth, showLegend, legendValues }, trees): LegendItemLabel[] =>
    specs.flatMap(({ layers, valueFormatter }) =>
      showLegend
        ? trees.flatMap(({ tree }) =>
            getLegendLabelsAndValue(layers, tree, legendMaxDepth, legendValues.length > 0 ? valueFormatter : () => ''),
          )
        : [],
    ),
);
