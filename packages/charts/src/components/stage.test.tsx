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

const partition = (renderer: 'canvas' | 'svg') =>
  render(
    <Chart size={[200, 200]} id="stage-test" renderer={renderer}>
      <Settings />
      <Partition
        id="pie"
        data={data}
        valueAccessor={(d) => d.size}
        layers={[{ groupByRollup: (d: { region: string }) => d.region }]}
      />
    </Chart>,
  );

describe('Stage', () => {
  it('renders a canvas by default', () => {
    const { container } = partition('canvas');
    expect(container.querySelector('canvas.echCanvasRenderer')).not.toBeNull();
    expect(container.querySelector('svg.echSvgRenderer')).toBeNull();
  });

  it('renders the same chart as SVG elements when the renderer is svg', () => {
    const { container } = partition('svg');
    const svg = container.querySelector('svg.echSvgRenderer');
    expect(svg).not.toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
    expect(svg).toHaveAttribute('width', '200');
    // one filled path per sector
    const sectors = Array.from(svg!.querySelectorAll('path')).filter((p) => p.getAttribute('fill') !== 'none');
    expect(sectors.length).toBeGreaterThanOrEqual(data.length);
    expect(sectors.every((p) => (p.getAttribute('d') ?? '').includes('A'))).toBe(true);
    // the screen reader content sits beside the stage, not inside it
    expect(container.querySelector('figure > .echScreenReaderOnly')).not.toBeNull();
    expect(svg!.querySelector('.echScreenReaderOnly')).toBeNull();
    // the chart reports itself rendered
    expect(container.querySelector('.echChartStatus')).toHaveAttribute('data-ech-render-complete', 'true');
  });
});
