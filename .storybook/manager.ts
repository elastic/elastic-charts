/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Detect system theme preference
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Create themes for both light and dark
const lightTheme = create({
  base: 'light',
  brandTitle: 'Elastic Charts',
  brandUrl: 'https://github.com/elastic/elastic-charts',
  brandImage: 'logo-name.svg',
});

const darkTheme = create({
  base: 'dark',
  brandTitle: 'Elastic Charts',
  brandUrl: 'https://github.com/elastic/elastic-charts',
  brandImage: 'logo-name.svg',
});

// Set initial theme
addons.setConfig({
  theme: getSystemTheme() === 'dark' ? darkTheme : lightTheme,
});

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleThemeChange = (e: MediaQueryListEvent) => {
    addons.setConfig({
      theme: e.matches ? darkTheme : lightTheme,
    });
  };

  mediaQuery.addEventListener('change', handleThemeChange);
}
