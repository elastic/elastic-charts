/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mergePartial } from '../../utils/common';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { PartialTheme, Theme } from '../../utils/themes/theme';
import { createCustomCachedSelector } from '../create_selector';
import { getSettingsSpecSelector } from './get_settings_specs';

/** @internal */
export const getChartThemeSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  (settingsSpec): Theme => getTheme(settingsSpec.baseTheme, settingsSpec.theme),
);

function getTheme(baseTheme?: Theme, theme?: PartialTheme | PartialTheme[]): Theme {
  const base = baseTheme ?? LIGHT_THEME;

  if (Array.isArray(theme)) {
    const [firstTheme, ...axillaryThemes] = theme;
    return mergePartial(base, firstTheme, {}, axillaryThemes);
  }

  return theme ? mergePartial(base, theme) : base;
}
