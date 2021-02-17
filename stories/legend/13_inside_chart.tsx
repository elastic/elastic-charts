/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { select, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { switchTheme } from '../../.storybook/theme_service';
import {
  AreaSeries,
  Axis,
  Chart,
  DARK_THEME,
  LIGHT_THEME,
  Position,
  ScaleType,
  Settings,
  SettingsSpec,
  timeFormatter,
} from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { SB_KNOBS_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load[0].metric.label,
  ]);
  const data2 = KIBANA_METRICS.metrics.kibana_os_load[1].data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load[1].metric.label,
  ]);
  const data3 = KIBANA_METRICS.metrics.kibana_os_load[2].data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load[2].metric.label,
  ]);
  const allMetrics = [...data3, ...data2, ...data1];
  const legendPosition: SettingsSpec['legendPosition'] = select(
    'Legend Position',
    {
      ...Position,
      TopLeft: [Position.Top, Position.Left],
      TopRight: [Position.Top, Position.Right],
      BottomLeft: [Position.Bottom, Position.Left],
      BottomRight: [Position.Bottom, Position.Right],
    },
    [Position.Top, Position.Right],
  );
  const darkMode = boolean('Dark Mode', false);
  const className = darkMode ? 'story-chart-dark' : 'story-chart';

  switchTheme(darkMode ? 'dark' : 'light');
  return (
    <Chart className={className}>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={legendPosition}
        theme={darkMode ? DARK_THEME : LIGHT_THEME}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="timestamp per 1 minute"
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <AreaSeries
        id={KIBANA_METRICS.metrics.kibana_os_load[0].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        splitSeriesAccessors={[2]}
        data={allMetrics}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};
