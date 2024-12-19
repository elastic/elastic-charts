/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DARK_THEME } from './dark_theme';
import { LIGHT_THEME } from './light_theme';
import { Theme } from './theme';
import { mergePartial } from '../common';

const lightBackground = '#FFFFFF'; // euiColorEmptyShade
const darkBackground = '#0B1628'; // euiColorEmptyShade

const BOREALIS_LIGHT_THEME = mergePartial(LIGHT_THEME, {
  background: {
    color: lightBackground,
    fallbackColor: lightBackground,
  },
});
const BOREALIS_DARK_THEME = mergePartial(DARK_THEME, {
  background: {
    color: darkBackground,
    fallbackColor: darkBackground,
  },
});

/**
 * Returns charts `Theme` given theme `name` and `darkMode`
 * @public
 */
export function getChartsTheme({ name, darkMode }: { name: string; darkMode: boolean }): Theme;
/**
 * Returns charts `Theme` given theme `themeName` and `colorMode`
 * @public
 */
export function getChartsTheme(themeName: string, colorMode: 'DARK' | 'LIGHT'): Theme;
/**
 * Returns charts `Theme`
 * @public
 */
export function getChartsTheme(
  theme: { name: string; darkMode: boolean } | string,
  colorMode?: 'DARK' | 'LIGHT',
): Theme {
  const { name, darkMode } = typeof theme !== 'string' ? theme : { name: theme, darkMode: colorMode === 'DARK' };
  if (name !== 'amsterdam' && name !== 'EUI_THEME_AMSTERDAM')
    return darkMode ? BOREALIS_DARK_THEME : BOREALIS_LIGHT_THEME;
  return darkMode ? DARK_THEME : LIGHT_THEME;
}
