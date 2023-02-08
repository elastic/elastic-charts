/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleBand } from '../scales';
import { GroupBySpec } from '../specs/group_by';
import { safeFormat } from '../utils/common';
import { Size } from '../utils/dimensions';
import { OrdinalDomain } from '../utils/domain';
import { Point } from '../utils/point';

type Value = string | number;

/** @internal */
export interface PerPanelMap {
  panelAnchor: Point;
  horizontalValue: Value;
  verticalValue: Value;
}

/** @internal */
export interface SmallMultipleScales {
  horizontal: ScaleBand;
  vertical: ScaleBand;
}

/** @internal */
export interface SmallMultiplesGroupBy {
  vertical?: GroupBySpec;
  horizontal?: GroupBySpec;
}

/** @internal */
export interface SmallMultiplesSeriesDomains {
  smVDomain: OrdinalDomain;
  smHDomain: OrdinalDomain;
}

/** @internal */
export interface SmallMultiplesDatum {
  smHorizontalAccessorValue?: string | number;
  smVerticalAccessorValue?: string | number;
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
          x: horizontal.scale(horizontalValue) || 0,
          y: vertical.scale(verticalValue) || 0,
        };
        const fnObj = fn(panelAnchor, horizontalValue, verticalValue, scales);
        return fnObj ? [...hAcc, { panelAnchor, horizontalValue, verticalValue, ...fnObj }] : hAcc;
      }, []),
    ];
  }, []);
}

/** @internal */
export function getPanelSize({ horizontal, vertical }: SmallMultipleScales): Size {
  return { width: horizontal.bandwidth, height: vertical.bandwidth };
}

/** @internal */
export const hasSMDomain = ({ domain }: SmallMultipleScales['horizontal'] | SmallMultipleScales['vertical']) =>
  domain.length > 0 && domain[0] !== undefined;

/** @internal */
export const getPanelTitle = (
  isVertical: boolean,
  verticalValue: any,
  horizontalValue: any,
  groupBy?: SmallMultiplesGroupBy,
): string => {
  const formatter = isVertical ? groupBy?.vertical?.format : groupBy?.horizontal?.format;
  const value = isVertical ? `${verticalValue}` : `${horizontalValue}`;

  return safeFormat(value, formatter);
};
