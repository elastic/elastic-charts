/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LayoutDirection, MeterFillStyle, MeterSize } from '@elastic/charts';

import { MeterPreview, StoryShell, positivePalette, signedPalette } from './meter_story_helpers';

export const Example = () => (
  <StoryShell>
    <MeterPreview
      title="Target marker"
      label="72 / target 85"
      value={72}
      target={85}
      domain={[0, 100]}
      fill={{ type: 'single', color: '#3185FC' }}
    />
    <div style={{ display: 'flex', gap: 32 }}>
      <MeterPreview
        title="Vertical gradient"
        label=""
        value={30}
        domain={[0, 100]}
        orientation={LayoutDirection.Vertical}
        size={MeterSize.Large}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: positivePalette }}
      />
      <MeterPreview
        title="Vertical mixed-sign"
        label=""
        value={-35}
        domain={[-100, 40]}
        orientation={LayoutDirection.Vertical}
        size={MeterSize.Large}
        fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: signedPalette }}
      />
    </div>
  </StoryShell>
);

Example.parameters = {
  showHeader: true,
  markdown: 'Shows the optional target marker and the vertical orientation supported by the reusable Meter component.',
};
