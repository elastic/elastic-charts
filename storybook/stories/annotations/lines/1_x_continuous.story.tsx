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
  LineAnnotationStyle,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const markerPosition = select(
    'marker position',
    [Position.Top, Position.Left, Position.Bottom, Position.Right, 'undefined'],
    'undefined',
  );
  const rotation = customKnobs.enum.rotation();
  const data = customKnobs.array('data values', [2.5, 7.2]);
  const dataValues = generateAnnotationData(data);

  const style: Partial<LineAnnotationStyle> = {
    line: {
      strokeWidth: 3,
      stroke: '#f00',
      opacity: 1,
    },
  };

  const isBottom = boolean('x domain axis is bottom', true);
  const axisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart title={title} description={description}>
      <Settings showLegend showLegendExtra debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
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
