import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';
import {
  AnnotationDomainTypes,
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  getSpecId,
  LineAnnotation,
  LineAnnotationDatum,
  ScaleType,
  Settings,
} from '../../src';
import { Icon } from '../../src/components/icons/icon';
import { getChartRotationKnob } from '../common';
import { Position } from '../../src/utils/commons';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export default {
  title: 'Annotations/Line Stylings',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const lineStyling = () => {
  const data = [2.5, 7.2];
  const dataValues = generateAnnotationData(data);

  const dashWidth = number('dash line width', 1);
  const dashGapWidth = number('dash gap width', 0);

  const style = {
    line: {
      strokeWidth: number('line stroke width', 3),
      stroke: color('line & marker color', '#f00'),
      dash: [dashWidth, dashGapWidth],
      opacity: number('line opacity', 1, {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      }),
    },
  };

  const axisPosition = Position.Bottom;

  const marker = select<'alert' | 'eye' | 'questionInCircle'>(
    'marker icon (examples from internal Icon library)',
    {
      alert: 'alert',
      eye: 'eye',
      questionInCircle: 'questionInCircle',
    },
    'alert',
  );

  const hideLines = boolean('annotation lines hidden', false);
  const hideTooltips = boolean('annotation tooltips hidden', false);

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id={'anno_1'}
        domainType={AnnotationDomainTypes.XDomain}
        dataValues={dataValues}
        style={style}
        marker={<Icon type={marker} />}
        hideLines={hideLines}
        hideTooltips={hideTooltips}
      />
      <Axis id={getAxisId('horizontal')} position={axisPosition} title={'x-domain axis'} />
      <Axis id={getAxisId('vertical')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
lineStyling.story = {
  name: '[line] styling',
};
