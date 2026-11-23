/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { upsertSpec, upsertSpecs } from './actions/specs';
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

  it('preserves special IDs and existing specs when extending a batch', () => {
    const store = MockStore.default();
    const existing = MockSeriesSpec.line({ id: 'existing', data: [[0, 1]] });
    const special = MockSeriesSpec.line({ id: '__proto__', data: [[1, 2]] });
    const later = MockSeriesSpec.line({ id: 'later', data: [[2, 3]] });

    store.dispatch(upsertSpec(existing));
    store.dispatch(upsertSpecs([special]));
    store.dispatch(upsertSpecs([later]));

    const { specs } = store.getState();
    expect(Object.keys(specs)).toEqual(expect.arrayContaining(['existing', '__proto__', 'later']));
    expect(Object.getOwnPropertyDescriptor(specs, '__proto__')?.value).toEqual(special);
    expect(Object.getPrototypeOf(specs)).toBe(Object.prototype);
  });
});
