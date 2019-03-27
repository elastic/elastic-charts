import { array, boolean, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Axis, BarSeries, Chart, getSpecId, LineAnnotation, ScaleType, Settings, timeFormatter } from '../src';

import {
  AnnotationDomainType,
  Position,
} from '../src/lib/series/specs';
import { KIBANA_METRICS } from '../src/lib/series/utils/test_dataset_kibana';
import { getAnnotationId, getAxisId } from '../src/lib/utils/ids';

const dateFormatter = timeFormatter('HH:mm:ss');

storiesOf('Annotations', module)
  .add('basic xDomain', () => {
    const dataValues = [2.5, 3];

    const lineAnnotationProps = {
      annotationId: getAnnotationId('anno_1'),
      domainType: AnnotationDomainType.XDomain,
      dataValues,
    };

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation {...lineAnnotationProps} />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('left')}
          title={'Left axis'}
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
    const dataValues = array('annotation values', ['a', 'c']);

    const lineAnnotationProps = {
      annotationId: getAnnotationId('anno_1'),
      domainType: AnnotationDomainType.XDomain,
      dataValues,
    };

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation {...lineAnnotationProps} />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('left')}
          title={'Left axis'}
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
    const dataValues = [3.5];

    const lineAnnotationProps = {
      annotationId: getAnnotationId('anno_1'),
      domainType: AnnotationDomainType.YDomain,
      dataValues,
    };

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation {...lineAnnotationProps} />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
        />
        <Axis
          id={getAxisId('left')}
          title={'Left axis'}
          position={Position.Left}
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
    const dataValues = [1551438150000, 1551438180000, 1551438330000, 1551438390000, 1551438450000, 1551438480000];

    const lineAnnotationProps = {
      annotationId: getAnnotationId('anno_1'),
      domainType: AnnotationDomainType.XDomain,
      dataValues,
    };

    const chartRotation = select('chartRotation', {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    }, 0);

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} rotation={chartRotation} />
        <LineAnnotation {...lineAnnotationProps} />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'Bottom axis'}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
        // tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left')}
          title={'Left axis'}
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
