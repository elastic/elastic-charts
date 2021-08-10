/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Chart,
  Heatmap,
  HeatmapConfig,
  niceTimeFormatter,
  RecursivePartial,
  ScaleType,
  Settings,
} from '../packages/charts/src';

const SWIM_LANE_DATA = [
  {
    laneLabel: 'i-71a7f77b',
    time: 1572847200,
    value: 1.393504,
  },
];

const config: RecursivePartial<HeatmapConfig> = {
  grid: {
    cellHeight: {
      min: 20,
    },
    stroke: {
      width: 1,
      color: '#D3DAE6',
    },
  },
  cell: {
    maxWidth: 'fill',
    maxHeight: 3,
    label: {
      visible: false,
    },
    border: {
      stroke: '#D3DAE6',
      strokeWidth: 0,
    },
  },
  yAxisLabel: {
    visible: true,
    width: 'auto',
    padding: { left: 10, right: 10 },
  },
  xAxisLabel: {
    formatter: (value: string | number) => {
      return niceTimeFormatter([1572825600000, 1572912000000])(value, {
        timeZone: 'UTC',
      });
    },
  },
};
export class Playground extends React.Component {
  render() {
    return (
      <Chart>
        <Settings
          showLegend
          legendPosition="top"
          brushAxis="both"
          xDomain={{
            min: 1572825600000,
            max: 1572912000000,
            // minInterval: 1800000,
          }}
        />
        <Heatmap
          id="heatmap1"
          colorScale={ScaleType.Threshold}
          ranges={[0, 3, 25, 50, 75]}
          colors={['#ffffff', '#d2e9f7', '#8bc8fb', '#fdec25', '#fba740', '#fe5050']}
          data={SWIM_LANE_DATA.map((v) => ({ ...v, time: v.time * 1000 }))}
          xAccessor={(d) => d.time}
          yAccessor={(d) => d.laneLabel}
          valueAccessor={(d) => d.value}
          valueFormatter={(d) => d.toFixed(0.2)}
          ySortPredicate="numAsc"
          xScaleType={ScaleType.Time}
          config={config}
        />
      </Chart>
    );
  }
}
