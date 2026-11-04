/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, createGlyphFont, renderChart, SvgCanvas } from '.';
import { OutlineSpriteCanvas } from './render_wordcloud';
import type { WeightFn, WordModel } from '../chart_types/wordcloud/specs';
import { Wordcloud } from '../chart_types/wordcloud/specs';

const WIDTH = 600;
const HEIGHT = 300;

const words: WordModel[] = [
  { text: 'php', weight: 1, color: '#16c5c0' },
  { text: 'gz', weight: 0.8, color: '#a6edea' },
  { text: 'css', weight: 0.4, color: '#61a2ff' },
  { text: 'deb', weight: 0, color: '#bfdbff' },
];

// A test font: an L-shaped "L" and a 500 x 500 unit box for every other character used here.
const font = createGlyphFont({
  family: 'Test',
  faces: [
    {
      weight: 400,
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: {
        L: [600, 'M0 0H600V200H200V700H0Z'],
        ...Object.fromEntries(
          [...'abcdeghijklmnopqrstuvwxyz0123456789'].map((char): [string, [number, string]] => [
            char,
            [600, 'M50 0H550V500H50Z'],
          ]),
        ),
      },
    },
  ],
});

const renderToSvg = (element: React.ReactElement, width = WIDTH, height = HEIGHT, withFont = false) => {
  const svg = new SvgCanvas(width, height, withFont ? { font } : {});
  renderChart({ specs: collectSpecs(element), width, height, context: svg.context, Path2D: svg.Path2D });
  return svg.toSvg();
};

interface DrawnWord {
  text: string;
  size: number;
  color: string;
  transform: number[];
}

interface DrawnOutline {
  color: string;
  box: { left: number; right: number; top: number; bottom: number };
}

// Words drawn as outlines, with the bounding box of their outline on the chart.
const drawnOutlines = (svg: string): DrawnOutline[] =>
  [...svg.matchAll(/<path transform="matrix\(([^)]*)\)" d="([^"]*)" fill="([^"]+)"/g)].map(
    ([, matrix = '', d = '', color = '']) => {
      const [a = 1, b = 0, c = 0, dd = 1, e = 0, f = 0] = matrix.split(' ').map(Number);
      // The test font outlines only use M, H, V and Z.
      let current = [0, 0];
      const points = [...d.matchAll(/([HMV])([^HMVZ]*)/g)].map(([, command, values = '']) => {
        const [first = 0, second = 0] = values.trim().split(' ').map(Number);
        current =
          command === 'M' ? [first, second] : command === 'H' ? [first, current[1] ?? 0] : [current[0] ?? 0, first];
        return current;
      });
      const xs = points.map(([x = 0, y = 0]) => a * x + c * y + e);
      const ys = points.map(([x = 0, y = 0]) => b * x + dd * y + f);
      return {
        color,
        box: { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) },
      };
    },
  );

const drawnWords = (svg: string): DrawnWord[] =>
  [
    ...svg.matchAll(/<text transform="matrix\(([^)]*)\)"[^>]*font-size="([\d.]+)"[^>]*fill="([^"]+)"[^>]*>([^<]*)</g),
  ].map(([, matrix = '', size, color = '', text = '']) => ({
    text,
    size: Number(size),
    color,
    transform: matrix.split(' ').map(Number),
  }));

// The rotation of a word's transform matrix, in degrees.
const toDegrees = ([a = 1, b = 0]: number[]) => Math.round((Math.atan2(b, a) * 180) / Math.PI);

const cloud = (props: Partial<React.ComponentProps<typeof Wordcloud>> = {}) => (
  <Wordcloud
    id="cloud"
    startAngle={0}
    endAngle={0}
    angleCount={360}
    padding={5}
    fontWeight={400}
    fontFamily="Inter, sans-serif"
    fontStyle="normal"
    minFontSize={18}
    maxFontSize={72}
    spiral="archimedean"
    weightFn="linear"
    data={words}
    {...props}
  />
);

describe('Headless Wordcloud rendering', () => {
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('draws every word that fits with its color, centered on the chart', () => {
    const drawn = drawnWords(renderToSvg(cloud()));

    expect(drawn.map(({ text }) => text).sort()).toEqual(words.map(({ text }) => text).sort());
    expect(drawn.find(({ text }) => text === 'php')).toMatchObject({ size: 72, color: '#16c5c0' });
    // The biggest word is placed first, at the center of the chart.
    const [, , , , x, y] = drawn.find(({ text }) => text === 'php')?.transform ?? [];
    expect(x).toBe(WIDTH / 2);
    expect(y).toBe(HEIGHT / 2);
  });

  it('places the words without overlapping their bodies', () => {
    const drawn = drawnWords(renderToSvg(cloud()));
    // The x-height band of each horizontal word; real glyph shapes may only interleave outside it.
    const boxes = drawn.map(({ text, size, transform: [, , , , x = 0, y = 0] }) => {
      const width = text.length * size * 0.45;
      return { left: x - width / 2, right: x + width / 2, top: y - 0.5 * size, bottom: y };
    });
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b) => {
        const overlaps = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        expect(overlaps).toBe(false);
      }),
    );
  });

  it('lays out the same words the same way every time', () => {
    expect(renderToSvg(cloud())).toBe(renderToSvg(cloud()));
  });

  it.each<[string, number, number, number]>([
    ['single', 0, 360, 1],
    ['right angled', 90, 2, 2],
    ['multiple', -90, 12, 3],
  ])('rotates words for the %s orientation', (_name, endAngle, angleCount, minDistinctAngles) => {
    const many = Array.from({ length: 12 }, (_, i) => ({ text: `word${i}`, weight: i / 11, color: '#000' }));
    const drawn = drawnWords(renderToSvg(cloud({ endAngle, angleCount, data: many, maxFontSize: 30 })));
    const angles = new Set(drawn.map(({ transform }) => toDegrees(transform)));
    // Like the Wordcloud renderer, angles are spread evenly from startAngle (0) to endAngle.
    const allowedAngles =
      angleCount > 1
        ? Array.from({ length: angleCount }, (_, i) => Math.round((i * endAngle) / (angleCount - 1)))
        : [0];

    expect(drawn.length).toBeGreaterThan(0);
    expect([...angles].filter((angle) => !allowedAngles.includes(angle))).toEqual([]);
    expect(angles.size).toBeGreaterThanOrEqual(minDistinctAngles);
  });

  it.each<[WeightFn, number]>([
    ['linear', 18 + 54 * 0.4],
    ['squareRoot', 18 + 54 * Math.sqrt(0.4)],
    ['log', 18 + 54 * Math.log2(1.4)],
    ['exponential', 18 + 54 * 0.4 ** 3],
  ])('sizes words with the %s weight function', (weightFn, expectedSize) => {
    const drawn = drawnWords(renderToSvg(cloud({ weightFn })));

    expect(drawn.find(({ text }) => text === 'css')?.size).toBe(Math.trunc(expectedSize));
  });

  it('draws words as the canvas font outlines and keeps the outlines apart', () => {
    const svg = renderToSvg(cloud(), WIDTH, HEIGHT, true);
    const drawn = drawnOutlines(svg);

    expect(svg).not.toContain('<text');
    expect(drawn.map(({ color }) => color).sort()).toEqual(words.map(({ color }) => color).sort());
    drawn.forEach(({ box: a }, i) =>
      drawn.slice(i + 1).forEach(({ box: b }) => {
        const overlaps = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        expect(overlaps).toBe(false);
      }),
    );
    expect(renderToSvg(cloud(), WIDTH, HEIGHT, true)).toBe(svg);
  });

  it('rasterizes sprites from the glyph outlines, grown by half the line width when stroked', () => {
    const sprite = new OutlineSpriteCanvas(font.measure, (text, cssFont, x, y) => font.toPath(text, cssFont, x, y));
    sprite.width = 100;
    sprite.height = 100;
    sprite.font = '100px Test';
    const filled = (x: number, y: number) => sprite.getImageData(x, y, 1, 1).data[0] === 255;
    // The "L" at 10, 90: a bar from x 10 to 30 and y 20 to 90, and a foot from x 30 to 70 and y 70 to 90.
    sprite.fillText('L', 10, 90);

    expect(filled(15, 50)).toBe(true);
    expect(filled(50, 80)).toBe(true);
    expect(filled(30, 50)).toBe(false);
    expect(filled(50, 50)).toBe(false);

    sprite.lineWidth = 10;
    sprite.strokeText('L', 10, 90);

    expect(filled(34, 50)).toBe(true);
    expect(filled(35, 50)).toBe(false);
    expect(filled(50, 66)).toBe(true);
    expect(filled(50, 50)).toBe(false);
  });

  it('reports the words that did not fit', () => {
    const outOfRoomCallback = jest.fn<void, [number, number, string[]]>();
    renderToSvg(cloud({ outOfRoomCallback }), 200, 60);

    expect(outOfRoomCallback).toHaveBeenCalledWith(words.length, expect.any(Number), expect.any(Array));
    const [, renderedCount = 0, renderedWords] = outOfRoomCallback.mock.calls[0] ?? [];
    expect(renderedCount).toBeLessThan(words.length);
    expect(renderedWords).toHaveLength(renderedCount);
  });
});
