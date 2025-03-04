/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalMainProjectionAreaSelector } from './get_internal_main_projection_area';
import { getSettingsSpecSelector } from './get_settings_spec';
import { hasExternalEventSelector } from './has_external_pointer_event';
import { getComputedScalesSelector } from '../../chart_types/xy_chart/state/selectors/get_computed_scales';
import { PointerEventType } from '../../specs';
import { isNil } from '../../utils/common';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const getExternalEventPointer = ({ externalEvents: { pointer } }: GlobalChartState) => pointer;

/** @internal */
export const isExternalTooltipVisibleSelector = createCustomCachedSelector(
  [
    getSettingsSpecSelector,
    hasExternalEventSelector,
    getExternalEventPointer,
    getComputedScalesSelector,
    getInternalMainProjectionAreaSelector,
  ],
  ({ externalPointerEvents }, hasExternalEvent, pointer, { xScale }, chartDimensions): boolean => {
    if (
      !pointer ||
      pointer.type !== PointerEventType.Over ||
      isNil(pointer.x) ||
      externalPointerEvents.tooltip?.visible === false
    ) {
      return false;
    }
    const x = xScale.pureScale(pointer.x);

    if (Number.isNaN(x) || x > chartDimensions.width + chartDimensions.left || x < 0) {
      return false;
    }
    return Boolean(hasExternalEvent && externalPointerEvents.tooltip?.visible);
  },
);
