import { EuiIcon } from '@elastic/eui';
import { array, boolean, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Axis,
  BarSeries,
  Chart,
  getSpecId,
  LineAnnotation,
  ScaleType,
  Settings,
  timeFormatter,
} from '../src';
import {
  AnnotationDatum,
  AnnotationDomainTypes,
  Position,
} from '../src/lib/series/specs';
import { KIBANA_METRICS } from '../src/lib/series/utils/test_dataset_kibana';
import { getAnnotationId, getAxisId } from '../src/lib/utils/ids';

const dateFormatter = timeFormatter('HH:mm:ss');

function generateAnnotationData(values: any[]): AnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

function generateTimeAnnotationData(values: any[]): AnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}`, header: dateFormatter(value) }));
}

storiesOf('Annotations', module)
  .add('basic xDomain continuous', () => {
    const dataValues = [{
      dataValue: 2.5,
      details: 'an annotation',
    }];

    const style = {
      line: {
        strokeWidth: 3,
        stroke: '#f00',
        opacity: 1,
      },
      details: {
        fontSize: 12,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: 'gray',
        padding: 0,
      },
    };

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    const isBottom = boolean('x domain axis is bottom', true);
    const axisPosition = isBottom ? Position.Bottom : Position.Top;

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation
          annotationId={getAnnotationId('anno_1')}
          domainType={AnnotationDomainTypes.XDomain}
          dataValues={dataValues}
          style={style}
          marker={(<EuiIcon type="alert" />)}
        />
        <Axis
          id={getAxisId('horizontal')}
          position={axisPosition}
          title={'x-domain axis'}
        />
        <Axis
          id={getAxisId('vertical')}
          title={'y-domain axis'}
          position={Position.Left}
        />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('basic xDomain ordinal', () => {
    const dataValues = generateAnnotationData(array('annotation values', ['a', 'c']));

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation
          annotationId={getAnnotationId('anno_1')}
          domainType={AnnotationDomainTypes.XDomain}
          dataValues={dataValues}
          marker={(<EuiIcon type="alert" />)}
        />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'x-domain axis (top)'}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'x-domain axis (bottom)'}
        />
        <Axis
          id={getAxisId('left')}
          title={'y-domain axis'}
          position={Position.Left}
        />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 'a', y: 2 }, { x: 'b', y: 7 }, { x: 'c', y: 3 }, { x: 'd', y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('basic yDomain', () => {
    const dataValues = generateAnnotationData([3.5]);

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    const isLeft = boolean('y-domain axis is Position.Left', true);
    const axisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
    const axisPosition = isLeft ? Position.Left : Position.Right;

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation
          annotationId={getAnnotationId('anno_')}
          domainType={AnnotationDomainTypes.YDomain}
          dataValues={dataValues}
          marker={(<EuiIcon type="alert" />)}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'x-domain axis'}
        />
        <Axis
          id={getAxisId('left')}
          title={axisTitle}
          position={axisPosition}
        />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('time series', () => {
    const dataValues =
      generateTimeAnnotationData([1551438150000, 1551438180000, 1551438390000, 1551438450000, 1551438480000]);

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation
          annotationId={getAnnotationId('anno_1')}
          domainType={AnnotationDomainTypes.XDomain}
          dataValues={dataValues}
          marker={(<EuiIcon type="alert" />)}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'x-domain axis'}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={'y-domain axis'}
          position={Position.Left}
        />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20)}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  });
