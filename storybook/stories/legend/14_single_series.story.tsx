/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { BarSeries, Chart, LegendValue, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const rng = getRandomNumberGenerator();
  const maxLines = number('max label lines', 0, { min: 0, step: 1 });
  const seriesCount = number('series count', 1, { min: 1, step: 1 });
  const data = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const renderMoreSeries = () => {
    const series: JSX.Element[] = [];

    for (let i = 1; i < seriesCount; i++) {
      series.push(
        <BarSeries
          id={`bars${i}`}
          xAccessor="x"
          yAccessors={['y']}
          name={`Another long series name - ${i}`}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          data={data.map(({ x, y }) => ({ x, y: y + rng(0, 5) }))}
        />,
      );
    }

    return series;
  };
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={customKnobs.enum.position('legend position', 'top')}
        theme={{
          legend: { labelOptions: { maxLines } },
        }}
        baseTheme={useBaseTheme()}
      />
      <BarSeries
        id="bars0"
        xAccessor="x"
        yAccessors={['y']}
        name="Id elit mollit ut est laborum. Lorem laboris laboris laboris quis dolore incididunt eiusmod fugiat nulla culpa dolore exercitation dolore. Voluptate ipsum cillum cillum in ullamco elit eiusmod labore incididunt excepteur. Duis id laboris consequat aliqua officia non ex nisi commodo. Ut do do voluptate sunt sunt cupidatat ea ad."
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={data}
      />
      {renderMoreSeries()}
    </Chart>
  );
};
