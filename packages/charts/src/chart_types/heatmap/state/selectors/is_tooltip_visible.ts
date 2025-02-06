/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipInfoSelector } from './tooltip';
import { TooltipType } from '../../../../specs/constants';
import { TooltipVisibility } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';

/** @internal */
export const isTooltipVisibleSelector = createCustomCachedSelector(
  [getTooltipSpecSelector, getTooltipInfoSelector, getTooltipInteractionState],
  ({ type }, tooltipInfo, { pinned }): TooltipVisibility => {
    if (type === TooltipType.None) {
      return {
        visible: false,
        isExternal: false,
        displayOnly: false,
        isPinnable: false,
      };
    }

    return {
      visible: tooltipInfo.values.length > 0 || pinned,
      displayOnly: tooltipInfo.values.every(({ displayOnly }) => displayOnly),
      isExternal: false,
      isPinnable: tooltipInfo.values.length > 0,
    };
  },
);
