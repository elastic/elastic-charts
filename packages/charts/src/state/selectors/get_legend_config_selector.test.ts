/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLegendConfigSelector } from './get_legend_config_selector';
import { DEFAULT_SETTINGS_SPEC } from '../../specs/default_settings_spec';
import { getInitialState } from '../get_initial_state';

describe('selectors - getLegendConfigSelector', () => {
  it('should return undefined for showLegendActionAlways by default', () => {
    const state = getInitialState('chartId1');
    const legendConfig = getLegendConfigSelector(state);
    expect(legendConfig.showLegendActionAlways).toBeUndefined();
  });

  it('should return the updated legend config with showLegendActionAlways', () => {
    const state = getInitialState('chartId1');
    const updatedSettings = {
      ...DEFAULT_SETTINGS_SPEC,
      showLegendActionAlways: true,
    };
    state.specs[DEFAULT_SETTINGS_SPEC.id] = updatedSettings;

    const legendConfig = getLegendConfigSelector(state);
    expect(legendConfig.showLegendActionAlways).toBe(true);
  });
});
