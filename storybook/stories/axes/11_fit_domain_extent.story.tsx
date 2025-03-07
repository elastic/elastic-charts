/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { array, boolean, number, object, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  DomainPaddingUnit,
  LineAnnotation,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dg = new SeededDataGenerator();
const base = dg.generateBasicSeries(100, 0, 50);

export const Example: ChartsStory = (_, { title, description }) => {
  const [SeriesType] = customKnobs.enum.xySeries(undefined, 'line', { exclude: ['bubble'] });
  const positive = base.map(({ x, y }) => ({ x, y: y + 1000 }));
  const both = base.map(({ x, y }) => ({ x, y: y - 100 }));
  const negative = base.map(({ x, y }) => ({ x, y: y - 1000 }));

  const dataTypes = {
    positive,
    both,
    negative,
  };
  const dataKey = select<'positive' | 'negative' | 'both'>(
    'dataset',
    {
      'Positive values only': 'positive',
      'Positive and negative': 'both',
      'Negtive values only': 'negative',
    },
    'both',
  );

  const dataset = dataTypes[dataKey];
  const fit = boolean('fit Y domain to data', true);
  const includeDataFromIds = customKnobs.multiSelect<string>(
    'Specs to fit (yDomain)',
    {
      Lines: 'theshold',
      Rects: 'rect',
    },
    ['theshold', 'rect'],
    'check',
  );
  const enableHistogramMode = boolean('enableHistogramMode', true);
  const stacked = boolean('stacked', true);
  const constrainPadding = boolean('constrain padding', true);
  const padding = number('domain padding', 0.1);
  const seriesCount = number('number of series', 1, { min: 1, max: 3, range: true });
  const paddingUnit = customKnobs.fromEnum('Domain padding unit', DomainPaddingUnit, DomainPaddingUnit.DomainRatio);
  const thesholds = array('thesholds - line', ['200']).filter(Boolean).map(Number);
  const rectTheshold = object('theshold - rect', { y0: 100, y1: null });

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" title="index" position={Position.Bottom} />
      <Axis
        domain={{
          min: NaN,
          max: NaN,
          fit,
          includeDataFromIds,
          padding,
          paddingUnit,
          constrainPadding,
        }}
        id="left"
        title="Value"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <LineAnnotation
        id="theshold"
        dataValues={thesholds.map((dataValue) => ({ dataValue }))}
        domainType="yDomain"
        style={{
          line: {
            stroke: '#e73c45',
            strokeWidth: 2,
            opacity: 1,
            dash: [4, 4],
          },
        }}
      />
      <RectAnnotation
        id="rect"
        dataValues={[{ coordinates: rectTheshold }]}
        style={{
          fill: '#f137407b',
        }}
      />
      {Array.from({ length: seriesCount }, (_, i) => (
        <SeriesType
          id={`series-${i}`}
          key={`series-${i}`}
          enableHistogramMode={enableHistogramMode}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          stackAccessors={stacked ? ['true'] : []}
          xAccessor="x"
          yAccessors={['y']}
          data={dataset}
        />
      ))}
    </Chart>
  );
};
