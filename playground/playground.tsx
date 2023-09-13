/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, LineSeries, Tooltip } from '@elastic/charts';

const data = [
  [1551438000000, 8.3203125],
  [1551438030000, 7.9140625],
  [1551438060000, 7.8671875],
  [1551438090000, 7.125],
  [1551438120000, 8.765625],
  [1551438150000, 11.546875],
  [1551438180000, 12.984375],
  [1551438210000, 13.546875],
  [1551438240000, 13.390625],
  [1551438270000, 11.5625],
];

export function Playground() {
  return (
    <Chart size={500}>
      <Tooltip placement="left"></Tooltip>
      <LineSeries id="lines" xAccessor={0} yAccessors={[1]} data={data} />
    </Chart>
  );
}
