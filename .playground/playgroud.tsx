import React from 'react';

import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  AreaSeries,
  LineAnnotation,
  getAnnotationId,
  AnnotationDomainTypes,
  getGroupId,
} from '../src';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';
import { CursorEvent } from '../src/specs/settings';
import { CursorUpdateListener } from '../src/chart_types/xy_chart/store/chart_state';
import { Icon } from '../src/components/icons/icon';

export class Playground extends React.Component {
  ref1 = React.createRef<Chart>();
  ref2 = React.createRef<Chart>();
  ref3 = React.createRef<Chart>();


  render() {
    return (
      <Chart>
      <Settings
        tooltip={{ type: 'vertical' }}
        debug={false}
        legendPosition={Position.Right}
        showLegend={true}
        rotation={0}
      />
      <Axis
        id={getAxisId('timestamp')}
        title="timestamp"
        position={Position.Bottom}
        tickFormat={niceTimeFormatter([1555819200000, 1555905600000])}
      />
      <Axis id={getAxisId('count')} title="count" position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
      <AreaSeries
        id={getSpecId('dataset A1')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0,50)}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
      />
      <AreaSeries
        id={getSpecId('dataset A2')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0,50)}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
      />
      <AreaSeries
        id={getSpecId('dataset B1')}
        groupId={getGroupId('aaa')}
        useDefaultGroupDomain={true}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0,50).map(d => [d[0], -d[1]])}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
      />
      <AreaSeries
        id={getSpecId('dataset B2')}
        groupId={getGroupId('aaa')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0,50).map(d => [d[0], -d[1]])}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
      />
    </Chart>);
  }
}