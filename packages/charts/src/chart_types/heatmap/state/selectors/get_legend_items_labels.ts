/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './compute_legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/** @internal */
export const getLegendItemsLabelsSelector = createCustomCachedSelector(
  [computeLegendSelector, getSettingsSpecSelector],
  (legendItems, { legendValues }): LegendItemLabel[] =>
    legendItems.map(({ label, values }) => {
      return {
        label: `${label}${legendValues.length > 0 ? values[0]?.label ?? '' : ''}`,
        depth: 0,
      };
    }),
);
