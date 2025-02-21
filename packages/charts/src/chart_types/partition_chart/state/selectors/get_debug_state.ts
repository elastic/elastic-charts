/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { partitionMultiGeometries } from './geometries';
import { TAU } from '../../../../common/constants';
import type { Pixels, PointObject } from '../../../../common/geometry';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { DebugState, PartitionDebugState } from '../../../../state/types';
import type { QuadViewModel } from '../../layout/types/viewmodel_types';
import { isSunburst } from '../../layout/viewmodel/viewmodel';

/** @internal */
export const getDebugStateSelector = createCustomCachedSelector([partitionMultiGeometries], (geoms): DebugState => {
  return {
    partition: geoms.reduce<PartitionDebugState[]>((acc, { layout, panel, quadViewModel, diskCenter }) => {
      const partitions: PartitionDebugState['partitions'] = quadViewModel.map((model) => {
        const { dataName, depth, fillColor, value } = model;
        return {
          name: dataName,
          depth,
          color: fillColor,
          value,
          coords: isSunburst(layout) ? getCoordsForSector(model, diskCenter) : getCoordsForRectangle(model, diskCenter),
        };
      });
      acc.push({
        panelTitle: panel.title,
        partitions,
      });
      return acc;
    }, []),
  };
});

function getCoordsForSector({ x0, x1, y1px, y0px }: QuadViewModel, diskCenter: PointObject): [Pixels, Pixels] {
  const X0 = x0 - TAU / 4;
  const X1 = x1 - TAU / 4;
  const cr = y0px + (y1px - y0px) / 2;
  const angle = X0 + (X1 - X0) / 2;
  const x = Math.round(Math.cos(angle) * cr + diskCenter.x);
  const y = Math.round(Math.sin(angle) * cr + diskCenter.y);
  return [x, y];
}

function getCoordsForRectangle({ x0, x1, y1px, y0px }: QuadViewModel, diskCenter: PointObject): [Pixels, Pixels] {
  const y = Math.round(y0px + (y1px - y0px) / 2 + diskCenter.y);
  const x = Math.round(x0 + (x1 - x0) / 2 + diskCenter.x);
  return [x, y];
}
