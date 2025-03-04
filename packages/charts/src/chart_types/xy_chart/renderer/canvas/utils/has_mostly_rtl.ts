/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { hasMostlyRTLItems } from '../../../../../utils/common';
import type { PerPanelAxisGeoms } from '../../../state/selectors/compute_per_panel_axes_geoms';

/** @internal */
export function hasMostlyRTL(geoms: PerPanelAxisGeoms[]): boolean {
  // returns all string value labels
  const labels = geoms.flatMap(({ axesGeoms }) => {
    return axesGeoms.flatMap(({ visibleTicks }) => {
      return visibleTicks
        .filter(({ value, label }) => typeof value === 'string' && label !== '')
        .map(({ label }) => label);
    });
  });

  return hasMostlyRTLItems(labels);
}
