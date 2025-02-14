/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalMainProjectionAreaSelector } from './get_internal_main_projection_area';
import { getInternalSmallMultiplesDomains } from './get_internal_sm_domains';
import { getSmallMultiplesScale } from './get_small_multiples_scale';
import { getSmallMultiplesSpec } from './get_small_multiples_spec';
import type { SmallMultipleScales } from '../../common/panel_utils';
import { createCustomCachedSelector } from '../create_selector';

/**
 * Return the small multiple scales for horizontal and vertical grids
 * @internal
 */
export const computeSmallMultipleScalesSelector = createCustomCachedSelector(
  [getInternalSmallMultiplesDomains, getInternalMainProjectionAreaSelector, getSmallMultiplesSpec],
  ({ smHDomain, smVDomain }, { width, height }, smSpec): SmallMultipleScales => {
    return {
      horizontal: getSmallMultiplesScale(smHDomain, width, smSpec?.style?.horizontalPanelPadding),
      vertical: getSmallMultiplesScale(smVDomain, height, smSpec?.style?.verticalPanelPadding),
    };
  },
);
