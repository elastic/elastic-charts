/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import type { LineAnnotationDatum } from '@elastic/charts';
import { AnnotationDomainType, Axis, BarSeries, Chart, LineAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';

import type { ChartsStory } from '../../../types';
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
  const dataValues = generateAnnotationData(customKnobs.array('annotation values', ['a', 'c']));
  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        marker={<Icon type="alert" />}
        markerPosition={markerPosition === 'undefined' ? undefined : markerPosition}
      />
      <Axis id="top" position={Position.Top} title="x-domain axis (top)" />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis (bottom)" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
