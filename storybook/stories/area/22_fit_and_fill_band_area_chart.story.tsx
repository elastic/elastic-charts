/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  AreaSeries,
  LineSeries,
  CurveType,
  Chart,
  ScaleType,
  Settings,
  Axis,
  Position,
  Fit,
  niceTimeFormatter,
} from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  return (
    <div className="App">
      <Chart size={['100%', 500]}>
        <Settings showLegend theme={useBaseTheme()} />
        <Axis id="value" position={Position.Left} />
        <Axis id="time" position={Position.Bottom} tickFormat={niceTimeFormatter([1625253120000, 1625254560000])} />

        <LineSeries
          id="Throughput"
          data={[
            [1625253300000, 243.8],
            [1625253600000, 303.2],
            [1625253900000, 290.6],
            [1625254200000, 307],
            [1625254500000, 302],
          ]}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          curve={CurveType.CURVE_MONOTONE_X}
          xAccessor={0}
          yAccessors={[1]}
          stackAccessors={[0]}
          yNice
        />

        <AreaSeries
          id="Expected bounds"
          data={[
            [1625253120000, null, null],
            [1625253480000, 300.5849842903525, 394.38103396943154],
            [1625253840000, 299.52027100052254, 394.42301093407673],
            [1625254200000, 300.883705475389, 392.8469455894186],
            [1625254560000, 301.1673718583745, 392.1260821195367],
          ]}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          curve={CurveType.CURVE_MONOTONE_X}
          fit={{ type: Fit.Linear, endValue: Fit.Nearest }}
          xAccessor={0}
          yAccessors={[2]}
          y0Accessors={[1]}
          yNice
          areaSeriesStyle={{
            point: {
              visible: true,
            },
          }}
        />
      </Chart>
    </div>
  );
};
