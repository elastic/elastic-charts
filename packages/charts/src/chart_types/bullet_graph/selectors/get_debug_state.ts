/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActiveValue } from './get_active_value';
import { getBulletSpec } from './get_bullet_spec';
import { getPanelDimensions } from './get_panel_dimensions';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { DebugState } from '../../../state/types';
import { BulletSubtype } from '../spec';

/** @internal */
export interface BulletDebugStateRow {
  subtype: BulletSubtype;
  target?: number;
  value?: number;
  title: string;
  subtitle?: string;
  colorBands: string[];
  ticks: number[];
}

/** @internal */
export interface BulletDebugState {
  rows: (BulletDebugStateRow | null)[][];
  activeValue?: number;
}

/** @internal */
export const getDebugStateSelector = createCustomCachedSelector(
  [getPanelDimensions, getActiveValue, getBulletSpec],
  (dimensions, activeValue, spec): DebugState => {
    return {
      bullet: {
        rows: dimensions.rows.map((row) => {
          return row.map((d): BulletDebugStateRow | null => {
            if (!d) return d;

            const { datum, colorBands, ticks } = d;
            const { title, subtitle, target, value } = datum;
            return {
              title,
              subtitle,
              target,
              value,
              subtype: spec.subtype,
              colorBands: colorBands.map((b) => b.color),
              ticks,
            };
          });
        }),
        activeValue: activeValue?.value,
      },
    };
  },
);
