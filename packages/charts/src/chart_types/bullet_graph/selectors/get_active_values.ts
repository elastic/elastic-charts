/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActiveValue } from './get_active_value';
import { getPanelDimensions } from './get_panel_dimensions';
import { createCustomCachedSelector } from '../../../state/create_selector';

/** @internal */
export interface ActiveValue {
  value: number;
  external: boolean;
}

/** @internal */
export const getActiveValues = createCustomCachedSelector(
  [getActiveValue, getPanelDimensions],
  (activeValue, dimensions): (ActiveValue | null)[][] => {
    if (!activeValue) return [];

    // Synced cursor values should always use the snapValue to avoid strange diffs
    const { snapValue, rowIndex, columnIndex } = activeValue;

    return dimensions.rows.map((row, ri) =>
      row.map((panel, ci): ActiveValue | null => {
        const external = !(rowIndex === ri && columnIndex === ci);
        if (!panel || (!panel.datum.syncCursor && external)) return null;
        if (snapValue > panel.datum.domain.max || snapValue < panel.datum.domain.min) return null;

        return {
          value: panel.scale(snapValue),
          external,
        };
      }),
    );
  },
);
