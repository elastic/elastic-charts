/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  DisplayValueSpec,
  LabelOverflowConstraint,
  PartialTheme,
  Position,
  ScaleType,
  Settings,
  LegendValue,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dataGen = new SeededDataGenerator();
function generateDataWithAdditional(num: number) {
  return [...dataGen.generateSimpleSeries(num), { x: num, y: 0.25, g: 0 }, { x: num + 1, y: 8, g: 0 }];
}
const frozenDataSmallVolume = generateDataWithAdditional(10);
const frozenDataMediumVolume = generateDataWithAdditional(50);
const frozenDataHighVolume = generateDataWithAdditional(1500);

const frozenData: { [key: string]: any[] } = {
  s: frozenDataSmallVolume,
  m: frozenDataMediumVolume,
  h: frozenDataHighVolume,
};

export const Example = () => {
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
  const useBorder = boolean('useBorder', false);
  const valueColor = color('value color', '#fff');
  const borderColor = color('value border color', 'rgba(0,0,0,1)');
  const borderSize = number('value border width', 1.5);

  const fixedFontSize = number('Fixed font size', 10);
  const useFixedFontSize = boolean('Use fixed font size', false);

  const maxFontSize = number('Max font size', 25);
  const minFontSize = number('Min font size', 10);

  const theme: PartialTheme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: useFixedFontSize ? fixedFontSize : { max: maxFontSize, min: minFontSize },
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        fontStyle: 'normal',
        padding: 0,
        fill: useBorder ? { textBorder: borderSize } : { color: valueColor, borderColor, borderWidth: borderSize },
        offsetX: number('offsetX', 0),
        offsetY: number('offsetY', 0),
        alignment: {
          horizontal: select(
            'Horizontal alignment',
            {
              Default: undefined,
              Left: 'left',
              Center: 'center',
              Right: 'right',
            },
            undefined,
          ),
          vertical: select(
            'Vertical alignment',
            {
              Default: undefined,
              Top: 'top',
              Middle: 'middle',
              Bottom: 'bottom',
            },
            undefined,
          ),
        },
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
    <Chart renderer="canvas">
      <Settings
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={debug}
        rotation={customKnobs.enum.rotation()}
        showLegend
        legendValue={LegendValue.LastTimeBucket}
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
    </Chart>
  );
};
