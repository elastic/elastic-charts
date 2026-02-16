/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalMainProjectionAreaSelector } from './get_internal_main_projection_area';
import { getInternalSmallMultiplesDomains } from './get_internal_sm_domains';
import { getSmallMultiplesSpec } from './get_small_multiples_spec';
import type { SmallMultipleScales } from '../../common/panel_utils';
import type { RelativeBandsPadding } from '../../specs';
import { DEFAULT_SM_PANEL_PADDING } from '../../specs';
import { createCustomCachedSelector } from '../create_selector';
import { getSmallMultiplesScale } from '../utils/get_small_multiples_scale';

const INDEPENDENT_Y_DOMAIN_PADDING: RelativeBandsPadding = { outer: 0, inner: 0.25 };

/**
 * Return the small multiple scales for horizontal and vertical grids
 * @internal
 */
export const computeSmallMultipleScalesSelector = createCustomCachedSelector(
  [getInternalSmallMultiplesDomains, getInternalMainProjectionAreaSelector, getSmallMultiplesSpec],
  ({ smHDomain, smVDomain }, { width, height }, smSpec): SmallMultipleScales => {
    // When independentYDomain is active, use wider horizontal padding to accommodate
    // per-panel Y-axis tick labels, unless the user specified a custom padding
    const defaultHPadding = smSpec?.independentYDomain ? INDEPENDENT_Y_DOMAIN_PADDING : DEFAULT_SM_PANEL_PADDING;
    const hPadding = smSpec?.style?.horizontalPanelPadding ?? defaultHPadding;
    return {
      horizontal: getSmallMultiplesScale(smHDomain, width, hPadding),
      vertical: getSmallMultiplesScale(smVDomain, height, smSpec?.style?.verticalPanelPadding),
    };
  },
);
