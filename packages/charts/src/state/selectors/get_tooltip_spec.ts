/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import { SpecType } from '../../specs/constants';
import { DEFAULT_TOOLTIP_SPEC, TooltipSpec } from '../../specs/tooltip';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecFromStore } from '../utils';

/**
 * @internal
 */
export const getTooltipSpecSelector = createCustomCachedSelector([getSpecs], (specs): TooltipSpec => {
  const tooltipSpec = getSpecFromStore<TooltipSpec, false>(specs, ChartType.Global, SpecType.Tooltip, false);
  return tooltipSpec ?? DEFAULT_TOOLTIP_SPEC;
});
