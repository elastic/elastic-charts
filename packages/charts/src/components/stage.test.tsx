/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from '@testing-library/react';
import React from 'react';

import { Chart } from './chart';
import { Partition, Settings } from '../specs';

const data = [
  { region: 'EMEA', size: 40 },
  { region: 'APAC', size: 35 },
  { region: 'AMER', size: 25 },
];

describe('Stage', () => {
  it('renders a canvas beside the screen reader content', () => {
    const { container } = render(
      <Chart size={[200, 200]} id="stage-test">
        <Settings />
        <Partition
          id="pie"
          data={data}
          valueAccessor={(d) => d.size}
          layers={[{ groupByRollup: (d: { region: string }) => d.region }]}
        />
      </Chart>,
    );
    const canvas = container.querySelector('canvas.echCanvasRenderer');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('width', '200');
    // the screen reader content sits beside the stage, not inside it
    expect(container.querySelector('figure > .echScreenReaderOnly')).not.toBeNull();
    expect(canvas!.querySelector('.echScreenReaderOnly')).toBeNull();
    // the chart reports itself rendered
    expect(container.querySelector('.echChartStatus')).toHaveAttribute('data-ech-render-complete', 'true');
  });
});
