/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EUI_CHARTS_THEME_DARK, EUI_CHARTS_THEME_LIGHT } from '@elastic/eui/dist/eui_charts_theme';
import { createContext, useContext } from 'react';
import { $Values } from 'utility-types';

import { Theme, LIGHT_THEME, DARK_THEME } from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';

/**
 * Available themes
 * @internal
 */
export const ThemeName = Object.freeze({
  Light: 'Light' as const,
  Dark: 'Dark' as const,
  EUILight: 'EUI Light' as const,
  EUIDark: 'EUI Dark' as const,
});
/** @internal */
export type ThemeName = $Values<typeof ThemeName>;

const ThemeContext = createContext<ThemeName>(ThemeName.Light);
const BackgroundContext = createContext<string | undefined>(undefined);

export const ThemeProvider = ThemeContext.Provider;
export const BackgroundProvider = BackgroundContext.Provider;

const themeMap = {
  [ThemeName.Light]: LIGHT_THEME,
  [ThemeName.Dark]: DARK_THEME,
  [ThemeName.EUILight]: mergePartial(LIGHT_THEME, EUI_CHARTS_THEME_LIGHT.theme, { mergeOptionalPartialValues: true }),
  [ThemeName.EUIDark]: mergePartial(DARK_THEME, EUI_CHARTS_THEME_DARK.theme, { mergeOptionalPartialValues: true }),
};

export const useBaseTheme = (): Theme => {
  const themeName = useContext(ThemeContext);
  const background = useContext(BackgroundContext);

  return background
    ? mergePartial(
        themeMap[themeName],
        {
          background: {
            color: background,
          },
        },
        { mergeOptionalPartialValues: true },
      )
    : themeMap[themeName];
};
