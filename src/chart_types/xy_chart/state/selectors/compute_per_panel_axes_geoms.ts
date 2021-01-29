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

import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { Position } from '../../../../utils/common';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { AxisGeometry } from '../../utils/axis_utils';
import { hasSMDomain } from '../../utils/panel';
import { PerPanelMap, getPerPanelMap } from '../../utils/panel_utils';
import { computeAxesGeometriesSelector } from './compute_axes_geometries';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';
import { getSmallMultiplesIndexOrderSelector, SmallMultiplesGroupBy } from './get_specs';

/** @internal */
export type PerPanelAxisGeoms = {
  axesGeoms: AxisGeometry[];
} & PerPanelMap;

const isPrimaryAxis = (primaryColumn: boolean, primaryRow: boolean, position: Position, debug?: boolean) => {
  if (primaryColumn && primaryRow) {
    return true;
  }
  return primaryColumn ? isVerticalAxis(position) : isHorizontalAxis(position);
};

const getPanelTitle = (
  isVertical: boolean,
  verticalValue: any,
  horizontalValue: any,
  groupBy?: SmallMultiplesGroupBy,
): string => {
  const formatter = isVertical ? groupBy?.vertical?.title : groupBy?.horizontal?.title;

  if (formatter) {
    try {
      const value = isVertical ? `${verticalValue}` : `${horizontalValue}`;
      return formatter(value);
    } catch {
      // fallthrough
    }
  }
  return isVertical ? `${verticalValue}` : `${horizontalValue}`;
};

/** @internal */
export const computePerPanelAxesGeomsSelector = createCachedSelector(
  [computeAxesGeometriesSelector, computeSmallMultipleScalesSelector, getSmallMultiplesIndexOrderSelector],
  (axesGeoms, scales, groupBySpec): Array<PerPanelAxisGeoms> => {
    const { horizontal, vertical } = scales;
    const t = getPerPanelMap(scales, (_, h, v) => {
      const primaryColumn = isPrimaryColumn(horizontal, h);
      const primaryRow = isPrimaryRow(scales, h, v, primaryColumn);

      if (primaryColumn || primaryRow) {
        return {
          axesGeoms: axesGeoms
            .filter(({ axis: { position } }) => {
              if (primaryColumn && primaryRow) {
                return true;
              }
              return primaryColumn ? isVerticalAxis(position) : isHorizontalAxis(position);
            })
            .map((geom) => {
              const {
                axis: { position },
              } = geom;
              const isVertical = isVerticalAxis(position);
              const usePanelTitle = isVertical ? hasSMDomain(vertical) : hasSMDomain(horizontal);
              const panelTitle = usePanelTitle ? getPanelTitle(isVertical, v, h, groupBySpec) : undefined;

              return {
                ...geom,
                axis: {
                  ...geom.axis,
                  panelTitle,
                  secondary: false,
                },
              };
            }),
        };
      }

      return null;
    });

    return t;
  },
)(getChartIdSelector);

function isPrimaryRow(
  { horizontal, vertical }: SmallMultipleScales,
  horizontalValue: any,
  verticalValue: any,
  test?: boolean,
) {
  // if (test) debugger;

  // return horizontal.domain.includes(horizontalValue) &&
  // horizontal.domain.length === 1 ?
  //   vertical.domain.includes(verticalValue) : vertical.domain[vertical.domain.length - 1] === verticalValue;

  return horizontal.domain.includes(horizontalValue) && vertical.domain.includes(verticalValue);
}

function isPrimaryColumn({ domain }: SmallMultipleScales['horizontal'], horizontalValue: any) {
  return domain[0] === horizontalValue;
}
