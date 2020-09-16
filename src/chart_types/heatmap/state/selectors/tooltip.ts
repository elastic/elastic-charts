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

import { TooltipInfo } from '../../../../components/tooltip/types';
import { RGBtoString } from '../../../partition_chart/layout/utils/color_library_wrappers';
import { getSpecOrNull } from './heatmap_spec';
import { getPickedShapes } from './picked_shapes';

const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
});

/** @internal */
export const getTooltipInfoSelector = createCachedSelector(
  [getSpecOrNull, getPickedShapes],
  (spec, pickedShapes): TooltipInfo => {
    if (!spec) {
      return EMPTY_TOOLTIP;
    }

    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };

    pickedShapes.forEach((shape) => {
      tooltipInfo.values.push({
        label: `${shape.datum.y} - ${shape.datum.x}`,
        color: RGBtoString(shape.fill.color),
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: spec.id,
          key: spec.id,
        },
        value: `${shape.value}`,
        formattedValue: `${shape.value}`,
      });
    });

    return tooltipInfo;
  },
)((state) => state.chartId);
