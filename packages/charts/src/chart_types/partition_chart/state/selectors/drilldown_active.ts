/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPartitionSpecs } from './partition_spec';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { isSimpleLinear } from '../../layout/viewmodel/viewmodel';

/** @internal */
export const drilldownActive = createCustomCachedSelector(
  [getPartitionSpecs, getChartThemeSelector],
  (specs, { partition }) => {
    return specs.length === 1 && isSimpleLinear(specs[0].layout, partition.fillLabel, specs[0].layers); // singleton!
  },
);
