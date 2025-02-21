/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { DisplayValueSpec, PartialTheme } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  Chart,
  LabelOverflowConstraint,
  Position,
  ScaleType,
  Settings,
  LegendValue,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dataGen = new SeededDataGenerator();
function generateDataWithAdditional(num: number) {
  return [...dataGen.generateSimpleSeries(num), { x: num, y: 0.25, g: 0 }, { x: num + 1, y: 8, g: 0 }];
}
const frozenDataSmallVolume = generateDataWithAdditional(5);
const frozenDataMediumVolume = generateDataWithAdditional(30);
const frozenDataHighVolume = generateDataWithAdditional(500);

const frozenData: { [key: string]: any[] } = {
  s: frozenDataSmallVolume,
  m: frozenDataMediumVolume,
  h: frozenDataHighVolume,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const singleSeries = boolean('show single series', false);
  const showValueLabel = boolean('show value label', true);
  const isAlternatingValueLabel = boolean('alternating value label', false);
  const overflowChartEdges = boolean('hide label if overflows chart edges', false);
  const overflowBarGeometry = boolean('hide label if overflows bar geometry', false);
  const overflowConstraints: DisplayValueSpec['overflowConstraints'] = [];
  if (overflowChartEdges) {
    overflowConstraints.push(LabelOverflowConstraint.ChartEdges);
  }
  if (overflowBarGeometry) {
    overflowConstraints.push(LabelOverflowConstraint.BarGeometry);
  }
  const displayValueSettings = {
    showValueLabel,
    isAlternatingValueLabel,
    overflowConstraints,
  };

  const debug = boolean('debug', false);

  const theme: PartialTheme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: Number(number('value font size', 10)),
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        fontStyle: 'normal',
        padding: 0,
        fill: color('value color', '#000'),
        offsetX: Number(number('offsetX', 0)),
        offsetY: Number(number('offsetY', 0)),
      },
    },
  };

  const dataSize = select(
    'data volume size',
    {
      'small volume': 's',
      'medium volume': 'm',
      'high volume': 'h',
    },
    's',
  );
  const data = frozenData[dataSize];

  const isSplitSeries = boolean('split series', false);
  const isStackedSeries = boolean('stacked series', false);

  const splitSeriesAccessors = isSplitSeries ? ['g'] : undefined;
  const stackAccessors = isStackedSeries ? ['x'] : undefined;
  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={debug}
        rotation={customKnobs.enum.rotation()}
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={customKnobs.enum.position('legend')}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />
      <BarSeries
        id="bars"
        displayValueSettings={displayValueSettings}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={splitSeriesAccessors}
        stackAccessors={stackAccessors}
        data={data}
      />
      {!singleSeries && (
        <BarSeries
          id="bars2"
          displayValueSettings={displayValueSettings}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          stackAccessors={['x']}
          splitSeriesAccessors={['g']}
          data={[
            { x: 0, y: 2, g: 'a' },
            { x: 1, y: 7, g: 'a' },
            { x: 2, y: 3, g: 'a' },
            { x: 3, y: 6, g: 'a' },
            { x: 0, y: 4, g: 'b' },
            { x: 1, y: 5, g: 'b' },
            { x: 2, y: 8, g: 'b' },
            { x: 3, y: 2, g: 'b' },
          ]}
        />
      )}
    </Chart>
  );
};
