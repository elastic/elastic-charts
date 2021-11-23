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
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  StackMode,
  computeRatioByGroups,
} from '@elastic/charts';

import { AnnotationDomainType, LineAnnotation } from '../../../packages/charts/src/chart_types/specs';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const modes = select(
    'mode',
    { stack: 'stack', stackAsPercentage: 'stackAsPercentage', unstacked: 'unstacked' },
    'stackAsPercentage',
  );
  const stack = modes !== 'unstacked' ? ['x'] : undefined;
  const stackMode = modes === 'stackAsPercentage' ? StackMode.Percentage : undefined;

  const originalData = [
    { x: 'pos/neg', y: -10, g: 'a' },
    { x: 'pos/neg', y: 10, g: 'b' },

    { x: 'zero/zero', y: 0, g: 'a' },
    { x: 'zero/zero', y: 0, g: 'b' },

    { x: 'zero/pos', y: 0, g: 'a' },
    { x: 'zero/pos', y: 10, g: 'b' },

    { x: 'null/pos', y: null, g: 'a' },
    { x: 'null/pos', y: 10, g: 'b' },

    { x: 'pos/pos', y: 2, g: 'a' },
    { x: 'pos/pos', y: 8, g: 'b' },

    { x: 'neg/neg', y: -2, g: 'a' },
    { x: 'neg/neg', y: -8, g: 'b' },
  ];

  const data = boolean('use computeRatioByGroups fn', false)
    ? computeRatioByGroups(originalData, ['x'], (d) => d.y, 'y')
    : originalData;

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />

      <Axis
        id="left2"
        position={Position.Left}
        showGridLines
        ticks={5}
        style={{ axisLine: { visible: false }, tickLine: { visible: false }, tickLabel: { padding: 5 } }}
        gridLine={{ stroke: 'rgba(128,128,128,0.5)', strokeWidth: 0.5 }}
        tickFormat={(d: any) => (modes === 'stackAsPercentage' ? `${Number(d * 100).toFixed(0)} %` : `${d}`)}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stack}
        stackMode={stack && stackMode}
        splitSeriesAccessors={['g']}
        data={data}
      />
      <LineAnnotation dataValues={[{ dataValue: 0 }]} id="baseline" domainType={AnnotationDomainType.YDomain} />
    </Chart>
  );
};
