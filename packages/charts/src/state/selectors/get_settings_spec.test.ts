/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSettingsSpecSelector } from './get_settings_spec';
import { DEFAULT_SETTINGS_SPEC } from '../../specs/constants';
import { getInitialState } from '../chart_state';

describe('selectors - getSettingsSpecSelector', () => {
  const state = getInitialState('chartId1');
  it('shall return the same reference', () => {
    const settings = getSettingsSpecSelector(state);
    expect(settings).toBe(DEFAULT_SETTINGS_SPEC);
  });
  it('shall avoid recomputations', () => {
    getSettingsSpecSelector(state);
    expect(getSettingsSpecSelector.recomputations()).toBe(1);
    getSettingsSpecSelector(state);
    expect(getSettingsSpecSelector.recomputations()).toBe(1);
    getSettingsSpecSelector({ ...state, specsInitialized: true });
    expect(getSettingsSpecSelector.recomputations()).toBe(1);
    getSettingsSpecSelector({ ...state, parentDimensions: { width: 100, height: 100, top: 100, left: 100 } });
    expect(getSettingsSpecSelector.recomputations()).toBe(1);
  });
  it('shall return new settings if settings changed', () => {
    const updatedSettings = {
      ...DEFAULT_SETTINGS_SPEC,
      rotation: 90,
    };
    const updatedState = {
      ...state,
      specs: {
        [DEFAULT_SETTINGS_SPEC.id]: updatedSettings,
      },
    };
    const settingsSpecToCheck = getSettingsSpecSelector(updatedState);
    expect(settingsSpecToCheck).toBe(updatedSettings);
    expect(getSettingsSpecSelector.recomputations()).toBe(2);
    getSettingsSpecSelector(updatedState);
    expect(getSettingsSpecSelector.recomputations()).toBe(2);
  });
});
