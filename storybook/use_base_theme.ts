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

import { Theme, LIGHT_THEME, DARK_THEME, DEFAULT_CHART_MARGINS } from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';

import { storybookParameters } from './parameters';

/**
 * Available themes
 * @internal
 */
export const ThemeId = Object.freeze({
  Light: 'light' as const,
  Dark: 'dark' as const,
});
/** @internal */
export type ThemeId = $Values<typeof ThemeId>;

const ThemeContext = createContext<ThemeId>(ThemeId.Light);
const BackgroundContext = createContext<string | undefined>(undefined);

export const ThemeIdProvider = ThemeContext.Provider;
export const BackgroundIdProvider = BackgroundContext.Provider;

const themeMap = {
  [ThemeId.Light]: mergePartial(LIGHT_THEME, EUI_CHARTS_THEME_LIGHT.theme),
  [ThemeId.Dark]: mergePartial(DARK_THEME, EUI_CHARTS_THEME_DARK.theme),
};

const getBackground = (backgroundId?: string) => {
  if (!backgroundId) {
    return undefined;
  }
  const option = (storybookParameters?.background?.options ?? []).find(({ id }) => id === backgroundId);
  return option?.background ?? option?.color;
};

export const useBaseTheme = (): Theme => {
  const themeId = useContext(ThemeContext);
  const backgroundId = useContext(BackgroundContext);
  const theme = themeMap[themeId] ?? LIGHT_THEME;
  const backgroundColor = getBackground(backgroundId);

  return mergePartial(theme, {
    // eui chart theme has no margin for some reason. This is just for consistency.
    chartMargins: DEFAULT_CHART_MARGINS,
    background: { color: backgroundColor },
  });
};
