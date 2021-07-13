/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipInfo } from '../../../../components/tooltip/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { EMPTY_TOOLTIP, getTooltipInfo } from '../../layout/viewmodel/tooltip_info';
import { getPartitionSpec } from './partition_spec';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getPartitionSpec, getPickedShapes],
  (spec, pickedShapes): TooltipInfo => {
    return spec
      ? getTooltipInfo(
          pickedShapes,
          spec.layers.map((l) => l.nodeLabel),
          spec.valueGetter,
          spec.valueFormatter,
          spec.percentFormatter,
          spec.id,
        )
      : EMPTY_TOOLTIP;
  },
);
