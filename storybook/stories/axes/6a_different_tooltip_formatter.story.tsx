/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text, boolean } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings, Tooltip } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const showLegend = boolean('Show legend', true, 'Y axis');
  const disableYAxisFormat = boolean('Disable Axis tickFormat', false, 'Y axis');
  const yAxisFormat = text('Axis value format', '0[.]0', 'Y axis');
  const yAxisUnit = text('Axis unit', 'pets', 'Y axis');
  const disableHeaderFormat = boolean('Disable header tickFormat', false, 'X axis');
  const headerUnit = text('Header unit', '(header)', 'X axis');
  const disableXAxisFormat = boolean('Disable Axis tickFormat', false, 'X axis');
  const xAxisUnit = text('Axis unit', '(axis)', 'X axis');
  const disableDogLineFormat = boolean('Disable dog line tickFormat', false, 'Y axis');
  const dogLineFormat = text('Dog line unit', 'dogs', 'Y axis');
  const disableCatLineFormat = boolean('Disable cat line tickFormat', false, 'Y axis');
  const catLineFormat = text('Cat line unit', 'cats', 'Y axis');

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} showLegendExtra showLegend={showLegend} />
      <Tooltip
        headerFormatter={
          disableHeaderFormat ? undefined : ({ value }) => `${value}${headerUnit ? ` ${headerUnit}` : ''}`
        }
      />
      <Axis
        id="bottom"
        title="Country"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={disableXAxisFormat ? undefined : (value) => `${value}${xAxisUnit ? ` ${xAxisUnit}` : ''}`}
      />
      <Axis
        id="left"
        title="Units"
        position={Position.Left}
        tickFormat={
          disableYAxisFormat ? undefined : (d) => `${numeral(d).format(yAxisFormat)}${yAxisUnit ? ` ${yAxisUnit}` : ''}`
        }
      />
      <LineSeries
        id="Dog line"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        tickFormat={disableDogLineFormat ? undefined : (d) => `${Number(d).toFixed(2)} ${dogLineFormat}`}
        data={[
          { x: 'USA', y: 8 },
          { x: 'Canada', y: 7 },
          { x: 'Mexico', y: 18 },
        ]}
      />
      <LineSeries
        id="Cat line"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        tickFormat={disableCatLineFormat ? undefined : (d) => `${Number(d).toFixed(2)} ${catLineFormat}`}
        data={[
          { x: 'USA', y: 14 },
          { x: 'Canada', y: 15 },
          { x: 'Mexico', y: 14 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: 'Using a single axis with different unit types is discouraged. ',
};
