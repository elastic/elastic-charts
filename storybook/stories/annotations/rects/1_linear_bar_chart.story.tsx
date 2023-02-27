/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings, Position } from '@elastic/charts';

import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

export const Example = () => {
  const debug = boolean('debug', false);
  const rotation = customKnobs.enum.rotation();
  const x0 = select(
    'x0 coordinate',
    {
      0: 0,
      1: 1,
      3: 3,
      '3.1': 3.1,
      'not defined': 'none',
    },
    0,
  );

  const x1 = select(
    'x1 coordinate',
    {
      0: 0,
      1: 1,
      3: 3,
      '3.1': 3.1,
      'not defined': 'none',
    },
    1,
  );

  return (
    <Chart>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation
        id="rect"
        dataValues={[
          {
            coordinates: {
              x0: x0 === 'none' ? undefined : Number(x0),
              x1: x1 === 'none' ? undefined : Number(x1),
              y0: 0,
              y1: 4,
            },
            details: 'details about this annotation',
          },
        ]}
        style={{ fill: 'red' }}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `A \`<RectAnnotation />\` can be used to create a rectangular annotation.
As for most chart component, the required props are: \`id\` to uniquely identify the annotation and
a \`dataValues\` prop that describes one or more annotations.

The \`dataValues\` prop takes an array of objects adhering to the following type:

\`\`\`ts

interface RectAnnotationDatum {
  coordinates: {
    x0?: PrimitiveValue;
    x1?: PrimitiveValue;
    y0?: PrimitiveValue;
    y1?: PrimitiveValue;
  };
  details?: string;
}

type PrimitiveValue = string | number | null;
\`\`\`

Each coordinate value can be omitted, if omitted then the corresponding min or max value is used instead.
A text can be issued to be shown within the tooltip. If omitted, no tooltip will be shown.

In the above Example, we are using a fixed set of coordinates:
\`\`\`
coordinates: {
  x0: 0,
  x1: 1,
  y0: 0,
  y1: 7,
}
\`\`\`

This annotation will cover the X axis starting from the \`0\` value to the \`1\` value included. The \`y\` is covered from 0 to 7.
In a barchart with linear or ordinal x scale, the interval covered by the annotation fully include the \`x0\` and \`x1\` values.
If one value is out of the relative domain, we will clip the annotation to the max/min value of the chart domain.
      `,
};
