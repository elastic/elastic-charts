/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { ProjectedValues } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { isNil } from '../../../../utils/common';

/** @internal */
export const getProjectedScaledValues = createCustomCachedSelector(
  [getOrientedProjectedPointerPositionSelector, computeSeriesGeometriesSelector, getGeometriesIndexKeysSelector],
  (
    { x, y, verticalPanelValue, horizontalPanelValue },
    { scales: { xScale, yScales } },
    geometriesIndexKeys,
  ): ProjectedValues | undefined => {
    if (!xScale || x === -1) {
      return;
    }

    const xValue = xScale.invertWithStep(x, geometriesIndexKeys as number[]).value; // TODO fix this cast
    if (isNil(xValue) || Number.isNaN(xValue)) {
      return;
    }

    return {
      x: xValue,
      y: [...yScales.entries()].map(([groupId, yScale]) => ({ value: yScale.invert(y), groupId })),
      smVerticalValue: verticalPanelValue,
      smHorizontalValue: horizontalPanelValue,
    };
  },
);
