/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../chart_types';
import { Spec } from '../specs';
import { PointerState, PointerStates, SpecList, TooltipInteractionState } from './chart_state';

/**
 * Returns all matching specs
 * @internal
 */
export function getSpecsFromStore<U extends Spec>(specs: SpecList, chartType: ChartType, specType: string): U[] {
  return Object.values(specs).filter((spec) => spec.chartType === chartType && spec.specType === specType) as U[];
}

/**
 * Returns first matching spec
 * @internal
 */
export function getSpecFromStore<U extends Spec>(
  specs: SpecList,
  chartType: ChartType,
  specType: string,
): U | undefined {
  return (
    (Object.values(specs).find((spec) => spec.chartType === chartType && spec.specType === specType) as U) ?? undefined
  );
}

/** @internal */
export function isClicking(prevClick: PointerState | null, lastClick: PointerState | null) {
  return lastClick && (!prevClick || prevClick.time !== lastClick.time);
}

/** @internal */
export const getInitialPointerState = (): PointerStates => ({
  dragging: false,
  current: { position: { x: -1, y: -1 }, time: 0 },
  pinned: null,
  down: null,
  up: null,
  lastDrag: null,
  lastClick: null,
});

/** @internal */
export const getInitialTooltipState = (): TooltipInteractionState => ({
  pinned: false,
  selected: [],
});
