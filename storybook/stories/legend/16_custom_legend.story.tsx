/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, AreaSeries, Chart, Position, ScaleType, Settings, timeFormatter, CustomLegend } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');
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

export const Example = () => {
  const CustomLegend: CustomLegend = ({ items, extraValues, pointerValue, mouseOverAction, mouseOutAction }) => (
    <>
      <p style={{ height: '1.5em' }}>{pointerValue?.formattedValue}</p>
      {items.map((i) => (
        <p
          key={i.seriesIdentifiers[0].key}
          style={{ color: i.color }}
          onMouseOver={() => mouseOverAction(i.path)}
          onMouseOut={() => mouseOutAction()}
        >
          {i.label} {extraValues.get(i.seriesIdentifiers[0].key)?.get(i.childId || '')}
        </p>
      ))}
    </>
  );

  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
        customLegend={CustomLegend}
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
