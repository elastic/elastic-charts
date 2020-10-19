/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import createCachedSelector from 're-reselect';

import { ScaleBand } from '../../../../scales';
import { DEFAULT_SINGLE_PANEL_SM_VALUE, DEFAULT_SM_PANEL_PADDING } from '../../../../specs/small_multiples';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Domain } from '../../../../utils/domain';
import { isHorizontalRotation } from '../utils/common';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesDomainsSelector } from './compute_series_domains';

/** @internal */
export interface SmallMultipleScales {
  horizontal: ScaleBand;
  vertical: ScaleBand;
}

/** @internal */
export const computeSmallMultipleScalesSelector = createCachedSelector(
  [getSettingsSpecSelector, computeSeriesDomainsSelector, computeChartDimensionsSelector],
  ({ rotation }, { smHDomain, smVDomain }, { chartDimensions: { width, height } }): SmallMultipleScales => {
    const isChartHorizontalOriented = isHorizontalRotation(rotation);
    const rotatedWidth = isChartHorizontalOriented ? width : height;
    const rotatedHeight = isChartHorizontalOriented ? height : width;

    return {
      horizontal: getScale(smHDomain, rotatedWidth),
      vertical: getScale(smVDomain, rotatedHeight),
    };
  },
)(getChartIdSelector);

function getScale(domain: Domain, maxRange: number) {
  const singlePanelSmallMultiple = domain.length === 0;
  return new ScaleBand(
    singlePanelSmallMultiple ? [DEFAULT_SINGLE_PANEL_SM_VALUE] : domain,
    [0, maxRange],
    undefined,
    singlePanelSmallMultiple ? 0 : DEFAULT_SM_PANEL_PADDING,
  );
}
