/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Cancelable } from 'lodash';
import { Store } from 'redux';

import { DEFAULT_SETTINGS_SPEC } from '../../specs/default_settings_spec';
import { SettingsSpec } from '../../specs/settings';
import { Spec } from '../../specs/spec';
import { SpecType } from '../../specs/spec_type';
import { updateParentDimensions } from '../../state/actions/chart_settings';
import { upsertSpec, specParsed } from '../../state/actions/specs';
import { chartStore, initialize } from '../../state/chart_state';
import { GlobalChartState } from '../../state/global_chart_state';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockStore {
  static default(
    { width, height, top, left } = { width: 100, height: 100, top: 0, left: 0 },
    chartId = 'chartId',
  ): Store<GlobalChartState> {
    chartStore.dispatch(initialize({ id: chartId }));
    chartStore.dispatch(updateParentDimensions({ width, height, top, left }));
    return chartStore;
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
    store: Store<GlobalChartState>,
    { width, height, top, left } = { width: 100, height: 100, top: 0, left: 0 },
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
