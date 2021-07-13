/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, AreaSeries, LineSeries, BarSeries, ScaleType, Settings } from '../packages/charts/src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="App">
        <Chart size={[500, 200]}>
          <Settings ariaLabel="This is a custom aria-label" ariaLabelledBy="labeled by here" />
          <AreaSeries
            id="lines"
            name="test2"
            data={[
              { x: 'trousers', y: 300, val: 1232 },
              { x: 'watches', y: 20, val: 1232 },
              { x: 'bags', y: 700, val: 1232 },
              { x: 'cocktail dresses', y: 804, val: 1232 },
            ]}
          />
          <LineSeries
            id="lines2"
            name="test"
            data={[
              { x: 'trousers', y: 300, val: 1232 },
              { x: 'watches', y: 20, val: 1232 },
              { x: 'bags', y: 700, val: 1232 },
              { x: 'cocktail dresses', y: 804, val: 1232 },
            ]}
          />
          <BarSeries
            id="bars"
            name="amount"
            xScaleType={ScaleType.Ordinal}
            xAccessor="x"
            yAccessors={['y']}
            data={[
              { x: 'trousers', y: 390, val: 1222 },
              { x: 'watches', y: 23, val: 1222 },
              { x: 'bags', y: 750, val: 1222 },
              { x: 'cocktail dresses', y: 854, val: 1222 },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
