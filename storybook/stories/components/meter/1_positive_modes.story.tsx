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

import { MeterPreview, StoryShell, positivePalette } from './meter_story_helpers';
import { useBaseTheme } from '../../../use_base_theme';

const generalGroup = 'General';
const colorsGroup = 'Colors';
const paletteGroup = 'Palette';

export const Example = () => {
  const baseTheme = useBaseTheme();
  const value = number('Value', 58, { range: true, min: 0, max: 100, step: 1 }, generalGroup);
  const size = select(
    'Size',
    { Small: MeterSize.Small, Medium: MeterSize.Medium, Large: MeterSize.Large },
    MeterSize.Medium,
    generalGroup,
  ) as MeterSize;
  const barWidth = number('Bar width', 320, { min: 240, max: 480, step: 10 }, generalGroup);
  const fillBorderWidth = number('Fill border width', 2, { min: 0, max: 6, step: 1 }, generalGroup);
  const roundTrackStart = boolean('Round track start', true, generalGroup);
  const roundTrackEnd = boolean('Round track end', true, generalGroup);
  const roundFillStart = boolean('Round fill start', true, generalGroup);
  const roundFillEnd = boolean('Round fill end', true, generalGroup);

  const trackColor = color('Track color', baseTheme.metric.barBackground, colorsGroup);
  const fillBorderColor = color('Fill border color', baseTheme.background.color ?? '#FFFFFF', colorsGroup);
  const singleColor = color('Single fill color', '#3185FC', colorsGroup);

  const firstStopColor = color('Palette stop 1 color', positivePalette[0].color, paletteGroup);
  const secondStopColor = color('Palette stop 2 color', positivePalette[1].color, paletteGroup);
  const thirdStopColor = color('Palette stop 3 color', positivePalette[2].color, paletteGroup);
  const paletteStops = [
    { stop: positivePalette[0].stop, color: firstStopColor },
    { stop: positivePalette[1].stop, color: secondStopColor },
    { stop: positivePalette[2].stop, color: thirdStopColor },
  ];
  const label = `${Math.round(value)}%`;

  return (
    <StoryShell>
      <MeterPreview
        title="Single fill"
        label={label}
        value={value}
        domain={[0, 100]}
        fill={{ type: 'single', color: singleColor }}
        size={size}
        barWidth={barWidth}
        trackColor={trackColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        roundTrackStart={roundTrackStart}
        roundTrackEnd={roundTrackEnd}
        roundFillStart={roundFillStart}
        roundFillEnd={roundFillEnd}
      />
      <MeterPreview
        title="Solid palette fill"
        label={label}
        value={value}
        domain={[0, 100]}
        fill={{ type: 'palette', style: MeterFillStyle.Solid, colorStops: paletteStops }}
        size={size}
        barWidth={barWidth}
        trackColor={trackColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
        roundTrackStart={roundTrackStart}
        roundTrackEnd={roundTrackEnd}
        roundFillStart={roundFillStart}
        roundFillEnd={roundFillEnd}
      />
      <MeterPreview
        title="Gradient palette fill"
        label={label}
        value={value}
        domain={[0, 100]}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: paletteStops }}
        size={size}
        barWidth={barWidth}
        trackColor={trackColor}
        fillBorderColor={fillBorderColor}
        fillBorderWidth={fillBorderWidth}
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
    'Shows the public `Meter` surface covering the Lens progress styles for single-color, solid palette, and gradient palette fills.',
};
