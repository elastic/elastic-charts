/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { range } from 'lodash';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  GroupBy,
  Position,
  ScaleType,
  Settings,
  SmallMultiples,
  DataGenerator,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
const ng = getRandomNumberGenerator();
const rng = new DataGenerator();
const data = rng.generateSMGroupedSeries(3, 2, () => {
  return rng.generateSimpleSeries(10).flatMap((d) =>
    range(0, 6, 1).map((y) => {
      return {
        x: `category-longer-then-${d.x}`,
        y: ng(0, 1000),
      };
    }),
  );
});
console.log(data);
export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <div style={{ border: '1px solid black', position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ resize: 'both', border: '1x solid black', overflow: 'hidden', width: '100%', height: '50%' }}>
        <Chart title={title} description={description}>
          <Settings
            baseTheme={useBaseTheme()}
            rotation={90}
            theme={{
              chartMargins: { top: 0, left: 0, right: 0, bottom: 0 },
              chartPaddings: { top: 0, left: 0, right: 0, bottom: 0 },
              axes: {
                axisTitle: {
                  padding: 0,
                },
                axisPanelTitle: {
                  padding: 0,
                },
                tickLabel: {
                  padding: 0,
                },
                tickLine: {
                  padding: 0,
                },
              },
            }}
          />

          <Axis id="left" position={Position.Left} />
          <Axis id="right" position={Position.Right} />
          <Axis id="bottom" position={Position.Bottom} />
          <BarSeries
            id="horizontal bar chart"
            xScaleType={ScaleType.Ordinal}
            yScaleType={ScaleType.Linear}
            xAccessor="x"
            yAccessors={['y']}
            data={[
              { x: 'artifacts.elastic.co', y: 2, g: 'cluster a' },
              { x: 'www.elastic.co', y: 7, g: 'cluster a' },
              { x: 'cdn.elastic-elastic-elastic.orgcdn.elastic-elastic-elastic.org', y: 3, g: 'cluster a' },
              { x: 'docker.elastic.co', y: 6, g: 'cluster a' },

              { x: 'artifacts.elastic.co', y: 10, g: 'cluster B' },
              { x: 'www.elastic.co', y: 17, g: 'cluster B' },
              { x: 'cdn.elastic-elastic-elastic.orgcdn.elastic-elastic-elastic.org', y: 23, g: 'cluster B' },
              { x: 'docker.elastic.co', y: 8, g: 'cluster B' },
            ]}
          />
          {/* <GroupBy id="g" by={(spec, datum) => datum.g} sort="alphaAsc" />
        <SmallMultiples splitHorizontally="g" /> */}
        </Chart>
      </div>
      <div style={{ resize: 'both', overflow: 'hidden', width: '100%', height: '50%' }}>
        <Chart title={title} description={description}>
          <Settings
            baseTheme={useBaseTheme()}
            rotation={90}
            theme={{
              chartMargins: { top: 0, left: 0, right: 0, bottom: 0 },
              chartPaddings: { top: 0, left: 0, right: 0, bottom: 0 },
              axes: {
                axisTitle: {
                  padding: 0,
                },
                axisPanelTitle: {
                  padding: 0,
                },
                tickLabel: {
                  padding: 0,
                },
                tickLine: {
                  padding: 0,
                },
              },
            }}
          />

          <Axis id="bottom" position={Position.Bottom} />
          <Axis id="left" position={Position.Left} />
          {/* <Axis id="right" position={Position.Right} /> */}
          <BarSeries
            id="horizontal bar chart"
            xScaleType={ScaleType.Ordinal}
            yScaleType={ScaleType.Linear}
            xAccessor="x"
            yAccessors={['y']}
            data={data}
          />
          <GroupBy id="h" by={(spec, datum) => datum.h} sort="alphaAsc" />
          <GroupBy id="v" by={(spec, datum) => datum.v} sort="alphaAsc" />
          <SmallMultiples splitHorizontally="h" splitVertically="v" />
        </Chart>
      </div>
    </div>
  );
};
