/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isDraft, produce } from 'immer';

import { getSettingsSpecSelector } from './get_settings_spec';
import { colorToRgba, overrideOpacity, RGBATupleToString } from '../../common/color_library_wrappers';
import { clamp, mergePartial } from '../../utils/common';
import { Logger } from '../../utils/logger';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import type { PartialTheme, Theme } from '../../utils/themes/theme';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getChartThemeSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  (settingsSpec): Theme => getTheme(settingsSpec.baseTheme, settingsSpec.theme),
);

function getTheme(baseTheme?: Theme, theme?: PartialTheme | PartialTheme[]): Theme {
  const base = baseTheme ?? LIGHT_THEME;

  if (Array.isArray(theme)) {
    const [firstTheme, ...axillaryThemes] = theme;
    return validateTheme(mergePartial(base, firstTheme, {}, axillaryThemes));
  }

  return validateTheme(theme ? mergePartial(base, theme) : base);
}

/**
 * Validation for final theme object used throughout charts
 *
 * Note: mutates theme in place when called within an immer draft,
 * otherwise uses produce() for immutable updates.
 */
function validateTheme(theme: Theme): Theme {
  // When already inside an immer draft (e.g. called from a selector invoked within
  // an RTK reducer), mutate directly — nested produce() on draft data is unsupported.
  if (isDraft(theme)) {
    applyThemeValidation(theme);
    return theme;
  }
  return produce(theme, applyThemeValidation);
}

function applyThemeValidation(draft: Theme): void {
  const fallbackRGBA = colorToRgba(draft.background.fallbackColor);
  if (fallbackRGBA[3] !== 1) {
    Logger.warn(`background.fallbackColor must be opaque, found alpha of ${fallbackRGBA[3]}. Overriding alpha to 1.`);
    const newFallback = overrideOpacity(fallbackRGBA, 1);
    draft.background.fallbackColor = RGBATupleToString(newFallback);
  }

  // heatmap rotation constraint:
  draft.heatmap.xAxisLabel.rotation = clamp(draft.heatmap.xAxisLabel.rotation, 0, 90);
}
