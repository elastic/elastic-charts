/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ margin: '0 0 4px' }}>
          <strong>Default floor</strong> — <code>minVisibleExtentMs</code> omitted (1 ns in{' '}
          <code>linear</code>)
        </p>
        <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
          <Settings baseTheme={baseTheme} />
          <Trace id="trace_mve_default" data={CHECKOUT_SPANS} xScaleType="linear" />
        </Chart>
      </div>
      <div>
        <p style={{ margin: '0 0 4px' }}>
          <strong>Raised floor</strong> — <code>minVisibleExtentMs={'{1}'}</code> (capped at a 1 ms
          window)
        </p>
        <Chart size={{ width: '100%', height: 200 }}>
          <Settings baseTheme={baseTheme} />
          <Trace id="trace_mve_capped" data={CHECKOUT_SPANS} xScaleType="linear" minVisibleExtentMs={1} />
        </Chart>
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'The `minVisibleExtentMs` prop **coarsens** the finest zoom-in window. By default the minimum ' +
    'visible extent is scale-dependent (1 ms in `time`, 1 ns in `linear`); this raises that floor so ' +
    'the chart never resolves finer than the chosen granularity.\n\n' +
    'The override is **coarsen-only** — the effective floor is `max(minVisibleExtentMs, scaleDefault)` ' +
    '— so a value finer than the scale default is ignored and the documented precision guarantees ' +
    'hold. Invalid values (`0`, negative, `NaN`, non-finite) fall back to the scale default.\n\n' +
    'Zoom both `linear` charts all the way in: the top one keeps resolving down to nanoseconds, while ' +
    'the bottom one stops at a 1 ms window. The floor applies uniformly to every zoom-in path — mouse ' +
    'wheel, `+` key, pinch, brush commit — and to the `focusDomain` clamp.',
};
