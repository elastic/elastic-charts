/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Timeslip, Settings, PartialTheme, GetData } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

const getData = (dataDemand: Parameters<GetData>[0]) => {
  const from = dataDemand.lo?.timePointSec ?? NaN;
  const to = dataDemand.hi?.nextTimePointSec ?? NaN;
  const binWidth = (dataDemand.lo?.nextTimePointSec ?? NaN) - from;
  const result = [];
  let time = from;
  while (time < to) {
    result.push({
      epochMs: (time + 0.5 * binWidth) * 1000,
      value:
        8 * Math.sin(time / 100000000) +
        4 * Math.sin(time / 1000000) +
        2 * Math.sin(time / 10000) +
        Math.sin(time / 100) +
        0.5 * Math.sin(time) +
        0.25 * Math.sin(time * 100) +
        0.125 * Math.sin(time * 10000),
    });
    time += binWidth;
  }
  return result;
};

export const Example = () => {
  const theme: PartialTheme = {
    chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
    chartPaddings: { left: 0, right: 0, top: 0, bottom: 0 },
  };

  // fixing width and height at multiples of 256 for now
  return (
    <Chart size={{ width: 1024, height: 512 }}>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Timeslip id="spec_1" getData={getData} />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
