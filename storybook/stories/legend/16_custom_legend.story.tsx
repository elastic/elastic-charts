/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment';
import React from 'react';

import {
  Axis,
  AreaSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  CustomLegend,
  Tooltip,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');
const data1 = KIBANA_METRICS.metrics.kibana_os_load.v1.data.map((d) => [
  ...d,
  KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label,
]);
const data2 = KIBANA_METRICS.metrics.kibana_os_load.v2.data.map((d) => [
  ...d,
  KIBANA_METRICS.metrics.kibana_os_load.v2.metric.label,
]);
const data3 = KIBANA_METRICS.metrics.kibana_os_load.v3.data.map((d) => [
  ...d,
  KIBANA_METRICS.metrics.kibana_os_load.v3.metric.label,
]);
const allMetrics = [...data3, ...data2, ...data1];

export const Example = () => {
  const customLegend: CustomLegend = ({ items, pointerValue }) => (
    <div style={{ width: '100%', position: 'relative' }}>
      <p style={{ height: '1.5em' }}>{pointerValue ? moment(pointerValue?.value).format('HH:mm') : 'System Load'}</p>
      {items.map((i) => (
        <button
          key={i.seriesIdentifiers[0].key}
          onMouseOver={i.onItemOverActon}
          onMouseOut={i.onItemOutAction}
          onClick={() => i.onItemClickAction(false)}
          style={{ display: 'block', color: i.isSeriesHidden ? 'gray' : i.color }}
        >
          {i.label} {i.extraValue}
        </button>
      ))}
    </div>
  );

  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
        customLegend={customLegend}
        legendSize={100} // always specify a fixed size for a custom legend
      />
      <Tooltip customTooltip={() => null} />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis id="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} ticks={5} />
      <AreaSeries
        id={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label}
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

Example.parameters = {
  markdown: `When using a custom legend, please always specify a fixed \`legendSize\` in the \`Settings\` prop to avoid a wrongly computed default legend size.`,
};
