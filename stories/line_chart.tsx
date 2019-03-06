import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Axis,
  Chart,
  CurveType,
  getAxisId,
  getSpecId,
  LineSeries,
  Position,
  ScaleType,
  Settings,
} from '../src/';
import { KIBANA_METRICS } from '../src/lib/series/utils/test_dataset_kibana';
import { niceTimeFormatByDay, timeFormatter } from '../src/utils/data/formatters';
const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
storiesOf('Line Chart', module)
  .add('basic', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <LineSeries
          id={getSpecId('lines')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('w axis', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          showOverlappingTicks={true}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
          position={Position.Left}
          tickFormat={(d) => `${Number(d).toFixed(0)}%`}
        />
        <LineSeries
          id={getSpecId('lines')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('w axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          showOverlappingTicks={true}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
          position={Position.Left}
          tickFormat={(d) => `${Number(d).toFixed(0)}%`}
        />
        <LineSeries
          id={getSpecId('lines')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('curved w axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          showOverlappingTicks={true}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
          position={Position.Left}
          tickFormat={(d) => `${Number(d).toFixed(0)}%`}
        />

        <LineSeries
          id={getSpecId('monotone x')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.CURVE_MONOTONE_X}
          yScaleToDataExtent={false}
        />
        <LineSeries
          id={getSpecId('basis')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.CURVE_BASIS}
          yScaleToDataExtent={false}
        />
        <LineSeries
          id={getSpecId('cardinal')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.CURVE_CARDINAL}
          yScaleToDataExtent={false}
        />
        <LineSeries
          id={getSpecId('catmull rom')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.CURVE_CATMULL_ROM}
          yScaleToDataExtent={false}
        />
        <LineSeries
          id={getSpecId('natural')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.CURVE_NATURAL}
          yScaleToDataExtent={false}
        />
        <LineSeries
          id={getSpecId('linear')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.LINEAR}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('multiple w axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          showOverlappingTicks={true}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
          position={Position.Left}
          tickFormat={(d) => `${Number(d).toFixed(0)}%`}
        />

        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.LINEAR}
        />
        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[1].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
          curve={CurveType.LINEAR}
        />
        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[2].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
          curve={CurveType.LINEAR}
        />
      </Chart>
    );
  })
  .add('stacked w axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          showOverlappingTicks={true}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
          position={Position.Left}
          tickFormat={(d) => `${Number(d).toFixed(0)}%`}
        />
        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[2].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
          curve={CurveType.LINEAR}
          stackAccessors={[0]}
        />
        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[1].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
          curve={CurveType.LINEAR}
          stackAccessors={[0]}
        />
        <LineSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          curve={CurveType.LINEAR}
          stackAccessors={[0]}
        />
      </Chart>
    );
  });
