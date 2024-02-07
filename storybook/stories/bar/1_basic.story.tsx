/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import moment from 'moment-timezone';
import React from 'react';

import { Axis, BarSeries, Chart, LineAnnotation, Position, RectAnnotation, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const toggleSpec = boolean('toggle bar spec', true);
  const now = Date.now();
  const data1 = [
    { x: now, y: 2 },
    { x: now + 1000 * 60 * 60 * 1, y: 1 },
    { x: now + 1000 * 60 * 60 * 2, y: 3 },
    { x: now + 1000 * 60 * 60 * 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'bars1' : 'bars2';
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <BarSeries
        id={specId}
        name="Simple bar series"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        enableHistogramMode
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={data}
      />
      <BarSeries
        id="bars 2"
        name="Simple bar series"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        enableHistogramMode
        stackAccessors={['x']}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
      <Axis id="y" position={Position.Left} domain={{ min: 0, max: 10 }} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        timeAxisLayerCount={2}
        style={{
          tickLabel: {
            alignment: { horizontal: 'left' },
          },
        }}
      />
      <LineAnnotation
        id="line1"
        domainType="xDomain"
        style={{
          line: {
            opacity: 1,
            stroke: 'red',
            strokeWidth: 2,
          },
        }}
        marker={<div style={{ width: 50, height: 50, background: 'rgba(122,40,112,0.5)' }}></div>}
        dataValues={[
          {
            dataValue: now + 1000 * 60 * 60 * 1,
            details: `1.5`,
          },
        ]}
      />
      <RectAnnotation
        id="rect1"
        style={{
          fill: 'red',
        }}
        dataValues={[
          {
            coordinates: {
              x0: now + 1000 * 60 * 60 * 1,
              x1: now + 1000 * 60 * 60 * 3,
            },
            details: `1.5 - 2.5`,
          },
        ]}
      />
    </Chart>
  );
};
