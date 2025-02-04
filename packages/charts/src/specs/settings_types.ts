/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { ScaleOrdinalType, ScaleContinuousType } from '../scales';

/** @public */
export const PointerEventType = Object.freeze({
  Over: 'Over' as const,
  Out: 'Out' as const,
});
/** @public */
export type PointerEventType = $Values<typeof PointerEventType>;

/**
 * An object that contains the scaled mouse position based on
 * the current chart configuration.
 * @public
 */
export type ProjectedValues = {
  /**
   * The independent variable of the chart
   */
  x: PrimitiveValue;
  /**
   * The set of dependent variable, each one with its own groupId
   */
  y: Array<{ value: PrimitiveValue; groupId: string }>;
  /**
   * The categorical value used for the vertical placement of the chart
   * in a small multiple layout
   */
  smVerticalValue: PrimitiveValue;
  /**
   * The categorical value used for the horizontal placement of the chart
   * in a small multiple layout
   */
  smHorizontalValue: PrimitiveValue;
};

/** @public */
export interface BasePointerEvent {
  chartId: string;
  type: PointerEventType;
}

/**
 * Event used to synchronize pointers/mouse positions between Charts.
 *
 * fired as callback argument for `PointerUpdateListener`
 * @public
 */
export interface PointerOverEvent extends BasePointerEvent, ProjectedValues {
  type: typeof PointerEventType.Over;
  scale: ScaleContinuousType | ScaleOrdinalType;
  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.) Not currently used/implemented
   * @alpha
   */
  unit?: string;
}

/** @public */
export interface PointerOutEvent extends BasePointerEvent {
  type: typeof PointerEventType.Out;
}

/** @public */
export type PointerEvent = PointerOverEvent | PointerOutEvent;
