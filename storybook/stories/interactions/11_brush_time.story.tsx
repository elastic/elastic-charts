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
import React, { useMemo } from 'react';

import {
  Axis,
  BarSeries,
  BrushEndListener,
  Chart,
  LineSeries,
  niceTimeFormatter,
  PartialTheme,
  Position,
  ScaleType,
  Settings,
  Tooltip,
  TooltipAction,
  XYChartSeriesIdentifier,
} from '@elastic/charts';
import { getRandomNumberGenerator, SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';
import { getChartRotationKnob, getPlacementKnob, getToggledNumber, getTooltipTypeKnob } from '../utils/knobs';
import { wait } from '../utils/utils';

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
  const asyncActions = boolean('async actions', false);
  const asyncDelay = number('async delay (ms)', 1500, { step: 500, min: 0 });
  const seriesCount = number('series count', 5, { step: 1, min: 1 });
  const groupData = useMemo(
    () =>
      dg.generateGroupedSeries(days, seriesCount).map(({ y, g }, i) => ({
        y,
        x: now
          .clone()
          .add(i % days, 'days')
          .valueOf(),
        g: `Group ${g.toUpperCase()}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seriesCount],
  );
  const lineData = useMemo(
    () =>
      groupData
        .filter(({ g }) => g === 'Group A')
        .map(({ x }) => {
          const scaleFactor = seriesCount === 1 ? 0 : seriesCount * 5;
          return { x, y: rng(3, scaleFactor + 10) };
        }),
    [groupData, seriesCount],
  );

  const partialTheme: PartialTheme = {
    tooltip: {
      maxTableHeight: getToggledNumber(true, undefined)('max table height', 100, { min: 0, step: 1 }, 'Tooltip styles'),
    },
  };

  const actions: TooltipAction<any, XYChartSeriesIdentifier>[] = [
    {
      label: 'Log storybook action',
      onSelect: (s) => action('onTooltipAction')(s),
    },
    {
      label: ({ length }) => (
        <span>
          Alert keys of all <b>{length}</b> selected series
        </span>
      ),
      disabled: ({ length }) => (length < 1 ? 'Select at least one series' : false),
      onSelect: (series) =>
        alert(`Selected the following: \n - ${series.map((s) => s.seriesIdentifier.key).join('\n - ')}`),
    },
  ];

  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra
        theme={partialTheme}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        onBrushEnd={brushEndListener}
        onElementClick={action('onElementClick')}
        rotation={getChartRotationKnob()}
      />
      <Axis id="bottom" position={Position.Bottom} title="bottom" showOverlappingTicks tickFormat={formatter} />
      <Axis id="left" title="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <Tooltip
        placement={getPlacementKnob()}
        maxTooltipItems={number('maxTooltipItems', 5, { min: 1, step: 1 }, 'Tooltip styles')}
        type={getTooltipTypeKnob('tooltip type', 'vertical', 'Tooltip styles')}
        actions={disableActions ? [] : asyncActions ? () => wait(asyncDelay, () => actions) : actions}
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
        data={lineData}
      />
    </Chart>
  );
};
