import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Axis, BarSeries, Chart, getSpecId, LineAnnotation, ScaleType, Settings, timeFormatter } from '../src';

import {
  AnnotationDomainType,
  AnnotationPositionType,
  AnnotationType,
  LineAnnotationSpec,
  Position,
  SeriesDatumAnnotationPosition,
} from '../src/lib/series/specs';
import { KIBANA_METRICS } from '../src/lib/series/utils/test_dataset_kibana';
import { getAnnotationId, getAxisId } from '../src/lib/utils/ids';

const dateFormatter = timeFormatter('HH:mm:ss');

storiesOf('Annotations', module)
  .add('basic', () => {
    const dataValues = [1551438150000, 1551438180000, 1551438330000, 1551438390000, 1551438450000, 1551438480000];

    const position: SeriesDatumAnnotationPosition = {
      domainType: AnnotationDomainType.XDomain,
      dataValues,
      positionType: AnnotationPositionType.SeriesDatum,
    };

    const lineAnnotationProps: LineAnnotationSpec = {
      annotationId: getAnnotationId('anno_1'),
      position,
      annotationType: AnnotationType.Line,
    };

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <LineAnnotation {...lineAnnotationProps} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          tickFormat={dateFormatter}
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
