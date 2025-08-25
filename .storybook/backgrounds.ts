/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import euiBorealisDarkVars from '@elastic/eui-theme-borealis/lib/eui_theme_borealis_dark.json';
import euiBorealisLightVars from '@elastic/eui-theme-borealis/lib/eui_theme_borealis_light.json';

interface BackgroundsOption {
  name: string;
  value: string;
}
type BackgroundsOptions =  Record<string, BackgroundsOption>

export const backgroundsOptions = {
  emptyShadeDark: { name: 'Empty Shade - Dark', value: euiBorealisDarkVars.euiColorEmptyShade },
  emptyShadeLight: { name: 'Empty Shade - Light', value: euiBorealisLightVars.euiColorEmptyShade },
  black: { name: 'Black', value: '#000' },
  white: { name: 'White', value: '#fff' },
  red: { name: 'Red', value: '#f04d9a' },
  blue: { name: 'Blue', value: '#14abf5' },
  yellow: { name: 'Yellow', value: '#fec709' },
  green: { name: 'Green', value: '#00c1b4' },
  gray: { name: 'Gray', value: 'rgb(237, 240, 245)' },
} satisfies BackgroundsOptions

export type BackgroundKey = keyof (typeof backgroundsOptions);
