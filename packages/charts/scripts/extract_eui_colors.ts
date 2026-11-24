/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { euiThemeBorealis } from '@elastic/eui-theme-borealis';
// The package's `./lib/*` export maps paths verbatim, so the extension is required.
// eslint-disable-next-line import/extensions
import { SEMANTIC_COLORS } from '@elastic/eui-theme-borealis/lib/cjs/variables/colors/_semantic_colors.js';

type ModeColors = typeof euiThemeBorealis.colors.LIGHT;
type VisColorKey = keyof ModeColors['vis'];

const SEMANTIC_TOKENS = [
  'plainLight',
  'plainDark',
  'shade15',
  'shade20',
  'shade30',
  'shade60',
  'shade70',
  'shade80',
  'shade90',
  'shade95',
  'shade100',
  'shade110',
  'shade120',
  'shade130',
  'shade140',
  'shade145',
  'primary30',
  'primary60',
  'primary90',
  'primary100',
  'primary120',
  'accent60',
  'accent90',
] satisfies (keyof typeof SEMANTIC_COLORS)[];

const MODE_TOKEN_GROUPS = {
  text: ['textParagraph', 'textHeading', 'textSubdued', 'textDisabled', 'textInverse'],
  border: ['borderBaseSubdued', 'borderBasePlain', 'borderBasePrimary', 'borderStrongPrimary'],
  background: [
    'backgroundBasePlain',
    'backgroundBaseDisabled',
    'backgroundBaseInteractiveHover',
    'backgroundFilledPrimary',
    'backgroundFilledText',
    'backgroundFilledAccent',
  ],
} satisfies Record<string, (keyof ModeColors)[]>;

const SEVERITY_TOKENS = [
  'unknown',
  'neutral',
  'success',
  'warning',
  'risk',
  'danger',
] satisfies (keyof ModeColors['severity'])[];

const VIS_COLOR_COUNT = 10;

function pick<T extends object, K extends keyof T>(source: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>;
}

function getVisColors(vis: ModeColors['vis']): string[] {
  return Array.from({ length: VIS_COLOR_COUNT }, (_, i) => {
    const value = vis[`euiColorVis${i}` as VisColorKey];
    if (typeof value !== 'string') {
      throw new TypeError(`Token "euiColorVis${i}" not found in EUI vis colors`);
    }
    return value;
  });
}

function getModeColors(colors: ModeColors) {
  return {
    text: pick(colors, MODE_TOKEN_GROUPS.text),
    border: pick(colors, MODE_TOKEN_GROUPS.border),
    background: pick(colors, MODE_TOKEN_GROUPS.background),
    severity: pick(colors.severity, SEVERITY_TOKENS),
    vis: getVisColors(colors.vis),
  };
}

export function extractEuiColors(): Record<string, unknown> {
  const { LIGHT, DARK } = euiThemeBorealis.colors;
  return {
    EUI_SEMANTIC_COLORS: pick(SEMANTIC_COLORS, SEMANTIC_TOKENS),
    EUI_LIGHT: getModeColors(LIGHT),
    EUI_DARK: getModeColors(DARK),
  };
}
