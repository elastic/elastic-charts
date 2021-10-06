/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { mergePartial } from '../../../../utils/common';
import { config as defaultConfig } from '../../layout/config/config';
import { Config } from '../../layout/types/config_types';
import { getHeatmapSpecSelector } from './get_heatmap_spec';

/** @internal */
export const getHeatmapConfigSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector],
  (spec): Config => mergePartial<Config>(defaultConfig, spec.config),
);
