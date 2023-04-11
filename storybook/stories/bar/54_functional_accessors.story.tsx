/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  AccessorFn,
  ElementClickListener,
  XYChartElementEvent,
} from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const xAccessorFn: AccessorFn = (d) => d.x;
  const yAccessorFn: AccessorFn = (d) => d.y;
  yAccessorFn.fieldName = text('y fn name', '') || undefined;
  const splitAccessorFn: AccessorFn = (d) => d.g2;
  splitAccessorFn.fieldName = text('split fn name', '') || undefined;

  const onElementClick = ([e]: XYChartElementEvent[]) => action('clicked series key')(e?.[1]?.key);

  return (
    <Chart>
      <Settings
        onElementClick={onElementClick as ElementClickListener}
        showLegend
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={xAccessorFn}
        yAccessors={['y', yAccessorFn]}
        splitSeriesAccessors={['g1', splitAccessorFn]}
        data={TestDatasets.BARCHART_1Y2G}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `An \`AccessorFn\` can be used as any accessor including: \`xAccessor\`, \`yAccessors\`, \`y0Accessors\` and \`splitSeriesAccessors\`.

This enables serialization of complex values, without needing to transform raw data.

\`\`\`ts
// simple example
const yAccessorFn: AccessorFn = (d) => d.y;
yAccessorFn.fieldName = 'simple y value';

// complex example
const yAccessorFn: AccessorFn = ({ range }) => \`\${range.to} - \${range.from}\`;
yAccessorFn.fieldName = 'complex y value';
\`\`\`

If no \`fieldName\` is provided, the default value will be set using the index \`(index:0)\`.

Try changing the \`fieldName\` for the y and split accessor functions in the storybook knobs.

**Note: All \`fieldName\` and \`Accessor\` values should be unique. Any duplicated values will be ignored.**
      `,
};
