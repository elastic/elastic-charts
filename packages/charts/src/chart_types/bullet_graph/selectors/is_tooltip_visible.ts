/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipInfo } from './get_tooltip_info';
import { TooltipType } from '../../../specs/constants';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { TooltipVisibility } from '../../../state/internal_chart_state';
import { getTooltipSpecSelector } from '../../../state/selectors/get_tooltip_spec';

/** @internal */
export const isTooltipVisible = createCustomCachedSelector(
  [getTooltipSpecSelector, getTooltipInfo],
  ({ type }, tooltipInfo): TooltipVisibility => {
    return {
      visible: type !== TooltipType.None && (tooltipInfo?.values.length ?? 0) > 0,
      isExternal: false,
      displayOnly: false,
      isPinnable: false,
    };
  },
);
