/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import { SpecType, DEFAULT_SETTINGS_SPEC } from '../../specs/constants';
import { SettingsSpec } from '../../specs/settings';
import { debounce } from '../../utils/debounce';
import { SpecList } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils';

const DEFAULT_POINTER_UPDATE_DEBOUNCE = 16;

/**
 * @internal
 */
export const getSettingsSpecSelector = createCustomCachedSelector([getSpecs], getSettingsSpec);

function getSettingsSpec(specs: SpecList): SettingsSpec {
  const settingsSpecs = getSpecsFromStore<SettingsSpec>(specs, ChartType.Global, SpecType.Settings);
  const spec = settingsSpecs[0];
  return spec ? handleListenerDebouncing(spec) : DEFAULT_SETTINGS_SPEC;
}

function handleListenerDebouncing(settings: SettingsSpec): SettingsSpec {
  const delay = settings.pointerUpdateDebounce ?? DEFAULT_POINTER_UPDATE_DEBOUNCE;

  if (settings.onPointerUpdate) settings.onPointerUpdate = debounce(settings.onPointerUpdate, delay);

  return settings;
}
