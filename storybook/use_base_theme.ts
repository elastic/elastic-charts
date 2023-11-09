/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createContext, useContext } from 'react';
import { $Values } from 'utility-types';

import {
  Theme,
  LIGHT_THEME,
  DARK_THEME,
  LEGACY_CHART_MARGINS,
  LEGACY_DARK_THEME,
  LEGACY_LIGHT_THEME,
} from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';

import { storybookParameters } from './parameters';

/**
 * Available themes
 * @internal
 */
export const ThemeId = Object.freeze({
  Light: 'light' as const,
  Dark: 'dark' as const,
  // TODO remove legacy themes
  LegacyLight: 'legacy-light' as const,
  LegacyDark: 'legacy-dark' as const,
});
/** @internal */
export type ThemeId = $Values<typeof ThemeId>;

const ThemeContext = createContext<ThemeId>(ThemeId.Light);
const BackgroundContext = createContext<string | undefined>(undefined);

export const ThemeIdProvider = ThemeContext.Provider;
export const BackgroundIdProvider = BackgroundContext.Provider;

const themeMap = {
  [ThemeId.Light]: LIGHT_THEME,
  [ThemeId.Dark]: DARK_THEME,
  [ThemeId.LegacyLight]: LEGACY_LIGHT_THEME,
  [ThemeId.LegacyDark]: LEGACY_DARK_THEME,
};

const getBackground = (backgroundId?: string) => {
  if (!backgroundId) {
    return undefined;
  }
  const option = (storybookParameters?.background?.options ?? []).find(({ id }) => id === backgroundId);
  return option?.background ?? option?.color;
};

export const useThemeId = (): ThemeId => {
  return useContext(ThemeContext);
};

export const useBaseTheme = (): Theme => {
  const themeId = useThemeId();
  const backgroundId = useContext(BackgroundContext);
  const theme = themeMap[themeId] ?? LIGHT_THEME;
  const backgroundColor = getBackground(backgroundId);

  return mergePartial(theme, {
    // Keep this just for consistency for the first pass of theme changes
    chartMargins: LEGACY_CHART_MARGINS,
    background: { color: backgroundColor },
  });
};
