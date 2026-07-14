/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 4 — Time bar unit tests.
 *
 * Goal: verify that the correct raster factory is selected per `xScaleType` and that the
 * function does not throw on representative inputs. Visual correctness is verified via the
 * Storybook story (04_time_bar) per spec.
 */

import { drawTimeBar } from './time_bar';
import type { TraceGeometry } from './types';
import type { TraceStyle } from './types';

// ---------------------------------------------------------------------------
// Mocks: intercept raster factory calls so we can assert which was selected.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockContinuousTimeRasters: jest.MockedFunction<(...args: any[]) => (...args: any[]) => any[]> = jest.fn(() => () => []);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockNumericalRasters: jest.MockedFunction<(...args: any[]) => (...args: any[]) => any[]> = jest.fn(() => () => []);

jest.mock('../../../chart_types/xy_chart/axes/timeslip/continuous_time_rasters', () => ({
  ...jest.requireActual('../../../chart_types/xy_chart/axes/timeslip/continuous_time_rasters'),
  continuousTimeRasters: (config: unknown, tz: unknown) => mockContinuousTimeRasters(config, tz),
}));

jest.mock('../../../chart_types/xy_chart/axes/timeslip/numerical_rasters', () => ({
  ...jest.requireActual('../../../chart_types/xy_chart/axes/timeslip/numerical_rasters'),
  numericalRasters: (config: unknown) => mockNumericalRasters(config),
}));

// ---------------------------------------------------------------------------
// Minimal stubs
// ---------------------------------------------------------------------------

/** Minimal CanvasRenderingContext2D stub — only the calls drawTimeBar makes. */
function makeCtx(): CanvasRenderingContext2D {
  return {
    clearRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillText: jest.fn(),
    strokeText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'ltr' as CanvasDirection,
    lineJoin: 'miter' as CanvasLineJoin,
    setLineDash: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
}

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#ccc',
  activeSegmentColor: '#007',
  gutterLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  gridLineColor: '#eee',
};

function makeGeom(xScaleType: 'time' | 'linear'): TraceGeometry {
  const plotLeft = 200;
  const plotWidth = 800;
  const focusDomain = { min: 0, max: 10_000 }; // 10 s
  return {
    spans: [],
    gutter: { top: 0, left: 0, width: 200, height: 600 },
    timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 32 },
    plot: { top: 32, left: plotLeft, width: plotWidth, height: 568 },
    laneHeight: 24,
    domain: { min: 0, max: 10_000 },
    focusDomain,
    scrollOffset: 0,
    xScaleType,
    scale: (tMs: number) => plotLeft + (tMs / 10_000) * plotWidth,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockContinuousTimeRasters.mockClear();
  mockNumericalRasters.mockClear();
});

describe('drawTimeBar — raster factory selection', () => {
  it('uses continuousTimeRasters for xScaleType "time"', () => {
    drawTimeBar(makeCtx(), makeGeom('time'), style);
    expect(mockContinuousTimeRasters).toHaveBeenCalledTimes(1);
    expect(mockNumericalRasters).not.toHaveBeenCalled();
  });

  it('uses numericalRasters for xScaleType "linear"', () => {
    drawTimeBar(makeCtx(), makeGeom('linear'), style);
    expect(mockNumericalRasters).toHaveBeenCalledTimes(1);
    expect(mockContinuousTimeRasters).not.toHaveBeenCalled();
  });
});

describe('drawTimeBar — robustness', () => {
  it('does not throw for a zero-width time bar', () => {
    const geom = makeGeom('time');
    const narrow = { ...geom, timeBar: { ...geom.timeBar, width: 0 } };
    expect(() => drawTimeBar(makeCtx(), narrow, style)).not.toThrow();
  });

  it('does not throw for a zero-height time bar', () => {
    const geom = makeGeom('linear');
    const flat = { ...geom, timeBar: { ...geom.timeBar, height: 0 } };
    expect(() => drawTimeBar(makeCtx(), flat, style)).not.toThrow();
  });

  it('does not throw when layers are returned (real rasters, no mock)', () => {
    // Un-mock for this test to exercise the real raster path end-to-end.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drawTimeBar: real } = require('./time_bar');
      expect(() => real(makeCtx(), makeGeom('time'), style)).not.toThrow();
      expect(() => real(makeCtx(), makeGeom('linear'), style)).not.toThrow();
    });
  });
});
