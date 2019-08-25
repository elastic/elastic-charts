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
  BarSeries,
  LineAnnotation,
  getAnnotationId,
  AnnotationDomainTypes,
  AreaSeries,
  LineSeries,
  TooltipType,
  RectAnnotation,
  HistogramBarSeries,
} from '../src';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';
import { CursorEvent } from '../src/specs/settings';
import { CursorUpdateListener } from '../src/chart_types/xy_chart/store/chart_state';
import { Icon } from '../src/components/icons/icon';

export class Playground extends React.Component {
  ref1 = React.createRef<Chart>();
  ref2 = React.createRef<Chart>();
  ref3 = React.createRef<Chart>();
  ref4 = React.createRef<Chart>();
  ref5 = React.createRef<Chart>();

  onCursorUpdate: CursorUpdateListener = (event?: CursorEvent) => {
    this.ref1.current!.dispatchExternalCursorEvent(event);
    this.ref2.current!.dispatchExternalCursorEvent(event);
    this.ref3.current!.dispatchExternalCursorEvent(event);
    this.ref4.current!.dispatchExternalCursorEvent(event);
    this.ref5.current!.dispatchExternalCursorEvent(event);
  };

  render() {
    return (
      <>
        {renderChart(
          '1 - top',
          this.ref1,
          KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 50).filter((d, i) => i !== 1 && i !== 2),
          ScaleType.Time,
          this.onCursorUpdate,
          2,
          'line',
        )}

        {renderChart(
          '2 - middle',
          this.ref2,
          KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(2, 15).filter((d, i) => i !== 5),
          ScaleType.Time,
          this.onCursorUpdate,
          2,
          'line',
        )}

        {renderChart(
          '3 - bottom',
          this.ref3,
          KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 50),
          ScaleType.Time,
          this.onCursorUpdate,
          2,
          'mixed',
        )}

        {renderChart(
          '4 - mixed',
          this.ref4,
          KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 7),
          ScaleType.Time,
          this.onCursorUpdate,
          1,
          'bar',
        )}
        {renderChart(
          '5 - histogram',
          this.ref5,
          KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 7),
          ScaleType.Time,
          this.onCursorUpdate,
          1,
          'histogram',
        )}
      </>
    );
  }
}

function renderChart(
  key: string,
  ref: React.RefObject<Chart>,
  data: any,
  scaleType: 'linear' | 'ordinal' | 'time',
  onCursorUpdate?: CursorUpdateListener,
  maxSeries: number = 4,
  chartType: 'bar' | 'line' | 'area' | 'mixed' | 'histogram' = 'bar',
) {
  const formatter = niceTimeFormatter([data[0][0], data[data.length - 1][0]]);
  return (
    <div key={key} className="chart">
      <Chart ref={ref} id={key}>
        <Settings
          debug={false}
          legendPosition={Position.Right}
          showLegend={true}
          onCursorUpdate={onCursorUpdate}
          rotation={0}
          tooltip={{
            type: TooltipType.VerticalCursor,
            snap: true,
          }}
          theme={{
            lineSeriesStyle: {
              point: {
                visible: true,
                radius: 3,
                strokeWidth: 1,
              },
            },
            areaSeriesStyle: {
              area: {
                opacity: 0.4,
              },
            },
          }}
        />
        <Axis id={getAxisId('timestamp')} title="timestamp" position={Position.Bottom} tickFormat={formatter} />
        <Axis id={getAxisId('count')} title="count" position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
        <LineAnnotation
          annotationId={getAnnotationId('annotation1')}
          domainType={AnnotationDomainTypes.XDomain}
          dataValues={[
            {
              dataValue: KIBANA_METRICS.metrics.kibana_os_load[1].data[2][0],
              details: `${formatter(KIBANA_METRICS.metrics.kibana_os_load[1].data[2][0])}`,
            },
            {
              dataValue: KIBANA_METRICS.metrics.kibana_os_load[1].data[3][0],
              details: `${formatter(KIBANA_METRICS.metrics.kibana_os_load[1].data[3][0])}`,
            },
          ]}
          hideLinesTooltips={true}
          marker={<Icon type="alert" />}
        />
        <RectAnnotation
          annotationId={getAnnotationId('rect annotations')}
          dataValues={[
            {
              coordinates: {
                x0: KIBANA_METRICS.metrics.kibana_os_load[1].data[2][0],
                x1: KIBANA_METRICS.metrics.kibana_os_load[1].data[3][0],
              },
              details: `from: ${formatter(KIBANA_METRICS.metrics.kibana_os_load[1].data[2][0])} to: ${formatter(
                KIBANA_METRICS.metrics.kibana_os_load[1].data[3][0],
              )}`,
            },
          ]}
        />
        {(chartType === 'mixed' || chartType === 'line') &&
          new Array(maxSeries).fill(0).map((d, k) => {
            return (
              <LineSeries
                key={k}
                id={getSpecId('dataset line' + k)}
                xScaleType={scaleType}
                yScaleType={ScaleType.Linear}
                data={data.map((d, i) => [d[0], d[1] + 5 + +Math.sin((i * (k + 1)) % data.length) * 10])}
                xAccessor={0}
                yAccessors={[1]}
              />
            );
          })}
        {(chartType === 'mixed' || chartType === 'bar') &&
          new Array(maxSeries).fill(0).map((d, k) => {
            return (
              <BarSeries
                key={k}
                id={getSpecId('dataset bar ' + k)}
                xScaleType={scaleType}
                yScaleType={ScaleType.Linear}
                data={data.map((d, i) => [d[0], d[1] + 5 + Math.cos((i * (k + 1)) % data.length) * 5])}
                xAccessor={0}
                yAccessors={[1]}
                sortIndex={-10}
              />
            );
          })}
        {chartType === 'histogram' &&
          new Array(maxSeries).fill(0).map((d, k) => {
            return (
              <HistogramBarSeries
                key={k}
                id={getSpecId('dataset histogram ' + k)}
                xScaleType={scaleType}
                yScaleType={ScaleType.Linear}
                data={data.map((d, i) => [d[0], d[1] + 5 + Math.cos((i * (k + 1)) % data.length) * 5])}
                xAccessor={0}
                yAccessors={[1]}
                sortIndex={-10}
              />
            );
          })}
        {(chartType === 'mixed' || chartType === 'area') &&
          new Array(maxSeries).fill(0).map((d, k) => {
            return (
              <AreaSeries
                key={k}
                id={getSpecId('dataset area ' + k)}
                xScaleType={scaleType}
                yScaleType={ScaleType.Linear}
                data={data.map((d, i) => [d[0], d[1] + 5 + Math.cos((i * (k + 1)) % data.length) * 3])}
                xAccessor={0}
                yAccessors={[1]}
                sortIndex={-10}
                stackAccessors={[0]}
              />
            );
          })}
      </Chart>
    </div>
  );
}
