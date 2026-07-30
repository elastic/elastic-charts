/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMinimumMetricHeight } from './text_measurements';
import { AMSTERDAM_DARK_THEME } from '../../../../utils/themes/amsterdam_dark_theme';
import { AMSTERDAM_LIGHT_THEME } from '../../../../utils/themes/amsterdam_light_theme';
import { DARK_THEME } from '../../../../utils/themes/dark_theme';
import { LEGACY_DARK_THEME } from '../../../../utils/themes/legacy_dark_theme';
import { LEGACY_LIGHT_THEME } from '../../../../utils/themes/legacy_light_theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { MetricStyle, Theme } from '../../../../utils/themes/theme';

const THEMES: Array<[string, Theme]> = [
  ['LIGHT_THEME', LIGHT_THEME],
  ['DARK_THEME', DARK_THEME],
  ['AMSTERDAM_LIGHT_THEME', AMSTERDAM_LIGHT_THEME],
  ['AMSTERDAM_DARK_THEME', AMSTERDAM_DARK_THEME],
  ['LEGACY_LIGHT_THEME', LEGACY_LIGHT_THEME],
  ['LEGACY_DARK_THEME', LEGACY_DARK_THEME],
];

const SPACINGS: Array<MetricStyle['spacing']> = ['small', 'large'];

const CASES: Array<[string, MetricStyle['spacing'], Theme]> = THEMES.flatMap(([name, theme]) =>
  SPACINGS.map((spacing): [string, MetricStyle['spacing'], Theme] => [name, spacing, theme]),
);

describe('getMinimumMetricHeight', () => {
  // Guards against regressions: the static theme minHeight must always be
  // large enough to render the smallest supported breakpoint's value + title without clipping
  it.each(CASES)('theme minHeight avoids clipping for %s (%s spacing)', (_name, spacing, theme) => {
    const style: MetricStyle = { ...theme.metric, spacing };
    expect(theme.metric.minHeight).toBeGreaterThanOrEqual(getMinimumMetricHeight(style));
  });
});
