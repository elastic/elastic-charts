/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './labels';

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
