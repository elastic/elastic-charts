/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { produce } from 'immer';

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import { SettingsSpec } from '../../specs';
import { DEFAULT_SETTINGS_SPEC, settingsBuildProps } from '../../specs/default_settings_spec';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { debounce } from '../../utils/debounce';
import { Logger } from '../../utils/logger';
import { createCustomCachedSelector } from '../create_selector';
import { SpecList } from '../spec_list';
import { getSpecsFromStore } from '../utils/get_specs_from_store';

const DEFAULT_POINTER_UPDATE_DEBOUNCE = 16;

/**
 * @internal
 */
export const getSettingsSpecSelector = createCustomCachedSelector([getSpecs], getSettingsSpec);

function getSettingsSpec(specs: SpecList): SettingsSpec {
  const settingsSpecs = getSpecsFromStore<SettingsSpec>(specs, ChartType.Global, SpecType.Settings);
  const spec = settingsSpecs[0];
  return spec ? validateSpec(spec) : DEFAULT_SETTINGS_SPEC;
}

function validateSpec(spec: SettingsSpec): SettingsSpec {
  return produce(spec, (draft) => {
    const delay = draft.pointerUpdateDebounce ?? DEFAULT_POINTER_UPDATE_DEBOUNCE;

    if (draft.onPointerUpdate) {
      draft.onPointerUpdate = debounce(draft.onPointerUpdate, delay);
    }

    if (draft.dow < 1 || draft.dow > 7 || !Number.isInteger(draft.dow)) {
      Logger.warn(`Settings.dow option must be an integer from 1 to 7, received ${draft.dow}. Using default of 1.`);

      draft.dow = settingsBuildProps.defaults.dow;
    }
  });
}
