/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { isSimpleLinear } from '../../layout/viewmodel/viewmodel';
import { getPartitionSpecs } from './partition_spec';

/** @internal */
export const drilldownActive = createCustomCachedSelector([getPartitionSpecs], (specs) => {
  return specs.length === 1 && isSimpleLinear(specs[0].config, specs[0].layers); // singleton!
});
