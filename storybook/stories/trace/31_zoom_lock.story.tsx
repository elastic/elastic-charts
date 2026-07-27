/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const zoomable = boolean('zoomable', true);

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 220 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="trace_zoom_lock" data={CHECKOUT_SPANS} xScaleType="linear" zoomable={zoomable} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `zoomable` prop locks the zoom level. With **`zoomable={false}`** every zoom gesture is ' +
    'disabled:\n\n' +
    '- mouse **wheel** is a no-op,\n' +
    '- the **`+` / `=` / `-`** keys no-op (Arrow-key pan still works),\n' +
    '- two-finger **pinch** no-ops (one-finger touch pan still works),\n' +
    '- a **drag** pans instead of drawing the brush rubber-band, for every `dragMode`/modifier.\n\n' +
    'Panning, selection, tooltip, and collapse all remain active. The lock targets user gestures ' +
    'only — a programmatic `focusDomain` still re-drives the visible window, zoom level included.',
};
