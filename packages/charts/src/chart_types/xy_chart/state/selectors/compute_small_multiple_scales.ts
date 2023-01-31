/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { ScaleBand } from '../../../../scales';
import { DEFAULT_SM_PANEL_PADDING, RelativeBandsPadding } from '../../../../specs/small_multiples';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { OrdinalDomain } from '../../../../utils/domain';

/** @internal */
export interface SmallMultipleScales {
  horizontal: ScaleBand;
  vertical: ScaleBand;
}

/**
 * Return the small multiple scales for horizontal and vertical grids
 * @internal
 */
export const computeSmallMultipleScalesSelector = createCustomCachedSelector(
  [computeSeriesDomainsSelector, computeChartDimensionsSelector, getSmallMultiplesSpec],
  ({ smHDomain, smVDomain }, { chartDimensions: { width, height } }, smSpec): SmallMultipleScales => {
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
