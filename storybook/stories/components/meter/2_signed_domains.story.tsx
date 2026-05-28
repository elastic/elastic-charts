/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { MeterFillStyle, MeterSize } from '@elastic/charts';

import { MeterPreview, StoryShell, signedPalette } from './meter_story_helpers';
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
  const negativeOnlyValue = number(
    'Negative-only value',
    -35,
    { range: true, min: -100, max: 0, step: 1 },
    generalGroup,
  );
  const mixedNegativeValue = number(
    'Mixed-sign negative value',
    -35,
    { range: true, min: -100, max: 40, step: 1 },
    generalGroup,
  );
  const mixedPositiveValue = number(
    'Mixed-sign positive value',
    25,
    { range: true, min: -100, max: 40, step: 1 },
    generalGroup,
  );
  const size = select(
    'Size',
    { Small: MeterSize.Small, Medium: MeterSize.Medium, Large: MeterSize.Large },
    MeterSize.Medium,
    generalGroup,
  ) as MeterSize;
  const baseline = number('Baseline', 0, { range: true, min: -100, max: 40, step: 1 }, generalGroup);
  const barWidth = number('Bar width', 320, { min: 240, max: 480, step: 10 }, generalGroup);
  const fillBorderWidth = number('Fill border width', 2, { min: 0, max: 6, step: 1 }, generalGroup);
  const showBaselineMarker = boolean('Show baseline marker', false, generalGroup);
  const roundTrackStart = boolean('Round track start', true, generalGroup);
  const roundTrackEnd = boolean('Round track end', true, generalGroup);
  const roundFillStart = boolean('Round fill start', true, generalGroup);
  const roundFillEnd = boolean('Round fill end', true, generalGroup);

  const trackColor = color('Track color', baseTheme.metric.barBackground, colorsGroup);
  const markerColor = color('Marker color', readableMarkerColor, colorsGroup);
  const fillBorderColor = color('Fill border color', baseTheme.background.color ?? '#FFFFFF', colorsGroup);

  const negativeStopColor = color('Negative stop color', signedPalette[0].color, paletteGroup);
  const zeroStopColor = color('Zero stop color', signedPalette[1].color, paletteGroup);
  const positiveStopColor = color('Positive stop color', signedPalette[2].color, paletteGroup);
  const paletteStops = [
    { stop: signedPalette[0].stop, color: negativeStopColor },
    { stop: signedPalette[1].stop, color: zeroStopColor },
    { stop: signedPalette[2].stop, color: positiveStopColor },
  ];

  return (
    <StoryShell>
      <MeterPreview
        title={`Negative-only domain (${formatSignedValue(negativeOnlyValue)})`}
        label={formatSignedValue(negativeOnlyValue)}
        value={negativeOnlyValue}
        domain={[-100, 0]}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: paletteStops }}
        showLabel={false}
        size={size}
        barWidth={barWidth}
        baseline={baseline}
        trackColor={trackColor}
        markerColor={markerColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        showBaselineMarker={showBaselineMarker}
        roundTrackStart={roundTrackStart}
        roundTrackEnd={roundTrackEnd}
        roundFillStart={roundFillStart}
        roundFillEnd={roundFillEnd}
      />
      <MeterPreview
        title={`Mixed-sign negative value (${formatSignedValue(mixedNegativeValue)})`}
        label={formatSignedValue(mixedNegativeValue)}
        value={mixedNegativeValue}
        domain={[-100, 40]}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: paletteStops }}
        showLabel={false}
        size={size}
        barWidth={barWidth}
        baseline={baseline}
        trackColor={trackColor}
        markerColor={markerColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        showBaselineMarker={showBaselineMarker}
        roundTrackStart={roundTrackStart}
        roundTrackEnd={roundTrackEnd}
        roundFillStart={roundFillStart}
        roundFillEnd={roundFillEnd}
      />
      <MeterPreview
        title={`Mixed-sign positive value (${formatSignedValue(mixedPositiveValue)})`}
        label={formatSignedValue(mixedPositiveValue)}
        value={mixedPositiveValue}
        domain={[-100, 40]}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: paletteStops }}
        showLabel={false}
        size={size}
        barWidth={barWidth}
        baseline={baseline}
        trackColor={trackColor}
        markerColor={markerColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        showBaselineMarker={showBaselineMarker}
        roundTrackStart={roundTrackStart}
        roundTrackEnd={roundTrackEnd}
        roundFillStart={roundFillStart}
        roundFillEnd={roundFillEnd}
      />
    </StoryShell>
  );
};

Example.parameters = {
  showHeader: true,
  markdown:
    'Shows signed-domain behavior where negative-only meters grow from the right edge and mixed-sign meters anchor their fill at the configured baseline.',
};
