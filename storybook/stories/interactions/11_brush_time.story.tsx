/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import moment from 'moment-timezone';
import React from 'react';

import {
  Axis,
  BarSeries,
  BrushEndListener,
  Chart,
  LineSeries,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  Tooltip,
} from '@elastic/charts';
import { getRandomNumberGenerator, SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';
import { getChartRotationKnob } from '../utils/knobs';

const dg = new SeededDataGenerator();
const rng = getRandomNumberGenerator();

export const Example = () => {
  const now = moment('2019-01-11T00:00:00.000');
  const days = 5;
  const formatter = niceTimeFormatter([now.valueOf(), now.clone().add(days, 'days').valueOf()]);
  const brushEndListener: BrushEndListener = ({ x }) => {
    if (!x) {
      return;
    }
    action('onBrushEnd')(formatter(x[0]), formatter(x[1]));
  };
  const disableActions = boolean('disable actions', false);
  const seriesCount = number('series count', 10, { step: 1, min: 1 });
  const groupData = dg.generateGroupedSeries(days, seriesCount).map(({ y, g }, i) => ({
    y,
    x: now
      .clone()
      .add(i % days, 'days')
      .valueOf(),
    g: `Group ${g.toUpperCase()}`,
  }));

  return (
    <Chart>
      <Settings
        showLegend
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        onBrushEnd={brushEndListener}
        onElementClick={action('onElementClick')}
        rotation={getChartRotationKnob()}
      />
      <Axis id="bottom" position={Position.Bottom} title="bottom" showOverlappingTicks tickFormat={formatter} />
      <Axis id="left" title="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <Tooltip
        actions={
          disableActions
            ? []
            : [
                {
                  label: () => 'Log storybook action',
                  onSelect: (s) => action('onTooltipAction')(s),
                },
                {
                  label: ({ length }) => (
                    <span>
                      Alert keys of all <b>{length}</b> selected series
                    </span>
                  ),
                  hide: ({ length }) => length > 0,
                  onSelect: (series) => alert(`Selected the following: \n - ${series.map((s) => s.key).join('\n - ')}`),
                },
              ]
        }
      />

      <BarSeries
        id="Bars"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={seriesCount > 1 ? ['g'] : undefined}
        stackAccessors={['']}
        timeZone="Europe/Rome"
        data={groupData}
      />
      <LineSeries
        id="Lines"
        color="red"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        timeZone="Europe/Rome"
        data={groupData
          .filter(({ g }) => g === 'Group A')
          .map(({ x }) => {
            const scaleFactor = seriesCount === 1 ? 0 : seriesCount * 5;
            return { x, y: rng(3, scaleFactor + 10) };
          })}
      />
    </Chart>
  );
};
