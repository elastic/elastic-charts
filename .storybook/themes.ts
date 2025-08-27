/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ClassNameStrategyConfiguration } from '@storybook/addon-themes';
import { ThemeId } from '@ech/sb';

interface ThemeOptions {
  id: ThemeId;
  title: string;
  class: string;
}

/*
 * These properties are meant to work with `@storybook/addon-themes` in a way similar to our legacy
 * custom `storybook-addon-theme-toggle` addon with better UI that afforded by the simple setup.
 */

export const themeOptions = {
  light: {
    id: ThemeId.Light,
    title: 'Light',
    class: 'light-theme',
  },
  dark: {
    id: ThemeId.Dark,
    title: 'Dark',
    class: 'dark-theme',
  },
  legacyAmsterdamLight: {
    id: ThemeId.LegacyAmsterdamLight,
    title: 'Legacy Amsterdam Light',
    class: 'light-theme legacy amsterdam',
  },
  legacyAmsterdamDark: {
    id: ThemeId.LegacyAmsterdamDark,
    title: 'Legacy Amsterdam Dark',
    class: 'dark-theme legacy amsterdam',
  },
  legacyLight: {
    id: ThemeId.LegacyLight,
    title: 'Legacy Light',
    class: 'light-theme legacy',
  },
  legacyDark: {
    id: ThemeId.LegacyDark,
    title: 'Legacy Dark',
    class: 'dark-theme legacy',
  },
} satisfies Record<string, ThemeOptions>;

const themes: ClassNameStrategyConfiguration['themes'] = Object.fromEntries(Object.entries(themeOptions).map(([, theme]) => [theme.title, theme.class]))

const themeLookupMap = new Map(Object.entries(themeOptions).map(([, { title, id }]) => [title, id]))

type ThemeKey = keyof (typeof themeOptions);

export function getThemeOptions(defaultTheme: ThemeKey): ClassNameStrategyConfiguration {
  return {
    themes,
    defaultTheme: themeOptions[defaultTheme].title,
  }
}

export function getThemeFromTitle(title: string = ''): ThemeId | undefined {
  return themeLookupMap.get(title);
}
