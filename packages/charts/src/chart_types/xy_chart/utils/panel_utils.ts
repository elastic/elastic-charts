/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Point } from '../../../utils/point';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';

/** @internal */
export interface PerPanelMap {
  panelAnchor: Point;
  horizontalValue: any;
  verticalValue: any;
}

/** @internal */
export function getPerPanelMap<T>(
  scales: SmallMultipleScales,
  fn: (panelAnchor: Point, horizontalValue: any, verticalValue: any, scales: SmallMultipleScales) => T | null,
): Array<T & PerPanelMap> {
  const { horizontal, vertical } = scales;
  return vertical.domain.reduce<Array<T & PerPanelMap>>((acc, verticalValue) => {
    return [
      ...acc,
      ...horizontal.domain.reduce<Array<T & PerPanelMap>>((hAcc, horizontalValue) => {
        const panelAnchor: Point = {
          x: horizontal.scale(horizontalValue) ?? 0,
          y: vertical.scale(verticalValue) ?? 0,
        };
        const fnObj = fn(panelAnchor, horizontalValue, verticalValue, scales);
        if (!fnObj) {
          return hAcc;
        }
        return [
          ...hAcc,
          {
            panelAnchor,
            horizontalValue,
            verticalValue,
            ...fnObj,
          },
        ];
      }, []),
    ];
  }, []);
}
