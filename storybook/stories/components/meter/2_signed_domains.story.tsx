/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { MeterFillStyle } from '@elastic/charts';

import { MeterPreview, StoryShell, signedPalette } from './meter_story_helpers';

export const Example = () => (
  <StoryShell>
    <MeterPreview
      title="Negative-only domain"
      label="-72"
      value={-72}
      domain={[-100, 0]}
      fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: signedPalette }}
      alignment="left"
    />
    <MeterPreview
      title="Mixed-sign negative value"
      label="-35"
      value={-35}
      domain={[-100, 40]}
      fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: signedPalette }}
      alignment="left"
    />
    <MeterPreview
      title="Mixed-sign positive value"
      label="+25"
      value={25}
      domain={[-100, 40]}
      fill={{ type: 'palette', style: MeterFillStyle.Gradient, colorStops: signedPalette }}
    />
  </StoryShell>
);

Example.parameters = {
  showHeader: true,
  markdown:
    'Shows signed-domain behavior where negative-only meters grow from the right edge and mixed-sign meters anchor their fill at zero.',
};
