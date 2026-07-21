/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './labels';
import type { ScaleBand, ScaleContinuous } from '../../../../scales';
import type { AxisId } from '../../../../utils/ids';
import type { AxisLabelFormatter } from '../../state/selectors/axis_tick_formatter';

type TickValue = number | string;

/** @internal */
export type TextDirection = 'rtl' | 'ltr';

/** @internal */
export interface AxisTick {
  value: TickValue;
  domainClampedValue: TickValue;
  label: string;
  position: number;
  domainClampedPosition: number;
  layer?: number;
  detailedLayer: number;
  showGrid: boolean;
  direction: TextDirection;
  multilayerTimeAxis: boolean;
  layout: TickLabelBox;
}

/** @internal */
export type Projection = { ticks: AxisTick[]; scale: ScaleBand | ScaleContinuous };

/** @internal */
export type Projections = Map<AxisId, Projection>;

/** @internal */
export type GetMeasuredTicks = (
  scale: ScaleBand | ScaleContinuous,
  ticks: (number | string)[],
  layer: number | undefined,
  detailedLayer: number,
  labelFormatter: AxisLabelFormatter,
  showGrid?: boolean,
) => Projection;
