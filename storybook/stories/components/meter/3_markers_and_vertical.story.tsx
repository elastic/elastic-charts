/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { LayoutDirection, MeterFillStyle, MeterSize } from '@elastic/charts';

import { MeterPreview, StoryShell, positivePalette, signedPalette } from './meter_story_helpers';
import { useBaseTheme, useThemeId } from '../../../use_base_theme';

const generalGroup = 'General';
const colorsGroup = 'Colors';
const paletteGroup = 'Palette';

const formatSignedValue = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value)}`;

export const Example = () => {
  const baseTheme = useBaseTheme();
  const themeId = useThemeId();
  const isDarkTheme = themeId.includes('dark');
  const readableMarkerColor = isDarkTheme ? baseTheme.metric.textLightColor : baseTheme.metric.textDarkColor;

  const targetValue = number('Target example value', 72, { range: true, min: 0, max: 100, step: 1 }, generalGroup);
  const target = number('Target example target', 85, { range: true, min: 0, max: 100, step: 1 }, generalGroup);
  const verticalValue = number('Vertical gradient value', 30, { range: true, min: 0, max: 100, step: 1 }, generalGroup);
  const verticalMixedValue = number(
    'Vertical mixed-sign value',
    -35,
    { range: true, min: -100, max: 40, step: 1 },
    generalGroup,
  );
  const horizontalWidth = number('Horizontal bar width', 320, { min: 240, max: 480, step: 10 }, generalGroup);
  const verticalHeight = number('Vertical bar height', 160, { min: 120, max: 240, step: 10 }, generalGroup);
  const verticalSize = select(
    'Vertical size',
    { Small: MeterSize.Small, Medium: MeterSize.Medium, Large: MeterSize.Large },
    MeterSize.Large,
    generalGroup,
  ) as MeterSize;
  const mixedBaseline = number('Mixed baseline', 0, { range: true, min: -100, max: 40, step: 1 }, generalGroup);
  const fillBorderWidth = number('Fill border width', 2, { min: 0, max: 6, step: 1 }, generalGroup);
  const showBaselineMarker = boolean('Show baseline marker', false, generalGroup);
  const flatBaselineEdge = boolean('Flat baseline edge', false, generalGroup);
  const roundTrack = boolean('Round track', true, generalGroup);
  const roundFill = boolean('Round fill', true, generalGroup);

  const trackColor = color('Track color', baseTheme.metric.barBackground, colorsGroup);
  const markerColor = color('Marker color', readableMarkerColor, colorsGroup);
  const fillBorderColor = color('Fill border color', baseTheme.background.color ?? '#FFFFFF', colorsGroup);
  const singleColor = color('Single fill color', '#3185FC', colorsGroup);

  const positiveStartColor = color('Positive start color', positivePalette[0].color, paletteGroup);
  const positiveMiddleColor = color('Positive middle color', positivePalette[1].color, paletteGroup);
  const positiveEndColor = color('Positive end color', positivePalette[2].color, paletteGroup);
  const signedNegativeColor = color('Signed negative color', signedPalette[0].color, paletteGroup);
  const signedZeroColor = color('Signed zero color', signedPalette[1].color, paletteGroup);
  const signedPositiveColor = color('Signed positive color', signedPalette[2].color, paletteGroup);

  const positiveStops = [
    { stop: positivePalette[0].stop, color: positiveStartColor },
    { stop: positivePalette[1].stop, color: positiveMiddleColor },
    { stop: positivePalette[2].stop, color: positiveEndColor },
  ];
  const signedStops = [
    { stop: signedPalette[0].stop, color: signedNegativeColor },
    { stop: signedPalette[1].stop, color: signedZeroColor },
    { stop: signedPalette[2].stop, color: signedPositiveColor },
  ];

  return (
    <StoryShell>
      <MeterPreview
        title="Target marker"
        label={`${Math.round(targetValue)} / target ${Math.round(target)}`}
        value={targetValue}
        target={target}
        domain={[0, 100]}
        fill={{ type: 'single', color: singleColor }}
        barWidth={horizontalWidth}
        trackColor={trackColor}
        markerColor={markerColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        roundTrack={roundTrack}
        roundFill={roundFill}
      />
      <div style={{ display: 'flex', gap: 32 }}>
        <MeterPreview
          title="Vertical gradient"
          label={`${Math.round(verticalValue)}%`}
          value={verticalValue}
          domain={[0, 100]}
          orientation={LayoutDirection.Vertical}
          size={verticalSize}
          barHeight={verticalHeight}
          fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: positiveStops }}
          trackColor={trackColor}
          markerColor={markerColor}
          fillBorderColor={fillBorderColor}
          fillBorderWidth={fillBorderWidth}
          roundTrack={roundTrack}
          roundFill={roundFill}
        />
        <MeterPreview
          title="Vertical mixed-sign"
          label={formatSignedValue(verticalMixedValue)}
          value={verticalMixedValue}
          domain={[-100, 40]}
          orientation={LayoutDirection.Vertical}
          size={verticalSize}
          barHeight={verticalHeight}
          fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: signedStops }}
          baseline={mixedBaseline}
          trackColor={trackColor}
          markerColor={markerColor}
          fillBorderColor={fillBorderColor}
          fillBorderWidth={fillBorderWidth}
          showBaselineMarker={showBaselineMarker}
          flatBaselineEdge={flatBaselineEdge}
          roundTrack={roundTrack}
          roundFill={roundFill}
        />
      </div>
    </StoryShell>
  );
};

Example.parameters = {
  showHeader: true,
  markdown:
    'Shows the optional target marker, vertical orientation, and configurable baseline controls supported by the reusable Meter component.',
};
