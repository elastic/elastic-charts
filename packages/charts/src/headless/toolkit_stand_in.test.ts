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

import type * as SpecMocks from '../mocks/specs';
import type * as StoreMocks from '../mocks/store';
import type * as ScaleConstants from '../scales/constants';
import type * as ChartSettingsActions from '../state/actions/chart_settings';
import type * as LegendActions from '../state/actions/legend';
import type * as MouseActions from '../state/actions/mouse';
import type * as SpecActions from '../state/actions/specs';
import type * as TooltipActions from '../state/actions/tooltip';
import type * as ChartState from '../state/chart_state';

const data = [
  { x: 0, y: 1, g: 'a' },
  { x: 1, y: 3, g: 'b' },
  { x: 2, y: 2, g: 'a' },
  { x: 3, y: 5, g: 'b' },
];

/** functions are made anew by each load of Charts, so they are compared as being functions */
const written = (state: unknown) => JSON.stringify(state, (_, value) => (typeof value === 'function' ? 'ƒ' : value));

/** How many of the objects that a state is made of could still be written to */
const unfrozen = (value: unknown, seen = new Set<unknown>()): number => {
  if (typeof value !== 'object' || value === null || seen.has(value)) return 0;
  seen.add(value);
  return Object.values(value).reduce<number>((sum, part) => sum + unfrozen(part, seen), Object.isFrozen(value) ? 0 : 1);
};

/** What the store of a chart goes through, with the toolkit or with the stand-in for it */
const history = (standIn: boolean) => {
  const states: unknown[] = [];
  const actions: unknown[] = [];
  let listenerCalls = 0;
  let isOfRedux = false;
  jest.isolateModules(() => {
    if (standIn) jest.doMock('@reduxjs/toolkit', () => jest.requireActual('./toolkit_stand_in'));
    try {
      /* eslint-disable @typescript-eslint/no-var-requires, global-require */
      const { MockStore } = require('../mocks/store') as typeof StoreMocks;
      const { MockSeriesSpec } = require('../mocks/specs') as typeof SpecMocks;
      const { ScaleType } = require('../scales/constants') as typeof ScaleConstants;
      const { onMouseDown, onMouseUp, onPointerMove } = require('../state/actions/mouse') as typeof MouseActions;
      const { onToggleDeselectSeriesAction } = require('../state/actions/legend') as typeof LegendActions;
      const { pinTooltip } = require('../state/actions/tooltip') as typeof TooltipActions;
      const { removeSpec, specParsed } = require('../state/actions/specs') as typeof SpecActions;

      const { createChartStore } = require('../state/chart_state') as typeof ChartState;
      const { updateParentDimensions } = require('../state/actions/chart_settings') as typeof ChartSettingsActions;
      /* eslint-enable @typescript-eslint/no-var-requires, global-require */

      const store = createChartStore('chart');
      isOfRedux = 'replaceReducer' in store;
      const unsubscribe = store.subscribe(() => listenerCalls++);
      const did = (...given: Parameters<typeof store.dispatch>[0][]) => {
        actions.push(...given);
        given.forEach((action) => store.dispatch(action));
        states.push(store.getState());
      };

      // the state the store starts with, then one that no reducer has a case for
      did();
      did({ type: 'NOT_AN_ACTION_OF_THE_CHART' });
      did(updateParentDimensions({ width: 100, height: 100, top: 0, left: 0 }));
      MockStore.addSpecs(
        MockSeriesSpec.bar({ id: 'bars', xScaleType: ScaleType.Linear, splitSeriesAccessors: ['g'], data }),
        store,
      );
      did();
      did(onPointerMove({ position: { x: 30, y: 40 }, time: 0 }));
      // no change: the same state has to stay
      did(onPointerMove({ position: { x: 30, y: 40 }, time: 0 }));
      did(pinTooltip({ pinned: true }));
      did(pinTooltip({ pinned: false, resetPointer: true }));
      did(
        onMouseDown({ position: { x: 10, y: 10 }, time: 100 }),
        onPointerMove({ position: { x: 60, y: 10 }, time: 300 }),
        onMouseUp({ position: { x: 60, y: 10 }, time: 400 }),
      );
      did(onToggleDeselectSeriesAction({ legendItemIds: [{ specId: 'bars', key: 'unknown' }] }));
      did(removeSpec('bars'), specParsed());
      unsubscribe();
      did(specParsed());
    } finally {
      jest.dontMock('@reduxjs/toolkit');
    }
  });
  return {
    isOfRedux,
    listenerCalls,
    states: states.map(written),
    actions: actions.map(written),
    unfrozen: states.map((state) => unfrozen(state)),
    // which steps left the state as it was
    same: states.map((state, i) => i > 0 && state === states[i - 1]),
  };
};

describe('the stand-in for the toolkit', () => {
  const withToolkit = history(false);
  const withStandIn = history(true);

  it('is what made the store', () => {
    expect(withToolkit.isOfRedux).toBe(true);
    expect(withStandIn.isOfRedux).toBe(false);
  });

  it('makes the actions that the toolkit makes, also where the action creator prepares the payload', () => {
    expect(withToolkit.actions).toContain('{"type":"PIN_TOOLTIP","payload":{"pinned":true,"resetPointer":false}}');
    expect(withStandIn.actions).toEqual(withToolkit.actions);
  });

  it('takes the store of a chart through the states that the toolkit does', () => {
    expect(withToolkit.states).toHaveLength(12);
    expect(new Set(withToolkit.states).size).toBeGreaterThan(5);
    expect(withStandIn.states).toEqual(withToolkit.states);
  });

  it('freezes every state all the way down, and keeps the state that an action does not change', () => {
    // all but the rows of the data, which the chart keeps immer from walking
    expect(withToolkit.unfrozen[0]).toBe(0);
    expect(Math.max(...withToolkit.unfrozen)).toBe(data.length);
    expect(withStandIn.unfrozen).toEqual(withToolkit.unfrozen);
    expect(withToolkit.same[1]).toBe(true);
    expect(withStandIn.same).toEqual(withToolkit.same);
  });

  it('calls a listener once for each action, until it unsubscribes', () => {
    expect(withToolkit.listenerCalls).toBeGreaterThan(8);
    expect(withStandIn.listenerCalls).toBe(withToolkit.listenerCalls);
  });
});
