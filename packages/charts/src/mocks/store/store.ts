/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Cancelable } from 'lodash';
import type { Store } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { chartTypeSelectors } from '../../chart_types/chart_type_selectors';
import type { SettingsSpec } from '../../specs';
import { DEFAULT_SETTINGS_SPEC } from '../../specs';
import type { Spec } from '../../specs/spec_type';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { updateParentDimensions } from '../../state/actions/chart_settings';
import { upsertSpec, specParsed } from '../../state/actions/specs';
import { createChartStore, type GlobalChartState } from '../../state/chart_state';
import { chartSelectorsRegistry } from '../../state/selectors/get_internal_chart_state';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { mergePartial } from '../../utils/common';

chartSelectorsRegistry.setChartSelectors(chartTypeSelectors);

/** @internal */
export class MockStore {
  static default(
    { width, height, top, left } = { width: 100, height: 100, top: 0, left: 0 },
    chartId = uuidv4(),
  ): Store<GlobalChartState> {
    const store = createChartStore(chartId);
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
