/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const dragMode = select<'pan' | 'brush'>('drag mode', { pan: 'pan', brush: 'brush' }, 'pan');

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 220 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="trace_brush_zoom" data={CHECKOUT_SPANS} xScaleType="linear" dragMode={dragMode} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `dragMode` prop switches between **pan** and **brush** gestures:\n\n' +
    '- **`pan` (default):** drag pans; **Shift+drag** draws a rubber-band selection → release to zoom.\n' +
    '- **`brush`:** plain drag draws the rubber band; **Shift+drag** pans.\n\n' +
    'A drag narrower than 1 ms is ignored. Dragging past the canvas edge clamps to the reference ' +
    'domain and still zooms on release. Tooltip is suppressed during brushing. ' +
    'Wheel zoom and kinetic-flywheel pan always work in the non-brush gesture.',
};
