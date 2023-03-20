/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';
import { Story } from '@storybook/react';
import { startCase } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  Axis,
  LineSeries,
  GroupBy,
  SmallMultiples,
  Settings,
  niceTimeFormatByDay,
  timeFormatter,
  AxisSpec,
  XYBrushEvent,
} from '@elastic/charts';
import { isVerticalAxis } from '@elastic/charts/src/chart_types/xy_chart/utils/axis_type_utils';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const numOfDays = 90;
const groupNames = new Array(16).fill(0).map((d, i) => String.fromCharCode(97 + i));
const data = dg.generateGroupedSeries(numOfDays, 16).map((d) => {
  return {
    y: d.y,
    x: DateTime.fromISO('2020-01-01T00:00:00Z').plus({ days: d.x }).toMillis(),
    g: d.g,
    h: groupNames.indexOf(d.g) % 4,
    v: Math.floor(groupNames.indexOf(d.g) / 4),
  };
});

const getAxisStyle = (position: Position): AxisSpec['style'] => ({
  tickLabel: {
    padding: 5,
  },
  axisPanelTitle: {
    visible: !boolean('Hide panel titles', false, position),
  },
  axisTitle: {
    padding: 2,
    visible: !boolean('Hide title', false, position),
  },
  tickLine: {
    visible: false,
  },
});
const tickTimeFormatter = timeFormatter(niceTimeFormatByDay(numOfDays));

const getAxisOptions = (
  position: Position,
): Pick<AxisSpec, 'id' | 'title' | 'gridLine' | 'ticks' | 'domain' | 'tickFormat' | 'style' | 'hide' | 'position'> => {
  const isPrimary = position === Position.Left || position === Position.Bottom;
  const isVertical = isVerticalAxis(position);
  return {
    id: position,
    position,
    ticks: isVertical ? 2 : undefined,
    tickFormat: isVertical ? (d) => d.toFixed(2) : tickTimeFormatter,
    domain: isVertical
      ? {
          min: NaN,
          max: 10,
        }
      : undefined,
    hide: boolean('Hide', !isPrimary, position),
    gridLine: {
      visible: boolean('Show grid line', isPrimary, position),
    },
    style: getAxisStyle(position),
    title: text(
      'Title',
      isVertical ? `Metrics - ${startCase(position)}` : `Hosts - ${startCase(position)}`,
      position,
    ).trim(),
  };
};

export const Example: Story = (_, { kind, name }) => {
  const debug = boolean('Debug', false);
  const showLegend = boolean('Show Legend', false);
  const onElementClick = action('onElementClick');
  const metricPrefix = text('metric prefix', `Metric `).trim();
  const hostPrefix = text('host prefix', `Host `).trim();

  return (
    <Chart title={kind} description={name}>
      <Settings
        debug={debug}
        onElementClick={onElementClick}
        showLegend={showLegend}
        theme={{
          lineSeriesStyle: {
            point: {
              visible: false,
            },
          },
        }}
        baseTheme={useBaseTheme()}
        onBrushEnd={(e) => {
          const { x } = e as XYBrushEvent;
          if (x) {
            action('brushEvent')(tickTimeFormatter(x[0] ?? 0), tickTimeFormatter(x[1] ?? 0));
          }
        }}
      />
      <Axis {...getAxisOptions(Position.Left)} />
      <Axis {...getAxisOptions(Position.Bottom)} />
      <Axis {...getAxisOptions(Position.Top)} />
      <Axis {...getAxisOptions(Position.Right)} />

      <GroupBy id="v_split" by={(_, { v }) => v} format={(v) => `${metricPrefix} ${v}`} sort="numDesc" />
      <GroupBy id="h_split" by={(_, { h }) => h} format={(v) => `${hostPrefix} ${v}`} sort="numAsc" />
      <SmallMultiples
        splitVertically="v_split"
        splitHorizontally="h_split"
        style={{ verticalPanelPadding: { outer: 0, inner: 0.3 } }}
      />

      <LineSeries
        id="line"
        name={({ splitAccessors }) => `Host ${splitAccessors.get('h')}`}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        timeZone="UTC"
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['h']}
        data={data}
      />
    </Chart>
  );
};
Example.parameters = {
  markdown: `It is possible to add either a vertical and horizontal \`<GroupBy/>\` operations to create a grid of
small multiples.
The assignment of the series colors can be handled by defining an accessor in the \`color\` prop of the series that
consider the \`smHorizontalAccessorValue\` or \`smVerticalAccessorValue\` values when returning the assigned color.
`,
};
