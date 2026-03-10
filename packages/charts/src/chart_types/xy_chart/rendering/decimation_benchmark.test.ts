/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Instrumented benchmark that breaks down where time is spent in the
 * geometry computation pipeline. Run with:
 *
 *   npx jest --config jest.config.js decimation_benchmark --verbose --testTimeout=300000
 */

import { decimateDataSeries } from './decimation';
import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { getRandomNumberGenerator } from '../../../mocks/utils';
import { ScaleType } from '../../../scales/constants';
import { computeSeriesDomainsSelector } from '../state/selectors/compute_series_domains';
import { computeSeriesGeometriesSelector } from '../state/selectors/compute_series_geometries';
import type { DataSeriesDatum } from '../utils/series';

const rng = getRandomNumberGenerator();

function generateData(count: number): Array<[number, number]> {
  const data = new Array(count);
  const start = Date.now() - count * 1000;
  for (let i = 0; i < count; i++) {
    data[i] = [start + i * 1000, Math.sin(i * 0.001) * 50 + rng(0, 10)];
  }
  return data;
}

function generateRawData(count: number): DataSeriesDatum[] {
  const start = Date.now() - count * 1000;
  return Array.from({ length: count }, (_, i) => ({
    x: start + i * 1000,
    y1: Math.sin(i * 0.001) * 50 + rng(0, 10),
    y0: null,
    initialY1: null,
    initialY0: null,
    mark: null,
    datum: null,
  }));
}

function createStore(count: number) {
  const data = generateData(count);
  const spec = MockSeriesSpec.line({
    id: 'bench',
    data,
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Time,
    yScaleType: ScaleType.Linear,
  });
  const store = MockStore.default({ width: 1920, height: 1080, top: 0, left: 0 });
  const settings = MockGlobalSpec.settingsNoMargins();
  MockStore.addSpecs([spec, settings], store);
  return store;
}

describe('Pipeline breakdown', () => {
  const sizes = [100_000, 500_000, 1_000_000];

  for (const size of sizes) {
    it(`${size.toLocaleString()} points`, () => {
      // 1. Time the data pipeline (series splitting, gap filling, domain computation)
      const store1 = createStore(size);
      const pipelineStart = performance.now();
      computeSeriesDomainsSelector(store1.getState());
      const pipelineMs = performance.now() - pipelineStart;

      // 2. Time the geometry rendering (pipeline result is now cached in store1)
      const renderStart = performance.now();
      computeSeriesGeometriesSelector(store1.getState());
      const renderMs = performance.now() - renderStart;

      // 3. Time the decimation function alone
      const rawData = generateRawData(size);
      const decimateStart = performance.now();
      decimateDataSeries(rawData, 1920);
      const decimateMs = performance.now() - decimateStart;

      // 4. Time everything end-to-end (fresh store, nothing cached)
      const store2 = createStore(size);
      const totalStart = performance.now();
      computeSeriesGeometriesSelector(store2.getState());
      const totalMs = performance.now() - totalStart;

      // eslint-disable-next-line no-console
      console.log(`
        ${size.toLocaleString()} points breakdown:
          Data pipeline (computeSeriesDomainsSelector): ${pipelineMs.toFixed(0)}ms
          Geometry rendering (with pipeline cached):     ${renderMs.toFixed(0)}ms
          Decimation scan alone:                         ${decimateMs.toFixed(1)}ms
          End-to-end total (fresh store):                ${totalMs.toFixed(0)}ms`);
    });
  }
});
