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
import { isFiniteNumber } from '../../../utils/common';

/** @internal */
export interface ActiveValue {
  value: number;
  snapValue: number;
  external: boolean;
}

/** @internal */
export const getActiveValues = createCustomCachedSelector(
  [getActiveValue, getPanelDimensions],
  (activeValue, dimensions): (ActiveValue | null)[][] => {
    if (!activeValue) return [];

    const { value: panelValue, snapValue, rowIndex, columnIndex } = activeValue;

    return dimensions.rows.map((row, ri) =>
      row.map((panel, ci): ActiveValue | null => {
        const external = !(rowIndex === ri && columnIndex === ci);
        if (!panel || (!panel.datum.syncCursor && external)) return null;
        if (!isFiniteNumber(panelValue) || panelValue >= panel.datum.domain.max || panelValue <= panel.datum.domain.min)
          return null;

        return {
          value: panel.scale(panelValue),
          snapValue: panel.scale(snapValue),
          external,
        };
      }),
    );
  },
);
