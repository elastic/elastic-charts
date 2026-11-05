/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import type { BulletDatum } from '../chart_types/bullet_graph/spec';
import { Bullet, BulletSubtype } from '../chart_types/bullet_graph/spec';

const WIDTH = 600;
const HEIGHT = 300;

const datum: BulletDatum = {
  title: 'Average bytes',
  subtitle: 'last 7 days',
  value: 5724,
  target: 8000,
  domain: [0, 10000],
  ticks: () => [0, 2500, 5000, 7500, 10000],
  valueFormatter: (value) => `${value}`,
  tickFormatter: (value) => `${value / 1000}k`,
};

const renderBulletToSvg = (subtype: BulletSubtype, data = datum, width = WIDTH, height = HEIGHT) => {
  const svg = new SvgCanvas(width, height);
  renderChart({
    specs: collectSpecs(
      <Bullet
        id="bullet"
        subtype={subtype}
        data={[[data]]}
        colorBands={{ steps: [0, 5000, 10000], colors: ['#24c292', '#fcd883'] }}
      />,
    ),
    width,
    height,
    context: svg.context,
    Path2D: svg.Path2D,
  });
  return svg.toSvg();
};

const textContents = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text]) => text);

describe('Headless Bullet rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([BulletSubtype.horizontal, BulletSubtype.vertical])(
    'draws a %s bullet with header, ticks and bands',
    (subtype) => {
      const svg = renderBulletToSvg(subtype);

      expect(textContents(svg)).toEqual(
        expect.arrayContaining(['Average bytes', 'last 7 days', '5724 ', '/ 8000', '0k', '5k', '10k']),
      );
      // The value keeps its trailing space before the target, as on a canvas.
      expect(svg).toMatch(/xml:space="preserve">5724 </);
      // Both color bands are drawn.
      expect(svg).toMatch(/fill="#24c292"/i);
      expect(svg).toMatch(/fill="#fcd883"/i);
    },
  );

  it.each([BulletSubtype.halfCircle, BulletSubtype.twoThirdsCircle, BulletSubtype.circle])(
    'draws a %s bullet as arcs',
    (subtype) => {
      const svg = renderBulletToSvg(subtype);

      expect(textContents(svg)).toEqual(expect.arrayContaining(['Average bytes', '5724 ', '/ 8000']));
      expect(svg).toMatch(/stroke="#24c292"/i);
      expect(svg).toMatch(/stroke="#fcd883"/i);
      expect(svg).toMatch(/<path [^>]*d="[^"]*A/);
    },
  );

  // The tallest header: a title wrapping to two lines and a subtitle push the value below them.
  const tallHeaderDatum: BulletDatum = {
    ...datum,
    title: 'Average number of bytes transferred per request across all hosts and all data centers',
    subtitle: 'over the last seven days, compared with the goal for the current quarter',
  };

  it.each(Object.values(BulletSubtype))(
    'draws a %s bullet, not the DOM metric fallback, at the 720x360 size of Kibana previews',
    (subtype) => {
      const svg = renderBulletToSvg(subtype, tallHeaderDatum, 720, 360);

      expect(textContents(svg)).toEqual(expect.arrayContaining(['5724 ', '/ 8000']));
    },
  );

  it('leaves a panel blank where Elastic Charts would draw the DOM metric fallback', () => {
    const svg = renderBulletToSvg(BulletSubtype.circle, tallHeaderDatum, 720, 180);

    expect(textContents(svg)).toEqual([]);
  });
});
