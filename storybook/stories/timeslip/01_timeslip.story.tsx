/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { GetData } from '@elastic/charts';
import { Chart, Timeslip, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const getData = (dataDemand: Parameters<GetData>[0]) => {
  const from = dataDemand.lo?.minimum ?? NaN;
  const to = dataDemand.hi?.supremum ?? NaN;
  const binWidthMs = (dataDemand.lo?.supremum ?? NaN) - from;
  const result = [];
  let time = from;
  while (time < to) {
    result.push({
      epochMs: (time + 0.5 * binWidthMs) * 1000,
      value:
        8 * Math.sin(time / 100000000) +
        4 * Math.sin(time / 1000000) +
        2 * Math.sin(time / 10000) +
        Math.sin(time / 100) +
        0.5 * Math.sin(time) +
        0.25 * Math.sin(time * 100) +
        0.125 * Math.sin(time * 10000),
    });
    time += binWidthMs;
  }
  return result;
};

export const Example: ChartsStory = (_, { title, description }) => {
  // fixing width and height at multiples of 256 for now
  return (
    <Chart title={title} description={description} size={{ width: 1024, height: 512 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Timeslip id="spec_1" getData={getData} />
    </Chart>
  );
};
