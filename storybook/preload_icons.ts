/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-ignore - no type declarations
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

/**
 * Loads nessecery icons to prevent loading vrt diff
 *
 * https://github.com/elastic/eui/blob/b2ffddee61913202224f2967599436ca95265879/src-docs/src/views/guidelines/getting_started.md#failing-icon-imports
 */
export const preloadIcons = () => {
  /* eslint-disable global-require, @typescript-eslint/no-var-requires */

  /*
   * See icon file name/path map
   * https://github.com/elastic/eui/blob/b2ffddee61913202224f2967599436ca95265879/src/components/icon/icon.tsx#L39
   */
  appendIconComponentCache({
    arrowUp: require('@elastic/eui/es/components/icon/assets/arrow_up').icon,
    arrowLeft: require('@elastic/eui/es/components/icon/assets/arrow_left').icon,
    arrowDown: require('@elastic/eui/es/components/icon/assets/arrow_down').icon,
    arrowRight: require('@elastic/eui/es/components/icon/assets/arrow_right').icon,
    iInCircle: require('@elastic/eui/es/components/icon/assets/iInCircle').icon,
    tokenKey: require('@elastic/eui/es/components/icon/assets/tokens/tokenKey').icon,
    filter: require('@elastic/eui/es/components/icon/assets/filter').icon,
    starFilled: require('@elastic/eui/es/components/icon/assets/star_filled').icon,
    pencil: require('@elastic/eui/es/components/icon/assets/pencil').icon,
    visualizeApp: require('@elastic/eui/es/components/icon/assets/app_visualize').icon,
  });

  /* eslint-enable global-require, @typescript-eslint/no-var-requires */
};
