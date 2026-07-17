/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useRef, useState } from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { A11Y_TRACE } from './data';
import { AriaLiveMirror, KeyboardReference, LogPanel } from './story_components';

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showKeyboardFocusBadge = boolean('Show keyboard focus badge', true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [clickLog, setClickLog] = useState<string>('—');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div ref={chartContainerRef}>
        <Chart title={title} description={description} size={{ width: '100%', height: 240 }}>
          <Settings
            baseTheme={theme}
            onElementClick={(elements) => {
              const el = elements[0];
              if (el && 'name' in el) setClickLog(`"${el.name}" (id: ${el.id})`);
            }}
          />
          <Trace
            id="trace_a11y"
            data={A11Y_TRACE as TraceDatum[]}
            xScaleType="linear"
            showKeyboardFocusBadge={showKeyboardFocusBadge}
          />
        </Chart>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AriaLiveMirror containerRef={chartContainerRef} />
        <LogPanel label="onElementClick" value={clickLog} />
      </div>

      <KeyboardReference />
    </div>
  );
};

Example.parameters = {
  resize: { height: '480px', overflowY: 'auto' },
  markdown:
    'Tab into the chart, then use the keyboard to navigate lanes. A full-width background ' +
    'highlight marks the focused lane. An `aria-live` region announces the span name and ' +
    'duration on each move; a hidden paginated table exposes all spans to assistive technology.\n\n' +
    'Try: **Tab** → focus chart → **↓** to move through lanes → **Enter** to fire a click → ' +
    '**Esc** to clear focus. The **aria-live output** panel mirrors announcements for sighted developers.',
};
