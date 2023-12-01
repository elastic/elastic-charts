/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
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
  PartialTheme,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
} from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

// for testing purposes only
export const Example: ChartsStory = (_, { title, description }) => {
  const data = TestDatasets.BARCHART_2Y1G;

  const lineAnnotationStyle = {
    line: {
      strokeWidth: 2,
      stroke: '#c80000',
      opacity: 0.3,
    },
  };

  const theme: PartialTheme = {
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
  const stacked = boolean('stacked', true);
  const stackAccessors = stacked ? ['yes'] : [];
  return (
    <Chart title={title} description={description}>
      <Settings
        rotation={customKnobs.enum.rotation()}
        theme={theme}
        debug={boolean('debug', true)}
        baseTheme={useBaseTheme()}
      />
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
          stackAccessors={stackAccessors}
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
        stackAccessors={stackAccessors}
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
        stackAccessors={stackAccessors}
        data={data}
        enableHistogramMode={boolean('bars-2 enableHistogramMode', false)}
      />
      {otherSeries}
    </Chart>
  );
};
