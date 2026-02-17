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
  ScaleType,
  Position,
  Chart,
  Axis,
  GroupBy,
  SmallMultiples,
  Settings,
  BarSeries,
  LineSeries,
  Predicate,
} from '@elastic/charts';

import { independentYDomainData as data } from './independent_y_domain_data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const independentYDomain = boolean('Independent Y Domain per panel', true);
  const seriesType = select('Series type', { Bar: 'bar', Line: 'line' }, 'bar');

  const Series = seriesType === 'bar' ? BarSeries : LineSeries;

  return (
    <Chart title={title} description={description} size={['100%', 600]}>
      <Settings baseTheme={useBaseTheme()} showLegend={false} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} />
      <GroupBy id="split_row" by={(spec, datum) => datum.category} sort={Predicate.DataIndex} />
      <SmallMultiples splitVertically="split_row" independentYDomain={independentYDomain} />
      <Series
        id="metric"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['category']}
        data={data}
      />
    </Chart>
  );
};
