/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, CurveType, Position, ScaleType, Settings } from '@elastic/charts';
import { TSVB_DATASET } from '@elastic/charts/src/utils/data_samples/test_dataset_tsvb';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const showLegendDisplayValue = boolean('show display value in legend', true);
  const legendPosition = select(
    'legendPosition',
    {
      right: Position.Right,
      bottom: Position.Bottom,
      left: Position.Left,
      top: Position.Top,
    },
    Position.Right,
  );

  const tsvbSeries = TSVB_DATASET.series;

  const namesArray = customKnobs.array('series names (in sort order)', ['jpg', 'php', 'png', 'css', 'gif']);

  const seriesComponents = tsvbSeries.map((series) => {
    const nameIndex = namesArray.indexOf(series.label);
    const sortIndex = nameIndex > -1 ? nameIndex : undefined;

    return (
      <AreaSeries
        key={`${series.id}-${series.label}`}
        id={`${series.id}-${series.label}`}
        name={series.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={series.data}
        curve={series.lines.steps ? CurveType.CURVE_STEP : CurveType.LINEAR}
        sortIndex={sortIndex}
      />
    );
  });
  return (
    <Chart>
      <Settings
        showLegend
        legendPosition={legendPosition}
        legendValue={showLegendDisplayValue ? 'lastBucket' : 'none'}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      {seriesComponents}
    </Chart>
  );
};
