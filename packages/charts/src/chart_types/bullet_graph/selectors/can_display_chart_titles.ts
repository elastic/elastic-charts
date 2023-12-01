/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getBulletSpec } from './get_bullet_spec';
import { createCustomCachedSelector } from '../../../state/create_selector';

/** @internal */
export const canDisplayChartTitles = createCustomCachedSelector([getBulletSpec], (spec): boolean => {
  return (spec?.data?.length ?? 0) > 1 || (spec?.data?.[0]?.length ?? 0) > 1;
});
