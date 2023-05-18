/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { button, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  Partition,
  Datum,
  Goal,
  ChartType,
  defaultPartitionValueFormatter,
  BandFillColorAccessorInput,
} from '@elastic/charts';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { productLookup, indexInterpolatedFillColor, interpolatorCET2s, getBandFillColorFn } from '../utils/utils';

export const Example = () => {
  /**
   * The handler section of this story demonstrates the PNG export functionality
   */
  const chartRef = React.useRef<Chart>(null);
  const handler = () => {
    if (!chartRef.current) {
      return;
    }
    const snapshot = chartRef.current.getPNGSnapshot({
      // you can set the background and pixel ratio for the PNG export
      backgroundColor: 'white',
    });
    if (!snapshot) {
      return;
    }
    // will save as chart.png
    const fileName = 'chart.png';
    const link = document.createElement('a');
    link.download = fileName;
    link.href = snapshot.blobOrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  button('Export PNG', handler);
  const selectedChart = select('chart type', [ChartType.XYAxis, ChartType.Partition, ChartType.Goal], ChartType.XYAxis);

  return (
    <Chart ref={chartRef}>
      <Settings
        baseTheme={useBaseTheme()}
        showLegend={selectedChart === ChartType.XYAxis}
        legendExtra={selectedChart === ChartType.XYAxis ? 'lastBucket' : 'none'}
      />
      {selectedChart === ChartType.Partition
        ? renderPartitionChart()
        : selectedChart === ChartType.Goal
        ? renderGoalchart()
        : renderXYAxisChart()}
    </Chart>
  );
};

function renderPartitionChart() {
  return (
    <Partition
      id="spec_1"
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          shape: {
            fillColor: (key, sortIndex, node, tree) =>
              indexInterpolatedFillColor(interpolatorCET2s())(null, sortIndex, tree),
          },
        },
      ]}
    />
  );
}

function renderXYAxisChart() {
  const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 100);
  return (
    <>
      <Axis
        id="time"
        position={Position.Bottom}
        tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
      />
      <Axis
        id="count"
        domain={{
          min: NaN,
          max: NaN,
          fit: true,
        }}
        position={Position.Left}
      />

      <BarSeries
        id="series bars chart"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </>
  );
}

function renderGoalchart() {
  const subtype = GoalSubtype.Goal;

  const getBandFillColor = getBandFillColorFn({
    200: '#fc8d62',
    250: 'lightgrey',
    300: '#66c2a5',
  });

  return (
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={260}
      actual={280}
      domain={{ min: 0, max: 300 }}
      bands={[200, 250, 300]}
      ticks={[0, 50, 100, 150, 200, 250, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={getBandFillColor}
      labelMajor=""
      labelMinor=""
      centralMajor="280 MB/s"
      centralMinor=""
      angleStart={Math.PI + (Math.PI - (2 * Math.PI) / 3) / 2}
      angleEnd={-(Math.PI - (2 * Math.PI) / 3) / 2}
    />
  );
}

Example.parameters = {
  markdown:
    'Generate a PNG of the chart by clicking on the Export PNG button in the knobs section. In this Example, the button handler is setting the PNG background to white with a pixel ratio of 2. If the browser is detected to be IE11, msSaveBlob will be used instead of a PNG capture.',
};
