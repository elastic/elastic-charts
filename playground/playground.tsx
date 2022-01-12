/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Chart, Settings, Position, Axis, BarSeries, ScaleType, LineSeries } from '@elastic/charts';
// import { Position } from 'packages/charts/src/utils/common';
import React from 'react';
import { useBaseTheme } from '../storybook/use_base_theme';//'../../use_base_theme';



export function Playground() {
  return (
    <>
      <canvas id="example" width="260" height="200">
        <h2>Shapes</h2>
        <p>A rectangle with a black border. In the background is a pink
          circle. Partially overlaying the
          <a href="https://en.wikipedia.org/wiki/Circle"
            onfocus="drawCircle();" onblur="drawPicture();">circle</a>.
          Partially overlaying the circle is a green
          <a href="https://en.wikipedia.org/wiki/Square" onfocus="drawSquare();"
            onblur="drawPicture();">square</a> and a purple
          <a href="https://en.wikipedia.org/wiki/Triangle"
            onfocus="drawTriangle();" onblur="drawPicture();">triangle</a>,
          both of which are semi-opaque, so the full circle can be seen
          underneath.</p>
      </canvas>
      <Chart>
        <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} debug />
        <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
        <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2 },
            { x: 1, y: 7 },
            { x: 2, y: 3 },
            { x: 3, y: 6 },
          ]}
        />
        <LineSeries
          id="line"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 3 },
            { x: 1, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 10 },
          ]}
        />
      </Chart>
    </>
  )
}
