/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationDomainType,
  Axis,
  BarSeries,
  Chart,
  LineAnnotation,
  LineAnnotationDatum,
  ScaleType,
  Settings,
} from '../../../packages/charts/src';
import { Icon } from '../../../packages/charts/src/components/icons/icon';
import { Position } from '../../../packages/charts/src/utils/common';
import { getChartRotationKnob, arrayKnobs } from '../../utils/knobs';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export const Example = () => {
  const debug = boolean('debug', false);
  const markerPosition = select(
    'marker position',
    [Position.Top, Position.Left, Position.Bottom, Position.Right, 'undefined'],
    'undefined',
  );
  const rotation = getChartRotationKnob();
  const data = arrayKnobs('data values', [2.5, 7.2]);
  const dataValues = generateAnnotationData(data);

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

  const isBottom = boolean('x domain axis is bottom', true);
  const axisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra debug={debug} rotation={rotation} />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        style={style}
        marker={<Icon type="alert" />}
        markerPosition={markerPosition === 'undefined' ? undefined : markerPosition}
      />
      <Axis id="horizontal" position={axisPosition} title="x-domain axis" />
      <Axis id="vertical" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
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
