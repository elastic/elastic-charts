/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { debounce } from 'ts-debounce';

import { ChartType } from '../../chart_types';
import { SpecType, DEFAULT_SETTINGS_SPEC } from '../../specs/constants';
import { SettingsSpec } from '../../specs/settings';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils';

const DEFAULT_POINTER_UPDATE_DEBOUNCE = 16;

/** @internal */
export const getSpecs = (state: GlobalChartState) => state.specs;

/**
 * @internal
 */
export const getSettingsSpecSelector = createCustomCachedSelector([getSpecs], (specs): SettingsSpec => {
  const settingsSpecs = getSpecsFromStore<SettingsSpec>(specs, ChartType.Global, SpecType.Settings);
  if (settingsSpecs.length === 1) {
    return handleListenerDebouncing(settingsSpecs[0]);
  }
  return DEFAULT_SETTINGS_SPEC;
});

function handleListenerDebouncing(settings: SettingsSpec): SettingsSpec {
  const delay = settings.pointerUpdateDebounce ?? DEFAULT_POINTER_UPDATE_DEBOUNCE;

  if (settings.onPointerUpdate) settings.onPointerUpdate = debounce(settings.onPointerUpdate, delay);

  return settings;
}
