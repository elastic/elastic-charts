/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisId } from '../../../utils/ids';
import type { Projection } from '../axes/visible_ticks';
import type { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';

/** @internal */
export const projectionToTickDimensions = (projections: Map<AxisId, Projection>): AxesTicksDimensions => {
  const tickDimensions = new Map();
  projections.forEach(({ ticks }, id) => {
    tickDimensions.set(
      id,
      ticks.map((tick) => tick.bounds),
    );
  });
  return tickDimensions;
};
