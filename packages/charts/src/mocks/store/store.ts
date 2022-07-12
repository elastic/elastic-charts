/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Cancelable } from 'lodash';
import { createStore, Store } from 'redux';

import { DEFAULT_SETTINGS_SPEC, SettingsSpec, Spec, SpecType } from '../../specs';
import { updateParentDimensions } from '../../state/actions/chart_settings';
import { upsertSpec, specParsed } from '../../state/actions/specs';
import { chartStoreReducer, GlobalChartState } from '../../state/chart_state';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockStore {
  static default(
    { width, height, top, left } = { width: 100, height: 100, top: 0, left: 0 },
    chartId = 'chartId',
  ): Store<GlobalChartState> {
    const storeReducer = chartStoreReducer(chartId);
    const store = createStore(storeReducer);
    store.dispatch(updateParentDimensions({ width, height, top, left }));
    return store;
  }

  static addSpecs(specs: Spec | Array<Spec>, store: Store<GlobalChartState>) {
    if (Array.isArray(specs)) {
      const actions = specs.map(upsertSpec);
      actions.forEach(store.dispatch);
      if (!specs.some((s) => s.id === DEFAULT_SETTINGS_SPEC.id)) {
        store.dispatch(upsertSpec(DEFAULT_SETTINGS_SPEC));
      }
    } else {
      store.dispatch(upsertSpec(specs));
      if (specs.id !== DEFAULT_SETTINGS_SPEC.id) {
        store.dispatch(upsertSpec(DEFAULT_SETTINGS_SPEC));
      }
    }
    store.dispatch(specParsed());
  }

  static updateDimensions(
    { width, height, top, left } = { width: 100, height: 100, top: 0, left: 0 },
    store: Store<GlobalChartState>,
  ) {
    store.dispatch(updateParentDimensions({ width, height, top, left }));
  }

  /**
   * udpate settings spec in store
   */
  static updateSettings(store: Store<GlobalChartState>, newSettings: Partial<SettingsSpec>) {
    const specs = Object.values(store.getState().specs).map((s) => {
      if (s.specType === SpecType.Settings) {
        return mergePartial(s, newSettings);
      }

      return s;
    });

    MockStore.addSpecs(specs, store);
  }

  /**
   * flush all debounced listeners
   *
   * See packages/charts/src/__mocks__/ts-debounce.ts
   */
  static flush(store: Store<GlobalChartState>) {
    const settings = getSettingsSpecSelector(store.getState());

    // debounce mocked as lodash.debounce to enable flush
    if (settings.onPointerUpdate) (settings.onPointerUpdate as unknown as Cancelable).flush();
  }
}
