/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, boolean, number, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  LegendPositionConfig,
  VerticalAlignment,
  HorizontalAlignment,
  LayoutDirection,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getLegendAction } from '../utils/components/get_legend_action';

const dg = new SeededDataGenerator();
const data = dg.generateGroupedSeries(10, 40);
export const Example: ChartsStory = (_, { title, description }) => {
  const numberOfSeries = number('Number of series', 5, { min: 1, max: 40, step: 1, range: true });
  const seriesWithLongName = number('Series with long name', 3, {
    min: 0,
    max: numberOfSeries - 1,
    step: 1,
    range: true,
  });

  const floating: LegendPositionConfig['floating'] = boolean('Inside chart', true, 'Legend');
  const showAction = boolean('Show legend action', false, 'Legend');
  const floatingColumns: LegendPositionConfig['floatingColumns'] = number(
    'floating columns',
    2,
    { min: 1, max: 10, range: true, step: 1 },
    'Legend',
  );
  const vAlign: LegendPositionConfig['vAlign'] = select(
    'vAlign',
    {
      [Position.Top]: VerticalAlignment.Top,
      // not yet implemented
      // [VerticalAlignment.Middle]: VerticalAlignment.Middle,
      [Position.Bottom]: VerticalAlignment.Bottom,
    },
    Position.Bottom,
    'Legend',
  );

  const hAlign: LegendPositionConfig['hAlign'] = select(
    'hAlign',
    {
      [Position.Left]: HorizontalAlignment.Left,
      // not yet implemented
      // [HorizontalAlignment.Center]: HorizontalAlignment.Center,
      [Position.Right]: HorizontalAlignment.Right,
    },
    Position.Right,
    'Legend',
  );
  const direction: LegendPositionConfig['direction'] = select(
    'direction',
    {
      ...LayoutDirection,
    },
    LayoutDirection.Vertical,
    'Legend',
  );
  const maxLines = number('max label lines', 1, { min: 0, step: 1 }, 'Legend');

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={{
          vAlign,
          hAlign,
          direction,
          floating,
          floatingColumns,
        }}
        legendAction={showAction ? getLegendAction() : undefined}
        theme={{
          legend: { labelOptions: { maxLines } },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <AreaSeries
        id={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data.slice(0, numberOfSeries * 10).map((d, i) => {
          if (i >= seriesWithLongName * 10 && i < seriesWithLongName * 10 + 10) {
            return {
              ...d,
              g: text('long label', 'long name', 'Legend'),
            };
          }
          return d;
        })}
      />
    </Chart>
  );
};
