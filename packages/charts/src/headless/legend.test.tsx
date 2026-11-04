/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import { AnnotationDomainType } from '../chart_types/specs';
import { LegendValue } from '../common/legend';
import { ScaleType } from '../scales/constants';
import type { SettingsProps } from '../specs';
import { BarSeries, LineAnnotation, Settings } from '../specs';
import { LayoutDirection, Position } from '../utils/common';
import type { PartialTheme } from '../utils/themes/theme';

const WIDTH = 600;
const HEIGHT = 300;

const services = ['checkout', 'cart', 'payments', 'search', 'recommendations'];
const data = services.flatMap((service, index) => [0, 1, 2].map((x) => ({ x, service, y: 10 + index + x })));

const renderToSvg = (settings: Partial<SettingsProps>, theme: PartialTheme = {}, children: React.ReactNode = null) => {
  const svg = new SvgCanvas(WIDTH, HEIGHT, { measureTextWidth: (text) => text.length * 6 });
  const specs = collectSpecs(
    <>
      <Settings showLegend theme={theme} {...settings} />
      <BarSeries
        id="bars"
        data={data}
        xScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['service']}
      />
      {children}
    </>,
  );
  renderChart({ specs, width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D });
  return svg.toSvg();
};

interface Point {
  x: number;
  y: number;
}

// The position of each text drawn without a transform (legend text is drawn untransformed).
const textPosition = (svg: string, text: string): Point => {
  const [, x = 'NaN', y = 'NaN'] =
    new RegExp(`matrix\\(1 0 0 1 0 0\\)" x="(-?[\\d.]+)" y="(-?[\\d.]+)"[^>]*>${text}<`).exec(svg) ?? [];
  return { x: Number(x), y: Number(y) };
};
const textContents = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text]) => text);

describe('Headless legend', () => {
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('lays a bottom legend out as a grid of columns at least `verticalWidth` wide', () => {
    const svg = renderToSvg({ legendPosition: Position.Bottom });
    const [checkout, cart, payments, search] = ['checkout', 'cart', 'payments', 'search'].map((service) =>
      textPosition(svg, service),
    ) as [Point, Point, Point, Point];

    // 600px fit two 200px columns with a 24px gap: items fill rows of two, 26px apart.
    expect(cart.x - checkout.x).toBe((WIDTH - 24) / 2 + 24);
    expect(cart.y).toBe(checkout.y);
    expect(payments.x).toBe(checkout.x);
    expect(payments.y - checkout.y).toBeCloseTo(26);
    expect(search.y).toBe(payments.y);
  });

  it('shows titled legend values inline in the horizontal list layout', () => {
    const svg = renderToSvg({
      legendPosition: Position.Bottom,
      legendLayout: 'list',
      legendValues: [LegendValue.Max],
    });

    expect(textContents(svg)).toEqual(expect.arrayContaining(['checkout', 'MAX:', ' 12']));
    expect(textPosition(svg, 'MAX:').x).toBeGreaterThan(textPosition(svg, 'checkout').x);
  });

  it('wraps labels to `maxLines` lines', () => {
    const legend = { legendPosition: Position.Right, legendSize: 90 };
    const wrapped = renderToSvg(legend, { legend: { labelOptions: { maxLines: 2 } } });
    const truncated = renderToSvg(legend, { legend: { labelOptions: { maxLines: 1 } } });

    expect(textContents(truncated)).toContainEqual(expect.stringMatching(/^recommend\w*…$/));
    expect(textContents(wrapped)).toEqual(expect.arrayContaining(['recommendat', 'ions']));
    expect(textPosition(wrapped, 'ions').y - textPosition(wrapped, 'recommendat').y).toBeCloseTo(18);
  });

  it('floats an inside legend in a corner of the plot area, in columns', () => {
    const svg = renderToSvg({
      legendPosition: {
        vAlign: Position.Top,
        hAlign: Position.Left,
        direction: LayoutDirection.Vertical,
        floating: true,
        floatingColumns: 2,
      },
    });
    const [checkout, cart, payments] = ['checkout', 'cart', 'payments'].map((service) =>
      textPosition(svg, service),
    ) as [Point, Point, Point];

    // The plot area keeps the whole width, and the first column starts 10px inside it.
    expect(checkout.x).toBe(10 + 4 + 16 + 4);
    expect(cart.y).toBe(checkout.y);
    expect(cart.x).toBeGreaterThan(checkout.x);
    expect(payments.x).toBe(checkout.x);
    expect(payments.y - checkout.y).toBeCloseTo(26);
  });

  it('shows the legend title in the table header', () => {
    const svg = renderToSvg({
      legendPosition: Position.Right,
      legendValues: [LegendValue.Max],
      legendTitle: 'Service',
    });

    expect(textContents(svg)).toEqual(expect.arrayContaining(['Service', 'Max', 'checkout']));
  });

  it('draws text line annotation markers next to the plot', () => {
    const svg = renderToSvg(
      { showLegend: false },
      {},
      <LineAnnotation
        id="target"
        domainType={AnnotationDomainType.YDomain}
        dataValues={[{ dataValue: 12 }]}
        marker="Target"
        markerPosition={Position.Top}
      />,
    );

    expect(textContents(svg)).toContain('Target');
  });
});
