/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { partitionMultiGeometries } from './geometries';
import { getPartitionSpec } from './partition_spec';
import { getPickedShapes } from './picked_shapes';
import type { TooltipInfo } from '../../../../components/tooltip/types';
import { EMPTY_TOOLTIP } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { pickShapesTooltipValues } from '../../layout/viewmodel/picked_shapes';

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getPartitionSpec, getPickedShapes, partitionMultiGeometries],
  (spec, pickedShapes, shapeViewModel): TooltipInfo => {
    return spec
      ? pickShapesTooltipValues(pickedShapes, shapeViewModel, spec.valueFormatter, spec.percentFormatter, spec.id)
      : EMPTY_TOOLTIP;
  },
);
