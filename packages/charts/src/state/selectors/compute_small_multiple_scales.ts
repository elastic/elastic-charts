/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultipleScales } from '../../common/panel_utils';
import { ScaleBand } from '../../scales';
import { RelativeBandsPadding, DEFAULT_SM_PANEL_PADDING } from '../../specs';
import { OrdinalDomain } from '../../utils/domain';
import { createCustomCachedSelector } from '../create_selector';
import { getInternalMainProjectionAreaSelector } from './get_internal_main_projection_area';
import { getInternalSmallMultiplesDomains } from './get_internal_sm_domains';
import { getSmallMultiplesSpec } from './get_small_multiples_spec';

/**
 * Return the small multiple scales for horizontal and vertical grids
 * @internal
 */
export const computeSmallMultipleScalesSelector = createCustomCachedSelector(
  [getInternalSmallMultiplesDomains, getInternalMainProjectionAreaSelector, getSmallMultiplesSpec],
  ({ smHDomain, smVDomain }, { width, height }, smSpec): SmallMultipleScales => {
    return {
      horizontal: getScale(smHDomain, width, smSpec && smSpec[0].style?.horizontalPanelPadding),
      vertical: getScale(smVDomain, height, smSpec && smSpec[0].style?.verticalPanelPadding),
    };
  },
);

/**
 * @internal
 */
export function getScale(
  domain: OrdinalDomain,
  maxRange: number,
  padding: RelativeBandsPadding = DEFAULT_SM_PANEL_PADDING,
): ScaleBand {
  const singlePanelSmallMultiple = domain.length <= 1;
  return new ScaleBand(domain, [0, maxRange], undefined, singlePanelSmallMultiple ? 0 : padding);
}
