/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { MeterFillStyle } from '@elastic/charts';

import { MeterPreview, StoryShell, positivePalette } from './meter_story_helpers';

export const Example = () => (
  <StoryShell>
    <MeterPreview
      title="Single fill"
      label="58%"
      value={58}
      domain={[0, 100]}
      fill={{ type: 'single', color: '#3185FC' }}
    />
    <MeterPreview
      title="Solid palette fill"
      label="58%"
      value={58}
      domain={[0, 100]}
      fill={{ type: 'palette', style: MeterFillStyle.Solid, colorStops: positivePalette }}
    />
    <MeterPreview
      title="Gradient palette fill"
      label="58%"
      value={58}
      domain={[0, 100]}
      fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: positivePalette }}
    />
  </StoryShell>
);

Example.parameters = {
  showHeader: true,
  markdown:
    'Shows the public `Meter` surface covering the Lens progress styles for single-color, solid palette, and gradient palette fills.',
};
