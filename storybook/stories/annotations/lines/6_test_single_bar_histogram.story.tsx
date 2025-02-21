/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { LineAnnotationStyle } from '@elastic/charts';
import { AnnotationDomainType, Axis, BarSeries, Chart, LineAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Position } from '@elastic/charts/src/utils/common';

import type { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const rotation = customKnobs.enum.rotation();

  const dataValues = [
    {
      dataValue: 3.5,
    },
  ];

  const style: Partial<LineAnnotationStyle> = {
    line: {
      strokeWidth: 3,
      stroke: '#f00',
      opacity: 1,
    },
  };

  const xDomain = {
    min: NaN,
    max: NaN,
    minInterval: 1,
  };

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} rotation={rotation} xDomain={xDomain} baseTheme={useBaseTheme()} />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        style={style}
      />
      <Axis id="horizontal" position={Position.Bottom} title="x-domain axis" />
      <Axis id="vertical" title="y-domain axis" position={Position.Left} />
      <BarSeries
        enableHistogramMode
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[{ x: 3, y: 2 }]}
      />
    </Chart>
  );
};
