/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isFiniteNumber } from '../../../utils/common';
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
        const x = horizontal.scale(horizontalValue);
        const y = vertical.scale(verticalValue);
        const panelAnchor: Point = {
          x: isFiniteNumber(x) ? x : 0,
          y: isFiniteNumber(y) ? y : 0,
        };
        const fnObj = fn(panelAnchor, horizontalValue, verticalValue, scales);
        return fnObj ? [...hAcc, { panelAnchor, horizontalValue, verticalValue, ...fnObj }] : hAcc;
      }, []),
    ];
  }, []);
}
