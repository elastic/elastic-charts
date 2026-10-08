/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import { SELECTION_TRACE } from './data';
import { formatSelection, formatSelectionDetail, GestureReference, LogPanel } from './story_components';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showTooltipOverEmpty = boolean('showTooltipOverEmpty', false);
  const [log, setLog] = useState<string>('—');
  const [detailLog, setDetailLog] = useState<string>('—');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_selection_uncontrolled"
          data={SELECTION_TRACE}
          xScaleType="linear"
          showTooltipOverEmpty={showTooltipOverEmpty}
          onSelectionChange={(next, details) => {
            setLog(formatSelection(next));
            setDetailLog(formatSelectionDetail(details));
          }}
        />
      </Chart>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LogPanel label="onSelectionChange — next (thin refs)" value={log} />
        <LogPanel label="onSelectionChange — details (rich)" value={detailLog} />
      </div>

      <GestureReference />
    </div>
  );
};

Example.parameters = {
  resize: { height: '440px', overflowY: 'auto' },
  markdown:
    'Uncontrolled segment selection: the chart manages selection state internally. ' +
    '`onSelectionChange` fires once per completed gesture with thin `TraceSegmentRef[]` refs ' +
    'and rich `TraceSelectionDetail[]` details.\n\n' +
    'Left-click a segment to select it; double-click for a whole-span ref; ' +
    '**Shift**+click = additive, **Cmd/Ctrl**+click = toggle; click empty space to clear. ' +
    'Keyboard: **Enter/Space** = whole-span replace, **Esc** = clear.',
};
