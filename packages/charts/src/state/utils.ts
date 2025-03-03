/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TooltipInteractionState } from './interactions_state';
import type { PointerState, PointerStates } from './pointer_states';
import type { ChartType } from '../chart_types';
import type { Spec } from '../specs/spec';
import type { SpecList } from '../specs/spec_type';

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
 * TODO: Make these generator types automatic
 */
export function getSpecFromStore<U extends Spec, R extends boolean, RR = R extends true ? never : null>(
  specs: SpecList,
  chartType: ChartType,
  specType: string,
  required: R,
): U | RR {
  const spec = Object.values(specs).find((spec) => spec.chartType === chartType && spec.specType === specType) as U;

  if (!spec && required) throw new Error(`Unable to find spec [${chartType} = ${specType}]`);

  return spec ?? null;
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
