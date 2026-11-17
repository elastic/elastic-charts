/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { act, render } from '@testing-library/react';
import React from 'react';

import { Heatmap } from '../../chart_types/heatmap/specs';
import { Chart } from '../../components/chart';
import { ScaleType } from '../../scales/constants';
import { BarSeries, Settings } from '../../specs';

const FILL_RULES = new Set(['nonzero', 'evenodd']);

/**
 * A 2d context that checks the fill rule of `fill` and `clip` by argument count, the way jest-canvas-mock
 * does: an explicit `undefined` is an invalid `CanvasFillRule`, though browsers read it as an omitted one.
 */
const strictContext = (canvas: HTMLCanvasElement, calls: string[]) => {
  const state: Record<string | symbol, unknown> = { canvas };
  const withFillRule =
    (name: string) =>
    (...args: unknown[]) => {
      const rule = args.length > 0 && !(args[0] instanceof Path2D) ? args[0] : args.length > 1 ? args[1] : 'nonzero';
      if (!FILL_RULES.has(rule as string)) {
        throw new TypeError(`Failed to execute '${name}': '${String(rule)}' is not a valid CanvasFillRule`);
      }
      calls.push(name);
    };
  const methods: Record<string | symbol, unknown> = {
    fill: withFillRule('fill'),
    clip: withFillRule('clip'),
    measureText: (text: string) => ({ width: text.length * 6 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => null,
    getLineDash: () => [],
  };
  const ctx = new Proxy(state, {
    get: (target, key) => (key in target ? target[key] : methods[key] ?? (() => {})),
    set: (target, key, value) => {
      target[key] = value;
      return true;
    },
  });
  return ctx;
};

describe('canvas painting on a context that rejects an undefined fill rule', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const original = window.HTMLCanvasElement.prototype.getContext;
  const calls: string[] = [];

  beforeAll(() => {
    (globalThis as { Path2D?: unknown }).Path2D ??= class {};
  });

  beforeEach(() => {
    calls.length = 0;
    const contexts = new WeakMap<HTMLCanvasElement, unknown>();
    window.HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement) {
      if (!contexts.has(this)) {
        contexts.set(this, strictContext(this, calls));
      }
      return contexts.get(this);
    } as unknown as typeof original;
  });

  afterEach(() => {
    window.HTMLCanvasElement.prototype.getContext = original;
  });

  it('mounts a heatmap', () => {
    expect(() =>
      render(
        <Chart size={[200, 200]}>
          <Settings />
          <Heatmap
            id="heatmap"
            xScale={{ type: ScaleType.Ordinal }}
            data={[
              { x: 'a', y: 'r1', value: 1 },
              { x: 'b', y: 'r1', value: 2 },
              { x: 'a', y: 'r2', value: 3 },
              { x: 'b', y: 'r2', value: 4 },
            ]}
            xAccessor="x"
            yAccessor="y"
            valueAccessor="value"
            colorScale={{ type: 'bands', bands: [{ start: 0, end: 5, color: 'red' }] }}
          />
        </Chart>,
      ),
    ).not.toThrow();
    expect(calls).toContain('fill');
  });

  it('mounts a bar chart', () => {
    // the XY paint is debounced in tests, see `__mocks__/ts-debounce.ts`
    jest.useFakeTimers();
    try {
      expect(() => {
        render(
          <Chart size={[200, 200]}>
            <Settings />
            <BarSeries id="bars" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
          </Chart>,
        );
        act(() => {
          jest.advanceTimersByTime(500);
        });
      }).not.toThrow();
    } finally {
      jest.useRealTimers();
    }
    expect(calls).toContain('fill');
    expect(calls).toContain('clip');
  });
});
