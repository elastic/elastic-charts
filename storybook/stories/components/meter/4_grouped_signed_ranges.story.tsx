/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiDualRange } from '@elastic/eui';
import { boolean, color, number, select } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import { Meter, MeterFillStyle, MeterSize } from '@elastic/charts';
import type { MeterFill } from '@elastic/charts';

import { getStandaloneEnumOverride, StoryShell } from './meter_story_helpers';
import { useBaseTheme, useThemeId } from '../../../use_base_theme';

const OUTER_DOMAIN = [-200, 200] as const;
const INNER_DOMAIN = [-100, 100] as const;
const FILL_COLOR = '#6092F9';
const generalGroup = 'General';
const colorsGroup = 'Colors';
const paletteGroup = 'Palette';

export const Example = () => {
  const baseTheme = useBaseTheme();
  const themeId = useThemeId();
  const isDarkTheme = themeId.includes('dark');
  const [range, setRange] = useState<[number, number]>([-50, 50]);

  const panelBackground = isDarkTheme ? '#081121' : baseTheme.background.color ?? '#FFFFFF';
  const panelBorder = isDarkTheme ? '#0F1D33' : '#D3DAE6';
  const sliderTextColor = isDarkTheme ? baseTheme.metric.textLightColor : baseTheme.metric.textDarkColor;
  const knobFillStyle = select(
    'Fill style',
    { Single: MeterFillStyle.Single, Solid: MeterFillStyle.Solid, Gradient: MeterFillStyle.Gradient },
    MeterFillStyle.Single,
    generalGroup,
  ) as MeterFillStyle;
  const fillStyle =
    getStandaloneEnumOverride('fillStyle', Object.values(MeterFillStyle) as MeterFillStyle[]) ?? knobFillStyle;
  const trackColor = color('Track color', isDarkTheme ? '#33425B' : baseTheme.metric.barBackground, colorsGroup);
  const singleFillColor = color('Single fill color', FILL_COLOR, colorsGroup);
  const markerColor = color('Baseline marker color', sliderTextColor, colorsGroup);
  const fillBorderColor = color('Fill border color', panelBackground, colorsGroup);
  const baseline = number('Baseline', 0, { range: true, min: -200, max: 200, step: 1 }, generalGroup);
  const fillBorderWidth = number('Fill border width', 2, { min: 0, max: 6, step: 1 }, generalGroup);
  const showBaselineMarker = boolean('Show baseline marker', false, generalGroup);
  const roundTrackStart = boolean('Round track start', true, generalGroup);
  const roundTrackEnd = boolean('Round track end', true, generalGroup);
  const roundFillStart = boolean('Round fill start', false, generalGroup);
  const roundFillEnd = boolean('Round fill end', true, generalGroup);
  const negativeColor = color('Negative color', '#54B399', paletteGroup);
  const zeroColor = color('Zero color', '#F5A700', paletteGroup);
  const positiveColor = color('Positive color', '#D36086', paletteGroup);
  const [negativeValue, positiveValue] = range;
  const lineWidth = 620;
  const bars = [
    { key: 'positive-outer', domain: OUTER_DOMAIN, value: Math.max(0, positiveValue) },
    { key: 'positive-inner', domain: INNER_DOMAIN, value: Math.max(0, positiveValue) },
    { key: 'negative-inner', domain: INNER_DOMAIN, value: Math.min(0, negativeValue) },
    { key: 'negative-outer', domain: OUTER_DOMAIN, value: Math.min(0, negativeValue) },
  ];

  const getFill = (domain: readonly [number, number]): MeterFill => {
    if (fillStyle === MeterFillStyle.Single) {
      return { type: MeterFillStyle.Single, color: singleFillColor };
    }

    return {
      type: 'palette',
      style: fillStyle,
      colorStops: [
        { stop: domain[0], color: negativeColor },
        { stop: 0, color: zeroColor },
        { stop: domain[1], color: positiveColor },
      ],
    };
  };

  return (
    <StoryShell>
      <div style={{ display: 'grid', gap: 20 }}>
        <div
          style={{
            display: 'grid',
            gap: 12,
            width: lineWidth,
            padding: '24px 20px',
            border: `1px solid ${panelBorder}`,
            borderRadius: 12,
            backgroundColor: panelBackground,
          }}
        >
          {bars.map(({ key, domain, value }) => (
            <Meter
              key={key}
              value={value}
              domain={[domain[0], domain[1]]}
              fill={getFill(domain)}
              trackColor={trackColor}
              baseline={baseline}
              markerColor={markerColor}
              fillBorderColor={fillBorderColor}
              fillBorderWidth={fillBorderWidth}
              size={MeterSize.Large}
              showBaselineMarker={showBaselineMarker}
              roundTrackStart={roundTrackStart}
              roundTrackEnd={roundTrackEnd}
              roundFillStart={roundFillStart}
              roundFillEnd={roundFillEnd}
              ariaLabel={key}
              ariaValueText={`${value}`}
              style={{ width: '100%' }}
            />
          ))}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ color: sliderTextColor, fontSize: 12, fontWeight: 600 }}>
            Shared signed range: {negativeValue} to +{positiveValue}
          </div>
          <EuiDualRange
            min={-200}
            max={200}
            step={1}
            showInput
            value={range}
            onChange={(nextValue) => {
              const [nextNegative, nextPositive] = nextValue.map((value) => Number(value));
              setRange([nextNegative, nextPositive]);
            }}
            minInputProps={{ 'aria-label': 'negative bound' }}
            maxInputProps={{ 'aria-label': 'positive bound' }}
          />
        </div>
      </div>
    </StoryShell>
  );
};

Example.parameters = {
  showHeader: true,
  markdown:
    'Shows a shared signed comparison group where the inner bars saturate at +/-100 and the outer bars saturate at +/-200, with configurable fill, baseline, and rounding controls.',
};
