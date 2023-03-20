/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';

import {
  ScaleType,
  Chart,
  GroupBy,
  SmallMultiples,
  Settings,
  niceTimeFormatByDay,
  timeFormatter,
  Heatmap,
  SmallMultiplesStyle,
} from '@elastic/charts';
import { SeededDataGenerator, getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';
import { customKnobs } from '../utils/knobs';
import { useHeatmapSelection } from '../utils/use_heatmap_selection';
import { sampleSize } from '../utils/utils';

const rng = getRandomNumberGenerator();
const dg = new SeededDataGenerator(500, 'test');
const numOfDays = 90;

const tickTimeFormatter = timeFormatter(niceTimeFormatByDay(numOfDays));

export const Example = () => {
  const debug = boolean('Debug', false);
  const debugState = boolean('Enable debug state', true);
  const timeBasedData = boolean('Time data', false);
  const showLegend = boolean('Show Legend', false);
  const vSplit = boolean('v - split', true, 'Data');
  const hSplit = boolean('h - split', true, 'Data');
  const vSplitCount = number('v - split count', 2, { min: 0 }, 'Data');
  const hSplitCount = number('h - split count', 2, { min: 0 }, 'Data');
  const vSplitCountAbs = vSplit ? vSplitCount : 1;
  const hSplitCountAbs = hSplit ? hSplitCount : 1;
  const categories = number('categories', 4, { min: 1, step: 1, range: true }, 'Data');
  const density = number('cell density(%)', 75, { min: 5, max: 100, step: 5, range: true }, 'Data') / 100;
  const xScaleType = customKnobs.enum.scaleType('xScaleType', ScaleType.Linear, {
    include: ['Linear', 'Ordinal'],
    group: 'Data',
  });

  const smStyles: SmallMultiplesStyle = {
    horizontalPanelPadding: {
      // Note: not fully supported, See https://github.com/elastic/elastic-charts/issues/1992
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
      // Note: not fully supported, See https://github.com/elastic/elastic-charts/issues/1992
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
  };
  const showAxesTitles = boolean('Show axes title', true, 'SmallMultiples Styles');
  const showAxesPanelTitles = boolean('Show axes panel titles', true, 'SmallMultiples Styles');

  const dataCount = timeBasedData ? numOfDays : 10;
  const fullData = useMemo(
    () =>
      dg.generateSMGroupedSeries(vSplitCountAbs, hSplitCountAbs, () => {
        return dg.generateSimpleSeries(dataCount).flatMap((d) =>
          range(0, categories, 1).map((y) => {
            return {
              y,
              x: d.x,
              value: rng(0, 1000),
              t: DateTime.fromISO('2020-01-01T00:00:00Z').plus({ days: d.x }).toMillis(),
            };
          }),
        );
      }),
    [vSplitCountAbs, hSplitCountAbs, dataCount, categories],
  );
  const data = useMemo(
    () => sampleSize(fullData, vSplitCountAbs * hSplitCountAbs * dataCount * categories * density),
    [categories, dataCount, density, fullData, vSplitCountAbs, hSplitCountAbs],
  );
  const { highlightedData, onElementClick, onBrushEnd } = useHeatmapSelection();

  return (
    <Chart>
      <Settings
        debug={debug}
        debugState={debugState}
        onRenderChange={getDebugStateLogger(debugState)}
        onElementClick={onElementClick}
        showLegend={showLegend}
        baseTheme={useBaseTheme()}
        theme={{
          axes: {
            axisTitle: {
              visible: showAxesTitles,
            },
            axisPanelTitle: {
              visible: showAxesPanelTitles,
            },
          },
          heatmap: {
            grid: {
              stroke: {
                width: number(
                  'Grid stroke',
                  1,
                  {
                    range: true,
                    min: 1,
                    max: 10,
                    step: 1,
                  },
                  'SmallMultiples Styles',
                ),
              },
            },
            cell: {
              border: {
                strokeWidth: 0,
              },
            },
          },
        }}
        onBrushEnd={onBrushEnd}
      />

      <GroupBy id="v_split" by={(_, { v }) => v} format={(v) => `Metric ${v}`} sort="numDesc" />
      <GroupBy id="h_split" by={(_, { h }) => h} format={(v) => `Host ${v}`} sort="numAsc" />
      <SmallMultiples
        splitVertically={vSplit ? 'v_split' : undefined}
        splitHorizontally={hSplit ? 'h_split' : undefined}
        style={smStyles}
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
                type: xScaleType,
              }
        }
        xAxisLabelFormatter={timeBasedData ? tickTimeFormatter : (v) => `C${v}`}
        yAxisLabelFormatter={(v) => `R${v}`}
        timeZone="UTC"
        highlightedData={highlightedData}
        xAxisTitle="Bottom axis"
        yAxisTitle="Left axis"
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
