/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import type { ScaleBand } from '../scales';
import type { GroupBySpec } from '../specs/group_by';
import { safeFormat } from '../utils/common';
import type { Dimensions, Size } from '../utils/dimensions';
import type { OrdinalDomain } from '../utils/domain';
import type { Point } from '../utils/point';

type Value = string | number;

/** @internal */
export interface PerPanelMap {
  panelAnchor: Point;
  horizontalValue: NonNullable<PrimitiveValue>;
  verticalValue: NonNullable<PrimitiveValue>;
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

/** @public */
export interface SmallMultiplesDatum {
  smHorizontalAccessorValue?: NonNullable<PrimitiveValue>;
  smVerticalAccessorValue?: NonNullable<PrimitiveValue>;
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
        const fnReturn = fn(panelAnchor, horizontalValue, verticalValue, scales);
        return fnReturn ? [...hAcc, { panelAnchor, horizontalValue, verticalValue, ...fnReturn }] : hAcc;
      }, []),
    ];
  }, []);
}

/** @internal */
export function getPanelSize({ horizontal, vertical }: SmallMultipleScales): Size {
  return { width: horizontal.bandwidth, height: vertical.bandwidth };
}

/**
 * returns true for scales with empty input domains
 * TODO: Cleanup See https://github.com/elastic/elastic-charts/issues/1990
 * @internal
 */
export const hasSMDomain = ({ domain }: SmallMultipleScales['horizontal'] | SmallMultipleScales['vertical']) =>
  domain.length > 0 && domain[0] !== undefined;

/** @internal */
export const getPanelTitle = (
  isVertical: boolean,
  verticalValue: NonNullable<PrimitiveValue>,
  horizontalValue: NonNullable<PrimitiveValue>,
  groupBy?: SmallMultiplesGroupBy,
): string => {
  return isVertical
    ? safeFormat(`${verticalValue}`, groupBy?.vertical?.format)
    : safeFormat(`${horizontalValue}`, groupBy?.horizontal?.format);
};

/**
 * Returns true if pointer is within a panel inside the chart area, otherwise false
 * Returns false when pointer is in the padding gutter and axes
 * @internal
 */
export const isPointerOverPanelFn =
  (smScales: SmallMultipleScales, chartDimensions: Dimensions, gridStroke: number) =>
  (pointer: Point): boolean => {
    return (
      isPointerInsideChart(chartDimensions)(pointer) &&
      isPointerInBandwidth(smScales.horizontal, pointer.x - chartDimensions.left, gridStroke) &&
      isPointerInBandwidth(smScales.vertical, pointer.y - chartDimensions.top, gridStroke)
    );
  };

function isPointerInBandwidth(
  scale: SmallMultipleScales['horizontal'] | SmallMultipleScales['vertical'],
  dimension: number,
  gridStroke: number,
): boolean {
  const { bandwidth, innerPadding } = scale;
  const padding = innerPadding * bandwidth;
  const divisor = bandwidth + padding + gridStroke * 2;
  const vDiv = Math.floor(dimension / divisor);
  const lower = vDiv * divisor;
  const upper = lower + bandwidth + gridStroke * 2;

  return dimension > lower && dimension <= upper;
}

/**
 * Returns true if the pointer is within the chart dimensions, false otherwise
 * @internal
 */
export const isPointerInsideChart =
  ({ left, top, height, width }: Dimensions) =>
  ({ x, y }: Point): boolean =>
    x > left && x < left + width && y > top && y < top + height;
