/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import { Goal, GoalSubtype } from '../chart_types/goal_chart/specs';

const WIDTH = 600;
const HEIGHT = 300;

const BAND_COLORS = ['#24c292', '#fcd883', '#ee72a6'];

const renderGoalToSvg = (subtype: GoalSubtype) => {
  const svg = new SvgCanvas(WIDTH, HEIGHT);
  renderChart({
    specs: collectSpecs(
      <Goal
        id="goal"
        subtype={subtype}
        base={0}
        target={260}
        actual={170}
        domain={{ min: 0, max: 300 }}
        bands={[100, 200, 300]}
        ticks={[0, 100, 200, 300]}
        bandFillColor={({ index }) => BAND_COLORS[index] ?? 'gray'}
        tickValueFormatter={({ value }) => `${value} ms`}
        labelMajor="Latency"
        labelMinor="p95"
        centralMajor="170"
        centralMinor=""
        angleStart={Math.PI}
        angleEnd={0}
      />,
    ),
    width: WIDTH,
    height: HEIGHT,
    context: svg.context,
    Path2D: svg.Path2D,
  });
  return svg.toSvg();
};

const textContents = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text]) => text);

describe('Headless Goal rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([GoalSubtype.Goal, GoalSubtype.HorizontalBullet, GoalSubtype.VerticalBullet])(
    'draws a %s chart with bands, ticks and labels',
    (subtype) => {
      const svg = renderGoalToSvg(subtype);

      expect(textContents(svg)).toEqual(expect.arrayContaining(['Latency', 'p95', '0 ms', '300 ms']));
      BAND_COLORS.forEach((color) => expect(svg.toLowerCase()).toContain(color));
    },
  );
});
