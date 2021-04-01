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

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationDomainType,
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  HistogramBarSeries,
  HistogramModeAlignments,
  LineAnnotation,
  LineSeries,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
} from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { getChartRotationKnob } from '../utils/knobs';
import { SB_SOURCE_PANEL } from '../utils/storybook';

// for testing purposes only
export const Example = () => {
  const data = TestDatasets.BARCHART_2Y1G;

  const lineAnnotationStyle = {
    line: {
      strokeWidth: 2,
      stroke: '#c80000',
      opacity: 0.3,
    },
  };

  const theme = {
    scales: {
      barsPadding: number('bars padding', 0.25, {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      }),
      histogramPadding: number('histogram padding', 0.05, {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      }),
    },
  };

  const otherSeriesSelection = select(
    'other series',
    {
      line: 'line',
      area: 'area',
    },
    'line',
  );

  const pointAlignment = select('point series alignment', HistogramModeAlignments, HistogramModeAlignments.Center);
  const pointData = TestDatasets.BARCHART_1Y0G;

  const otherSeries =
    otherSeriesSelection === 'line' ? (
      <LineSeries
        id="other-series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={pointData}
        histogramModeAlignment={pointAlignment}
      />
    ) : (
      <AreaSeries
        id="other-series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={pointData}
        histogramModeAlignment={pointAlignment}
      />
    );

  const hasHistogramBarSeries = boolean('hasHistogramBarSeries', false);
  return (
    <Chart className="story-chart">
      <Settings rotation={getChartRotationKnob()} theme={theme} debug={boolean('debug', true)} />
      <LineAnnotation
        id="line-annotation"
        domainType={AnnotationDomainType.XDomain}
        dataValues={[{ dataValue: 2 }, { dataValue: 2.5 }, { dataValue: 3.5 }]}
        style={lineAnnotationStyle}
        marker={<div style={{ background: 'red', width: 10, height: 10 }} />}
      />
      <RectAnnotation
        style={{
          fill: 'green',
        }}
        dataValues={[
          {
            coordinates: {
              x0: 0.5,
            },
            details: 'min=0.5, max=max',
          },
        ]}
        id="rect1"
      />
      <RectAnnotation
        style={{
          fill: 'red',
        }}
        dataValues={[
          {
            coordinates: {
              x1: 3,
            },
            details: 'min=min, max=3',
          },
        ]}
        id="rect2"
      />
      <Axis id="discover-histogram-left-axis" position={Position.Left} title="left axis" />
      <Axis id="discover-histogram-bottom-axis" position={Position.Bottom} title="bottom axis" />
      {hasHistogramBarSeries && (
        <HistogramBarSeries
          id="histo"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={pointData}
          name="histogram"
        />
      )}
      <BarSeries
        id="bars-1"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={pointData}
        name="bars 1"
        enableHistogramMode={boolean('bars-1 enableHistogramMode', false)}
      />
      <BarSeries
        id="bars-2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        data={data}
        enableHistogramMode={boolean('bars-2 enableHistogramMode', false)}
      />
      {otherSeries}
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
