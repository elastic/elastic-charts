/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
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
  LineAnnotationStyle,
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
  const rotation = customKnobs.enum.rotation();

  const data = [2.5, 7.2];
  const dataValues = generateAnnotationData(data);

  const dashWidth = number('dash line width', 5);
  const dashGapWidth = number('dash gap width', 8);

  const style: Partial<LineAnnotationStyle> = {
    line: {
      strokeWidth: number('line stroke width', 5),
      stroke: color('line & marker color', 'blue'),
      dash: [dashWidth, dashGapWidth],
      opacity: number('line opacity', 0.5, {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      }),
    },
  };

  const axisPosition = Position.Bottom;

  const marker = select<'alert' | 'eye' | 'questionInCircle'>(
    'marker icon (Examples from internal Icon library)',
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
    <Chart title={title} description={description}>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        style={style}
        marker={<Icon type={marker} />}
        hideLines={hideLines}
        hideTooltips={hideTooltips}
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
