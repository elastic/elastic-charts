/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useState } from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter, LegendValue } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

export const Example: ChartsStory = (_, { title, description }) => {
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch('data.json');
      const d: Array<Record<string, unknown>> = await response.json();
      window.performance.mark('Perf:Started');
      setData(d);
    }
    fetchData().catch(() => {});
  }, []);
  const theme = useBaseTheme();
  if (data.length === 0) {
    return <div>no data</div>;
  }

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        baseTheme={theme}
        onRenderChange={(isRendered) => {
          if (isRendered) {
            window.performance.mark('Perf:Ended');
          }
        }}
      />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id="1"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="5bcdbfd2-c4c0-4b27-891e-d848ea468cbe"
        yAccessors={['532742da-8bea-4357-a5e1-9319111a61e7']}
        splitSeriesAccessors={['fed7a521-30ac-4696-bf2d-85a26ba6db58']}
        stackAccessors={['t']}
        data={data}
        timeZone="UTC"
      />
      <AreaSeries
        id="2"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="5bcdbfd2-c4c0-4b27-891e-d848ea468cbe"
        yAccessors={['4707670e-1c99-4e86-a09c-7801490131a1']}
        splitSeriesAccessors={['fed7a521-30ac-4696-bf2d-85a26ba6db58']}
        stackAccessors={['t']}
        data={data}
        timeZone="UTC"
      />
      <AreaSeries
        id="3"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="5bcdbfd2-c4c0-4b27-891e-d848ea468cbe"
        yAccessors={['881198db-8a3d-497b-b662-d7f5835775af']}
        splitSeriesAccessors={['fed7a521-30ac-4696-bf2d-85a26ba6db58']}
        stackAccessors={['t']}
        data={data}
        timeZone="UTC"
      />
    </Chart>
  );
};
