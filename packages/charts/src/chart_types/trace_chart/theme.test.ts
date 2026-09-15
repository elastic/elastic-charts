/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildTraceStyle } from './theme';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import type { Theme } from '../../utils/themes/theme';

function themeWithTrace(overrides: Partial<Theme['trace']>): Theme {
  return { ...LIGHT_THEME, trace: { ...LIGHT_THEME.trace, ...overrides } };
}

describe('buildTraceStyle — derived lane height for inline labels', () => {
  it('leaves laneHeight untouched in gutter mode (the default)', () => {
    const style = buildTraceStyle(themeWithTrace({ labelPosition: 'gutter', laneHeight: 24 }));
    expect(style.laneHeight).toBe(24);
  });

  it('leaves laneHeight untouched in none mode', () => {
    const style = buildTraceStyle(themeWithTrace({ labelPosition: 'none', laneHeight: 24 }));
    expect(style.laneHeight).toBe(24);
  });

  it('lifts a too-short laneHeight to the inline minimum in inline mode', () => {
    const style = buildTraceStyle(themeWithTrace({ labelPosition: 'inline', laneHeight: 24 }));
    expect(style.laneHeight).toBe(40);
  });

  it('keeps an explicit taller laneHeight in inline mode (floor, not cap)', () => {
    const style = buildTraceStyle(themeWithTrace({ labelPosition: 'inline', laneHeight: 60 }));
    expect(style.laneHeight).toBe(60);
  });
});
