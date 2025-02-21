/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const rng = getRandomNumberGenerator();

const getData = (() => {
  const cache = new Map<string, Array<[string, number]>>();
  return (min: number, max: number, digits: number) => {
    const fractionDigits = Math.max(5, digits + 1);
    const key = `${min}:${max}:${fractionDigits}`;
    if (cache.has(key)) return cache.get(key)!;
    const data: Array<[string, number]> = [];
    for (let i = 1; i <= 5; i++) {
      data.push([`Sensor ${i}`, rng(min, max, fractionDigits)]);
    }
    cache.set(key, data);
    return data;
  };
})();

export const Example: ChartsStory = (_, { title, description }) => {
  const maximumFractionDigits = number('maximumFractionDigits', 0, { step: 1 });
  const dataRange = customKnobs.numbersArray('Data range', [0, 10]);
  const [Series] = customKnobs.enum.xySeries('Series type', 'bar', { exclude: ['bubble'] });
  const scaleType = customKnobs.enum.scaleType('Scale type', ScaleType.Linear, { include: ['Linear', 'Log', 'Sqrt'] });
  const niceValues = boolean('yNice', false);

  const min = Math.min(...dataRange);
  const max = Math.max(...dataRange);
  const data = getData(min, max, maximumFractionDigits);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} maximumFractionDigits={maximumFractionDigits} />

      <Series
        id="Thermal changes"
        xScaleType={ScaleType.Ordinal}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        yNice={niceValues}
      />
    </Chart>
  );
};
