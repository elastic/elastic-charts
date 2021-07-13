/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationDomainType,
  Axis,
  BarSeries,
  Chart,
  LineAnnotation,
  ScaleType,
  Settings,
} from '../../../packages/charts/src';
import { Position } from '../../../packages/charts/src/utils/common';
import { getChartRotationKnob } from '../../utils/knobs';

export const Example = () => {
  const debug = boolean('debug', false);
  const rotation = getChartRotationKnob();

  const dataValues = [
    {
      dataValue: 3.5,
    },
  ];

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

  const xDomain = {
    minInterval: 1,
  };

  return (
    <Chart className="story-chart">
      <Settings debug={debug} rotation={rotation} xDomain={xDomain} />
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
