/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMetricTextPartDimensions, getSnappedFontSizes } from './text_measurements';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { MetricWNumber } from '../../specs';

const datum: MetricWNumber = {
  color: '#000',
  title: 'Revenue',
  value: 42,
  valueFormatter: (value) => `${value}`,
};

const largeSpacingStyle = {
  ...LIGHT_THEME.metric,
  spacing: 'large' as const,
};

const getHeightBasedSizes = (height: number) =>
  getMetricTextPartDimensions(datum, { width: 320, height }, largeSpacingStyle, 'en').heightBasedSizes;

describe('metric text measurements', () => {
  it('uses the updated large spacing title and value sizes across height breakpoints', () => {
    expect(getHeightBasedSizes(150)).toMatchObject({ titleFontSize: 16, valueFontSize: 50 });
    expect(getHeightBasedSizes(250)).toMatchObject({ titleFontSize: 20, valueFontSize: 64 });
    expect(getHeightBasedSizes(350)).toMatchObject({ titleFontSize: 24, valueFontSize: 84 });
    expect(getHeightBasedSizes(450)).toMatchObject({ titleFontSize: 28, valueFontSize: 120 });
    expect(getHeightBasedSizes(550)).toMatchObject({ titleFontSize: 32, valueFontSize: 156 });
    expect(getHeightBasedSizes(650)).toMatchObject({ titleFontSize: 42, valueFontSize: 156 });
  });

  it('snaps large spacing values to the updated smaller breakpoint sizes', () => {
    expect(getSnappedFontSizes(40, 350, largeSpacingStyle)).toEqual({
      valueFontSize: 38,
      valuePartFontSize: 29,
    });

    expect(getSnappedFontSizes(30, 350, largeSpacingStyle)).toEqual({
      valueFontSize: 24,
      valuePartFontSize: 18,
    });
  });
});
