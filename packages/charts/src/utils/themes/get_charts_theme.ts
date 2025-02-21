/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AMSTERDAM_DARK_THEME } from './amsterdam_dark_theme';
import { AMSTERDAM_LIGHT_THEME } from './amsterdam_light_theme';
import { DARK_THEME } from './dark_theme';
import { LIGHT_THEME } from './light_theme';
import type { Theme } from './theme';

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
  if (name.toLowerCase().includes('amsterdam')) return darkMode ? AMSTERDAM_DARK_THEME : AMSTERDAM_LIGHT_THEME;
  return darkMode ? DARK_THEME : LIGHT_THEME;
}
