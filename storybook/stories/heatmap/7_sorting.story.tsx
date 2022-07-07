/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Predicate, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { getKnobsFromEnum } from '../utils/knobs';

export const Example = () => {
  const keepNull = boolean('Fill gaps with nulls', true);
  const onlyNulls = boolean('Fill everything with nulls', false);
  const xSort = getKnobsFromEnum('X sorting predicate', Predicate, Predicate.DataIndex as Predicate);
  const ySort = getKnobsFromEnum('Y sorting predicate', Predicate, Predicate.DataIndex as Predicate);
  return (
    <Chart size={[200, 200]}>
      <Settings
        baseTheme={useBaseTheme()}
        onPointerUpdate={action('onPointerUpdate')}
        pointerUpdateTrigger="both"
        theme={{
          heatmap: {
            grid: {
              cellHeight: { min: 50, max: 50 },
              cellWidth: { min: 50, max: 50 },
            },
            cell: {
              border: {
                strokeWidth: 0.001,
                stroke: 'transparent',
              },
            },
          },
        }}
      />
      <Heatmap
        id="sortedHeatmap"
        colorScale={{
          type: 'bands',
          bands: [
            { start: 0, end: 10, color: '#d2e9f7' },
            { start: 10, end: 20, color: '#8bc8fb' },
            { start: 20, end: 30, color: '#fdec25' },
            { start: 30, end: 40, color: '#fba740' },
            { start: 40, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={[
          { x: 'A', y: '1', value: null },
          { x: 'A', y: '2', value: 15 },
          { x: 'A', y: '3', value: 22 },
          { x: 'B', y: '1', value: null },
          { x: 'B', y: '2', value: null },
          { x: 'B', y: '3', value: 32 },
          { x: 'C', y: '1', value: 23 },
          { x: 'C', y: '2', value: 35 },
          { x: 'C', y: '3', value: 50 },
        ]
          .filter((d) => (keepNull ? true : d.value !== null))
          .map((d) => (onlyNulls ? { ...d, value: null } : d))}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}`}
        ySortPredicate={ySort}
        xSortPredicate={xSort}
        xScale={{ type: ScaleType.Ordinal }}
      />
    </Chart>
  );
};
