/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from 'react';

import { Chart, Settings, Axis, timeFormatter, niceTimeFormatByDay, LineSeries } from '../src';


export interface SimulationStatsGraphSeries {
  id: string;
  name: string;
  data: Array<[number, number]>;
}
export interface SimulationStatsGraphProps {
  simulationStatsGraphSeries: { [serie: string]: SimulationStatsGraphSeries };
}

const SimulationStatsGraph: React.FC<SimulationStatsGraphProps> = (
  props: SimulationStatsGraphProps
) => {
  const { simulationStatsGraphSeries } = props;

  return (
    <Chart size={{ height: 500 }}>
      <Settings showLegend legendPosition="bottom" />

      <Axis
        title={new Date().toISOString()}
        id="bottom-axis"
        position="bottom"
        tickFormat={timeFormatter(niceTimeFormatByDay(1))}
        showGridLines
      />
      <Axis id="left-axis" position="left" showGridLines />

      {Object.keys(simulationStatsGraphSeries).map((k: string) => (
        <LineSeries
          key={k}
          id={simulationStatsGraphSeries[k].id}
          name={simulationStatsGraphSeries[k].name}
          data={simulationStatsGraphSeries[k].data}
          xScaleType="time"
          xAccessor={0}
          yAccessors={[1]}
        />
      ))}
    </Chart>
  );
};

export default SimulationStatsGraph;


interface AppProps {}

const count = 0;

const series: SimulationStatsGraphSeries = {
  id: 'test_id',
  name: 'test name',
  data: [
    [1551438000000, 8.3203125],
    [1551438030000, 7.9140625],
    [1551438060000, 7.8671875],
    [1551438090000, 7.125],
    [1551438120000, 8.765625],
    [1551438150000, 11.546875],
    [1551438180000, 12.984375],
    [1551438210000, 13.546875],
    [1551438240000, 13.390625],
    [1551438270000, 11.5625],
    [1551438300000, 11.5859375],
    [1551438330000, 10.0546875],
    [1551438360000, 9.921875],
    [1551438390000, 9.4921875],
    [1551438420000, 9.78125],
    [1551438450000, 10.046875],
    [1551438480000, 14.0546875],
    [1551438510000, 10.640625],
    [1551438540000, 8.2421875],
    [1551438570000, 8.5],
    [1551438600000, 7.2578125],
    [1551438630000, 8.515625],
    [1551438660000, 10.796875],
    [1551438690000, 11.125],
    [1551438720000, 21.40625],
    [1551438750000, 17.921875],
    [1551438780000, 26.640625],
    [1551438810000, 31.390625],
    [1551438840000, 23.953125],
    [1551438870000, 16],
    [1551438900000, 11.9765625],
    [1551438930000, 9.1640625],
    [1551438960000, 7.98046875],
    [1551438990000, 7.1640625],
    [1551439020000, 7.39453125],
    [1551439050000, 5.68359375],
    [1551439080000, 4.95703125],
    [1551439110000, 4.26171875],
    [1551439140000, 11.1171875],
    [1551439170000, 10.8515625],
    [1551439200000, 12.6171875],
    [1551439230000, 11.1171875],
    [1551439260000, 11.6640625],
    [1551439290000, 11.109375],
    [1551439320000, 10.6015625],
    [1551439350000, 11.21875],
    [1551439380000, 13.53125],
    [1551439410000, 15.4609375],
    [1551439440000, 15.1796875],
    [1551439470000, 11.984375],
    [1551439500000, 24.8125],
    [1551439530000, 21.46875],
    [1551439560000, 14.484375],
    [1551439590000, 9.9609375],
    [1551439620000, 10.8515625],
    [1551439650000, 12.1171875],
    [1551439680000, 19.375],
    [1551439710000, 20.609375],
    [1551439740000, 16.484375],
    [1551439770000, 15.515625],
    [1551439800000, 14.9140625],
    [1551439830000, 10.8828125],
    [1551439860000, 9.7578125],
    [1551439890000, 8.625],
    [1551439920000, 9.21875],
    [1551439950000, 8.5390625],
    [1551439980000, 8.40625],
    [1551440010000, 6.671875],
    [1551440040000, 7.24609375],
    [1551440070000, 7.1015625],
    [1551440100000, 7.09375],
    [1551440130000, 10.8125],
    [1551440160000, 10.90625],
    [1551440190000, 12.453125],
    [1551440220000, 11.8984375],
    [1551440250000, 10.875],
    [1551440280000, 12.4140625],
    [1551440310000, 12.78125],
    [1551440340000, 34.28125],
    [1551440370000, 29.84375],
    [1551440400000, 22.40625],
    [1551440430000, 16.046875],
    [1551440460000, 12.6328125],
    [1551440490000, 8.8125],
    [1551440520000, 6.93359375],
    [1551440550000, 6.12890625],
    [1551440580000, 5.69921875],
    [1551440610000, 5.48828125],
    [1551440640000, 12.0234375],
    [1551440670000, 14.484375],
    [1551440700000, 12.890625],
    [1551440730000, 11.578125],
    [1551440760000, 10.7578125],
    [1551440790000, 9.921875],
    [1551440820000, 10.5078125],
    [1551440850000, 11.375],
    [1551440880000, 15.890625],
    [1551440910000, 14.1953125],
    [1551440940000, 11.625],
    [1551440970000, 11.734375],
    [1551441000000, 10.1640625],
    [1551441030000, 9.296875],
    [1551441060000, 7.5546875],
    [1551441090000, 7.17578125],
    [1551441120000, 5.8671875],
    [1551441150000, 6.828125],
    [1551441180000, 10.578125],
    [1551441210000, 16.140625],
    [1551441240000, 15.640625],
    [1551441270000, 13.1484375],
    [1551441300000, 11.9140625],
    [1551441330000, 10.0625],
    [1551441360000, 7.66015625],
    [1551441390000, 9.0078125],
    [1551441420000, 8.78125],
    [1551441450000, 8.0390625],
    [1551441480000, 25.515625],
    [1551441510000, 18.640625],
    [1551441540000, 13.1953125],
    [1551441570000, 10.1953125],
  ],
};

export const Playground = (props: AppProps) => {
  const [simulation, setSimulation] = useState<number>(0);
  const [selectedMetric, setSelectedMetric] = useState<string>('metricA');

  useEffect(() => {
    setSelectedMetric('metricB');
  }, [simulation]);

  useEffect(() => {
    const id = setInterval(() => {
      setSimulation((s) => s + 1);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const getMetricTimeSeries = (
    selectedMetric: string
  ): {
    [series: string]: SimulationStatsGraphSeries;
  } => {
    const metricTimeSeries: {
      [series: string]: SimulationStatsGraphSeries;
    } = { success: series };

    return metricTimeSeries;
  };

  // console.log(count++);


  return (
    <SimulationStatsGraph
      simulationStatsGraphSeries={getMetricTimeSeries(selectedMetric)}
    />
  );
};
