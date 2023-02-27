/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, DomainPaddingUnit, Position, ScaleType, Settings } from '@elastic/charts';
import { computeContinuousDataDomain } from '@elastic/charts/src/utils/domain';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const logDomains = (data: any[], customDomain: any) => {
  const dataY = data.map((d) => d.y);
  /* eslint-disable no-console */
  console.clear();
  console.log('data domain:', JSON.stringify(computeContinuousDataDomain(dataY, ScaleType.Linear, undefined)));
  console.log('computed domain:', JSON.stringify(computeContinuousDataDomain(dataY, ScaleType.Linear, customDomain)));
  /* eslint-enable */
};

export const Example = () => {
  const fit = boolean('fit Y domain to data', true);
  const constrainPadding = boolean('constrain padding', true);
  const nice = boolean('nice ticks', false);
  const padding = number('domain padding', 0);
  const paddingUnit = customKnobs.fromEnum('Domain padding unit', DomainPaddingUnit, DomainPaddingUnit.Domain);
  const mixed = [
    { x: 0, y: -4 },
    { x: 1, y: -3 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ];

  const allPositive = mixed.map((datum) => ({ x: datum.x, y: Math.abs(datum.y) }));
  const allNegative = mixed.map((datum) => ({ x: datum.x, y: Math.abs(datum.y) * -1 }));

  const dataChoice = select(
    'data',
    {
      mixed: 'mixed',
      allPositive: 'all positive',
      allNegative: 'all negative',
    },
    'all negative',
  );
  const [SeriesType] = customKnobs.enum.xySeries();
  const shouldLogDomains = boolean('console log domains', true);

  let data;
  switch (dataChoice) {
    case 'all positive':
      data = allPositive;
      break;
    case 'all negative':
      data = allNegative;
      break;
    default:
      data = mixed;
  }
  const customDomain = { fit, padding, paddingUnit, constrainPadding, nice, min: NaN, max: NaN };

  if (shouldLogDomains) {
    logDomains(data, customDomain);
  }

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="top" position={Position.Top} title="Top axis" />
      <Axis
        id="left"
        domain={customDomain}
        title="Left axis"
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <SeriesType
        id="series"
        yNice={nice}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={data}
      />
    </Chart>
  );
};
