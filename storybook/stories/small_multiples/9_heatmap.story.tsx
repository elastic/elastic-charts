/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, text } from '@storybook/addon-knobs';
import { startCase } from 'lodash';
import { DateTime } from 'luxon';
import moment from 'moment';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  GroupBy,
  SmallMultiples,
  Settings,
  niceTimeFormatByDay,
  timeFormatter,
  AxisSpec,
  XYBrushEvent,
  Heatmap,
} from '@elastic/charts';
import { isVerticalAxis } from '@elastic/charts/src/chart_types/xy_chart/utils/axis_type_utils';
import { SeededDataGenerator, getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
const rng = getRandomNumberGenerator();

import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator(500, 'test');
const numOfDays = 90;

const tickTimeFormatter = timeFormatter(niceTimeFormatByDay(numOfDays));

export const Example = () => {
  const debug = boolean('Debug', false);
  const timeBasedData = boolean('Time data', false);
  const showLegend = boolean('Show Legend', false);
  const onElementClick = action('onElementClick');
  const ySplitCount = number('y - split count', 2, { min: 1 }, 'Data');
  const xSplitCount = number('x - split count', 2, { min: 1 }, 'Data');

  const groupNames = new Array(ySplitCount * xSplitCount).fill(0).map((_, i) => String.fromCharCode(97 + i));
  const data = dg.generateGroupedSeries(timeBasedData ? numOfDays : 10, ySplitCount * xSplitCount).map((d) => {
    return {
      y: d.y,
      x: d.x,
      value: rng(0, 1000),
      t: DateTime.fromISO('2020-01-01T00:00:00Z').plus({ days: d.x }).toMillis(),
      g: d.g,
      h: groupNames.indexOf(d.g) % xSplitCount,
      v: groupNames.indexOf(d.g) % ySplitCount,
    };
  });

  return (
    <Chart>
      <Settings
        debug={debug}
        onElementClick={onElementClick}
        showLegend={showLegend}
        baseTheme={useBaseTheme()}
        theme={{
          heatmap: {
            grid: {
              cellHeight: {
                max: 'fill',
              },
            },
            cell: {
              border: {
                strokeWidth: 0,
              },
            },
          },
        }}
        // onBrushEnd={(e) => {
        //   const { x } = e as XYBrushEvent;
        //   if (x) {
        //     action('brushEvent')(tickTimeFormatter(x[0] ?? 0), tickTimeFormatter(x[1] ?? 0));
        //   }
        // }}
      />

      <GroupBy id="v_split" by={(_, { v }) => v} format={(v) => `Metric ${v}`} sort="numDesc" />
      <GroupBy id="h_split" by={(_, { h }) => h} format={(v) => `Host ${v}`} sort="numAsc" />
      <SmallMultiples
        splitVertically={ySplitCount > 1 ? 'v_split' : undefined}
        splitHorizontally={xSplitCount > 1 ? 'h_split' : undefined}
        style={{
          horizontalPanelPadding: {
            outer: number(
              'Horizontal outer pad',
              0,
              {
                range: true,
                min: 0,
                max: 0.5,
                step: 0.05,
              },
              'SmallMultiples Styles',
            ),
            inner: number(
              'Horizontal inner pad',
              0.05,
              {
                range: true,
                min: 0,
                max: 0.5,
                step: 0.05,
              },
              'SmallMultiples Styles',
            ),
          },
          verticalPanelPadding: {
            outer: number(
              'Vertical outer pad',
              0,
              {
                range: true,
                min: 0,
                max: 0.5,
                step: 0.05,
              },
              'SmallMultiples Styles',
            ),
            inner: number(
              'Vertical inner pad',
              0.1,
              {
                range: true,
                min: 0,
                max: 0.5,
                step: 0.05,
              },
              'SmallMultiples Styles',
            ),
          },
        }}
      />

      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 200, color: '#d2e9f7' },
            { start: 200, end: 300, color: '#8bc8fb' },
            { start: 300, end: 500, color: '#fdec25' },
            { start: 500, end: 600, color: '#fba740' },
            { start: 800, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={data}
        xAccessor={timeBasedData ? 't' : 'x'}
        yAccessor={(d) => Math.floor(d.y)}
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}`}
        ySortPredicate="numAsc"
        xScale={
          timeBasedData
            ? {
                type: ScaleType.Time,
                interval: {
                  type: 'calendar',
                  value: 1,
                  unit: 'week',
                },
              }
            : {
                type: ScaleType.Linear,
              }
        }
        xAxisLabelFormatter={timeBasedData ? tickTimeFormatter : (v) => `C${v}`}
        yAxisLabelFormatter={(v) => `R${v}`}
        timeZone="UTC"
        // onBrushEnd={(e) => {
        //   setSelection({ x: e.x, y: e.y });
        // }}
        // highlightedData={persistCellsSelection ? selection : undefined}
        xAxisTitle="Bottom axis"
        yAxisTitle="Left axis"
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
