/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipInfo } from '../../../../components/tooltip/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { pickShapesTooltipValues } from '../../layout/viewmodel/picked_shapes';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpec } from './partition_spec';
import { getPickedShapes } from './picked_shapes';

const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getPartitionSpec, getPickedShapes, partitionMultiGeometries],
  (spec, pickedShapes, shapeViewModel): TooltipInfo => {
    return spec
      ? pickShapesTooltipValues(
          pickedShapes,
          shapeViewModel,
          spec.valueGetter,
          spec.valueFormatter,
          spec.percentFormatter,
          spec.id,
        )
      : EMPTY_TOOLTIP;
  },
);
