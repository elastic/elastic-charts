/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Point } from '../../../utils/point';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';

type Value = string | number;

/** @internal */
export interface PerPanelMap {
  panelAnchor: Point;
  horizontalValue: Value;
  verticalValue: Value;
}

/** @internal */
export function getPerPanelMap<T>(
  scales: SmallMultipleScales,
  fn: (anchor: Point, horizontalValue: Value, verticalValue: Value, smScales: SmallMultipleScales) => T | null,
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
        return fnObj ? [...hAcc, { panelAnchor, horizontalValue, verticalValue, ...fnObj }] : hAcc;
      }, []),
    ];
  }, []);
}
