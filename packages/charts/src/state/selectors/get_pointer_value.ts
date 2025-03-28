/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import type { PointerValue } from '../types';

/** @internal */
export const getPointerValueSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): PointerValue | undefined => {
    // TODO: this is taken from the tooltip header currently. Should in the future
    // be implemented separately (and probably used *as* the tooltip header).
    const header = internalChartState?.getTooltipInfo(globalChartState)?.header;
    if (header) {
      const { value, formattedValue, valueAccessor } = header;
      return { value, formattedValue, valueAccessor };
    }
  },
);
