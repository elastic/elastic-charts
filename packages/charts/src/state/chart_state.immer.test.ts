/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockSeriesSpec } from '../mocks/specs';
import { MockStore } from '../mocks/store';
import type { LineSeriesSpec } from '../specs';

describe('chart store - spec data and Immer', () => {
  it('does not deep-freeze series rows when upserting a spec', () => {
    const row: [number, number] = [0, 1];
    const data = [row];
    const spec = MockSeriesSpec.line({ id: 'series-1', data });
    const store = MockStore.default();

    MockStore.addSpecs(spec, store);

    const stored = store.getState().specs[spec.id] as LineSeriesSpec;
    expect(stored.data).toBe(data);
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(row)).toBe(false);
  });
});
