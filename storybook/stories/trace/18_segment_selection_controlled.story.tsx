/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React, { useEffect, useState } from 'react';

import type { TraceSelection } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { SELECTION_TRACE } from './data';
import { formatSelection, formatSelectionDetail, LogPanel } from './story_components';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// Named preset selections — the knob drives which one is active.
// Chart interaction also updates selection state, demonstrating the controlled pattern.
const PRESET_LABELS = {
  'None (clear)': 'none',
  'root — active[0]': 'root-active-0',
  'db — whole-span': 'db-whole-span',
  'Multi: root active[0] + db active[1]': 'multi-root-db',
} as const;

type PresetKey = (typeof PRESET_LABELS)[keyof typeof PRESET_LABELS];

const PRESET_SELECTIONS: Record<PresetKey, TraceSelection> = {
  none: [],
  'root-active-0': [{ spanId: 'root', region: 'active', segmentIndex: 0 }],
  'db-whole-span': [{ spanId: 'db', region: 'span', segmentIndex: -1 }],
  'multi-root-db': [
    { spanId: 'root', region: 'active', segmentIndex: 0 },
    { spanId: 'db', region: 'active', segmentIndex: 1 },
  ],
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showTooltipOverEmpty = boolean('showTooltipOverEmpty', false);
  const presetKey = select('Preset selection', PRESET_LABELS, 'none') as PresetKey;

  const [selection, setSelection] = useState<TraceSelection>(PRESET_SELECTIONS[presetKey]);
  const [changeLog, setChangeLog] = useState<string>('—');

  // Changing the knob resets the controlled selection to the chosen preset.
  useEffect(() => {
    setSelection(PRESET_SELECTIONS[presetKey]);
  }, [presetKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_selection_controlled"
          data={SELECTION_TRACE}
          xScaleType="linear"
          showTooltipOverEmpty={showTooltipOverEmpty}
          selection={selection}
          onSelectionChange={(next, details) => {
            setSelection(next);
            setChangeLog(`next: ${formatSelection(next)}\ndetails: ${formatSelectionDetail(details)}`);
          }}
        />
      </Chart>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LogPanel label="Current selection (controlled prop)" value={formatSelection(selection)} />
        <LogPanel label="onSelectionChange log" value={changeLog} />
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Controlled segment selection: the `selection` prop is the render source of truth. ' +
    'Gestures fire `onSelectionChange` — the parent decides whether to update the prop ' +
    '(same model as `focusDomain`). The **Preset selection** knob in the Knobs panel ' +
    'drives the selection externally, simulating a parent component overriding what the ' +
    'user clicked. Chart interactions still work and are reflected in the log.',
};
