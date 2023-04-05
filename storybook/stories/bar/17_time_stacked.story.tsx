/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  CustomTooltip,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  Tooltip,
  TooltipContainer,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const CustomTooltipWithSubChart: CustomTooltip = ({ values }) => {
  const [value] = values.filter((v) => v.isHighlighted);
  return (
    <TooltipContainer>
      <div style={{ padding: 10 }}>Hovering: {value.label}</div>
    </TooltipContainer>
  );
};

export const Example = () => {
  const useCustomTooltip = boolean('Use custom tooltip', false);
  const formatter = timeFormatter(niceTimeFormatByDay(1));
  return (
    <Chart>
      <Settings debug={boolean('debug', false)} baseTheme={useBaseTheme()} />

      {useCustomTooltip && <Tooltip customTooltip={CustomTooltipWithSubChart} type="follow" />}

      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        showOverlappingTicks={boolean('showOverlappingTicks bottom axis', false)}
        showOverlappingLabels={boolean('showOverlappingLabels bottom axis', false)}
        tickFormat={formatter}
      />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={KIBANA_METRICS.metrics.kibana_os_load[2].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[2].data.slice(0, 20)}
      />
      <BarSeries
        id={KIBANA_METRICS.metrics.kibana_os_load[1].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 20)}
      />
      <BarSeries
        id={KIBANA_METRICS.metrics.kibana_os_load[0].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20)}
      />
    </Chart>
  );
};
