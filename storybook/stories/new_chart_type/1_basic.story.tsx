/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, NewViz } from '@elastic/charts';

export const Example = () => {
  return (
    <Chart>
      <NewViz id="1" data={0.5} />
      <NewViz id="2" data={1} />
      <NewViz id="3" data={0.2} />
    </Chart>
  );
};
