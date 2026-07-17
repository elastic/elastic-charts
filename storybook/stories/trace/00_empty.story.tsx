/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, text } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const EMPTY_STATE_OPTIONS = {
  'no data — empty data prop (DOM overlay)': 'no-data',
  'trace not found — traceId matches nothing (canvas message)': 'trace-not-found',
} as const;
type EmptyStateKey = keyof typeof EMPTY_STATE_OPTIONS;

export const Example: ChartsStory = (_, { title, description }) => {
  const selectedLabel = select<EmptyStateKey>(
    'empty state',
    Object.keys(EMPTY_STATE_OPTIONS) as EmptyStateKey[],
    'no data — empty data prop (DOM overlay)',
  );
  const variant = EMPTY_STATE_OPTIONS[selectedLabel];
  const customMessage = text('traceNotFoundMessage (trace-not-found only)', '');

  const isTraceNotFound = variant === 'trace-not-found';

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace
        id="trace_empty"
        data={isTraceNotFound ? CHECKOUT_SPANS : []}
        traceId={isTraceNotFound ? 'does-not-exist' : undefined}
        traceNotFoundMessage={isTraceNotFound && customMessage ? customMessage : undefined}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Demonstrates the two empty states for the Trace chart (ADR 0019).\n\n' +
    '**no-data** (`data={[]}`) — the chart never mounts; the standard library empty state\n' +
    '("No data to display") is shown as a DOM overlay, overridable via `Settings.noResults`.\n\n' +
    '**trace-not-found** (`traceId` set but matches no spans) — the chart mounts, the time bar\n' +
    'and axis remain visible, and a centered message is drawn on the canvas. Customize the\n' +
    'message text via `traceNotFoundMessage` (plain string, not a ReactNode).\n\n' +
    'Toggle the knob to switch between the two variants.',
};
