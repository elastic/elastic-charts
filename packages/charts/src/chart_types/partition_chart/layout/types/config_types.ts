/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import type { Ratio } from '../../../../common/geometry';

/** @public */
export const PartitionLayout = Object.freeze({
  sunburst: 'sunburst' as const,
  treemap: 'treemap' as const,
  icicle: 'icicle' as const,
  flame: 'flame' as const,
  mosaic: 'mosaic' as const,
  waffle: 'waffle' as const,
});

/** @public */
export type PartitionLayout = $Values<typeof PartitionLayout>; // could use ValuesType<typeof HierarchicalChartTypes>

/** @alpha */
export type EasingFunction = (x: Ratio) => Ratio;

/** @alpha */
export interface AnimKeyframe {
  time: number;
  easingFunction: EasingFunction;
}
