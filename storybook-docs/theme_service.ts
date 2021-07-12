/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-ignore
import themeDark from '../packages/charts/src/theme_dark.scss?lazy';
// @ts-ignore
import themeLight from '../packages/charts/src/theme_light.scss?lazy';

export function switchTheme(theme: string) {
  switch (theme) {
    case 'light':
      themeDark.unuse();
      themeLight.use();
      return;
    case 'dark':
    default:
      themeLight.unuse();
      themeDark.use();
  }
}
