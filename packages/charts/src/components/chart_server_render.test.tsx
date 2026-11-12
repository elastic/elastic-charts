/**
 * @jest-environment node
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line header/header -- jest reads the environment pragma only from the first comment
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Chart } from './chart';
import { ScaleType } from '../scales/constants';
import { Axis, BarSeries, Settings } from '../specs';
import { Position } from '../utils/common';

const data = [
  { x: 'a', y: 2 },
  { x: 'b', y: 5 },
];

const renderChart = (renderer: 'svg' | 'canvas', size: [number | string, number | string] = [300, 200]) =>
  renderToStaticMarkup(
    <Chart id="ssr" renderer={renderer} size={size}>
      <Settings />
      <Axis id="x" position={Position.Bottom} />
      <BarSeries id="bars" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
    </Chart>,
  );

describe('Chart rendered on the server', () => {
  it('runs without a DOM', () => {
    expect(typeof document).toBe('undefined');
  });

  it('paints the svg stage with a fixed pixel size', () => {
    const html = renderChart('svg');
    const svg = /<svg[^>]*echSvgRenderer[^>]*>/.exec(html)?.[0];
    expect(svg).toContain('width="300"');
    expect(svg).toContain('height="200"');
    expect(html.match(/<text[^>]*>(a|b)<\/text>/g)).toHaveLength(2);
    expect(html).toContain('<path');
  });

  it('renders no stage when the size is not in pixels', () => {
    expect(renderChart('svg', ['100%', 200])).not.toContain('echSvgRenderer');
  });

  it('renders an empty canvas stage with the canvas renderer', () => {
    expect(renderChart('canvas')).toContain('<canvas');
  });
});
