import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { BarSeries, Chart, getSpecId, LineAnnotation, ScaleType, Settings } from '../src';
import { AnnotationPositionType, SeriesDatumAnnotationPosition } from '../src/lib/series/specs';
import { getAnnotationId } from '../src/lib/utils/ids';

storiesOf('Annotations', module)
  .add('basic', () => {
    const position: SeriesDatumAnnotationPosition = {
      specId: getSpecId('bars'),
      accessor: 'x',
      datumValue: 0,
      positionType: AnnotationPositionType.SeriesDatum,
    };

    const lineAnnotationProps = {
      annotationId: getAnnotationId('anno_1'),
      position,
    };

    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <LineAnnotation {...lineAnnotationProps} />
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
  });
