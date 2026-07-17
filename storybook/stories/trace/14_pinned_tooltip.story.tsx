/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { CHECKOUT_SPANS } from './data';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace id="trace_pinned_tooltip" data={CHECKOUT_SPANS} xScaleType="linear" />
  </Chart>
);

Example.parameters = {
  markdown:
    '**Right-click** a span to pin the tooltip — it stays visible while you move the pointer, ' +
    'zoom, or pan. Dismiss with **Escape**, a left-click anywhere, or another right-click.\n\n' +
    '- Hover shows a pinning-prompt footer ("Right click to pin tooltip").\n' +
    '- While pinned the tooltip is anchored at the frozen click position.\n' +
    '- Right-click over empty canvas space is a no-op.\n' +
    '- Left-click while pinned only unpins — it does not fire `onElementClick`.',
};
