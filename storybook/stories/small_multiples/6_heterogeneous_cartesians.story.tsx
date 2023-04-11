/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  Axis,
  GroupBy,
  SmallMultiples,
  Settings,
  BarSeries,
  LineAnnotation,
  AnnotationDomainType,
  LIGHT_THEME,
  LineSeries,
  AreaSeries,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const numOfDays = 7;
function generateData() {
  return dg.generateGroupedSeries(numOfDays, 2).map((d) => {
    return {
      ...d,
      x: DateTime.fromFormat(`${d.x + 1}`, 'E').toFormat('EEEE'),
      y: Math.floor(d.y * 10),
      g: d.g === 'a' ? 'new user' : 'existing user',
    };
  });
}
const data1 = generateData();
const data2 = generateData();
const data3 = generateData();

export const Example = () => {
  const marker = (
    <span
      style={{
        backgroundColor: 'lightgray',
        padding: 2,
        width: 30,
        height: 10,
        margin: 'auto',
        fontSize: 8,
        borderRadius: 2,
        lineHeight: 8,
      }}
    >
      MIN
    </span>
  );
  const showLegend = boolean('Show Legend', true);
  const onElementClick = action('onElementClick');

  return (
    <Chart>
      <Settings onElementClick={onElementClick} showLegend={showLegend} baseTheme={useBaseTheme()} />
      <Axis id="time" position={Position.Bottom} gridLine={{ visible: false }} />
      <Axis id="y" title="Day of week" position={Position.Left} gridLine={{ visible: false }} />

      <GroupBy
        id="h_split"
        by={(spec) => {
          return spec.id;
        }}
        sort="alphaAsc"
      />
      <SmallMultiples splitHorizontally="h_split" />
      <LineAnnotation
        dataValues={[
          {
            dataValue: 100,
            details: 'Minimum # of connected users',
          },
        ]}
        id="threshold"
        domainType={AnnotationDomainType.YDomain}
        marker={marker}
        style={{
          line: {
            dash: [5, 10],
            stroke: 'black',
            opacity: 0.8,
            strokeWidth: 1,
          },
        }}
      />
      <BarSeries
        id="website a"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data1}
        color={[LIGHT_THEME.colors.vizColors[0]!, 'lightgray']}
      />
      <LineSeries
        id="website b"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data2}
        color={[LIGHT_THEME.colors.vizColors[0]!, 'lightgray']}
      />
      <AreaSeries
        id="website c"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data3}
        color={[LIGHT_THEME.colors.vizColors[0]!, 'lightgray']}
      />
    </Chart>
  );
};
