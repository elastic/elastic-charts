/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

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
 * Validates and returns a corrected copy of the theme object.
 */
function validateTheme(theme: Theme): Theme {
  const fallbackRGBA = colorToRgba(theme.background.fallbackColor);
  const needsFallbackFix = fallbackRGBA[3] !== 1;

  const clampedRotation = clamp(theme.heatmap.xAxisLabel.rotation, 0, 90);
  const needsRotationFix = clampedRotation !== theme.heatmap.xAxisLabel.rotation;

  if (!needsFallbackFix && !needsRotationFix) return theme;

  if (needsFallbackFix) {
    Logger.warn(`background.fallbackColor must be opaque, found alpha of ${fallbackRGBA[3]}. Overriding alpha to 1.`);
  }

  return {
    ...theme,
    ...(needsFallbackFix && {
      background: { ...theme.background, fallbackColor: RGBATupleToString(overrideOpacity(fallbackRGBA, 1)) },
    }),
    ...(needsRotationFix && {
      heatmap: { ...theme.heatmap, xAxisLabel: { ...theme.heatmap.xAxisLabel, rotation: clampedRotation } },
    }),
  };
}
