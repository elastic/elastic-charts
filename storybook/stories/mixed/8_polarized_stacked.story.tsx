/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import {
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  StackMode,
  SeriesType,
  LineAnnotation,
  AnnotationDomainType,
  LegendValue,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { data } from '../utils/datasets/product_profits';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();
  const stacked = boolean('stacked', true);
  const polarity = select('data polarity', ['Mixed', 'Positive', 'Negative'], 'Mixed');
  const customDomain = boolean('custom domain', false);
  const stackMode =
    select<StackMode | undefined>(
      'stackMode',
      {
        None: undefined,
        Silhouette: StackMode.Silhouette,
        Wiggle: StackMode.Wiggle,
        Percentage: StackMode.Percentage,
      },
      undefined,
    ) ?? undefined;
  const [Series] = customKnobs.enum.xySeries('SeriesType', SeriesType.Bar, {
    exclude: [SeriesType.Bubble, SeriesType.Line],
  });
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        baseTheme={baseTheme}
      />
      <Axis id="bottom" position={Position.Bottom} title="Products" />
      <Axis
        id="left"
        title="Profit"
        position={Position.Left}
        domain={customDomain ? { min: -25000, max: 50000 } : undefined}
        tickFormat={(d) => numeral(d).format(stackMode === 'percentage' ? '0%' : '$0,0')}
      />

      <LineAnnotation
        id="zeroBaseline"
        domainType={AnnotationDomainType.YDomain}
        dataValues={[{ dataValue: 0 }]}
        style={{ line: { ...baseTheme.axes.axisLine, opacity: 1 } }}
        zIndex={-1}
      />

      <Series
        id="series"
        color={['#7BC0F7', '#3C8AD8', '#F18026', '#FEDB69']}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="product"
        y0Accessors={[() => 1]} // for testing warning
        yAccessors={[
          ({ profit }) => (polarity === 'Mixed' ? profit : (polarity === 'Negative' ? -1 : 1) * Math.abs(profit)),
        ]}
        splitSeriesAccessors={['state']}
        stackMode={stackMode}
        stackAccessors={stacked ? ['yes'] : undefined}
        data={data}
      />
    </Chart>
  );
};
