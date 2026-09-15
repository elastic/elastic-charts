/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { CustomTooltip, TraceDatum } from '@elastic/charts';
import { Chart, Settings, Tooltip, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ── Workflow ID constants ────────────────────────────────────────────────────

const ROOT_WORKFLOW = 'c278a243-49ef-4572-b0fa-767eafee0732';
const CHILD_WORKFLOW_A = '73368380-2ad9-465c-8b5e-6657d8a90a72';
const CHILD_WORKFLOW_B = 'e6ba88f7-eec8-4602-a81b-574dbdc87b0d';

// ── Meta type ────────────────────────────────────────────────────────────────

interface WorkflowMeta {
  workflowId: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

/** Compact summary: `{ key1, key2 +N } · ~X B` */
function ioSummary(val: Record<string, unknown>): string {
  const bytes = JSON.stringify(val).length;
  const keys = Object.keys(val);
  const shown = keys.slice(0, 3).join(', ');
  const extra = keys.length > 3 ? ` +${keys.length - 3}` : '';
  return `{ ${shown}${extra} }  ·  ~${bytes} B`;
}

const DIVIDER: React.CSSProperties = {
  borderTop: '1px solid rgba(128,128,128,0.2)',
  marginTop: 6,
  paddingTop: 6,
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9ca3af',
  marginBottom: 4,
};

const ROW: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 2,
};

const MUTED: React.CSSProperties = { color: '#9ca3af' };

function IoPre({ value, accent }: { value: Record<string, unknown>; accent: string }) {
  return (
    <pre
      // echTooltip__tableBody: the library's scroll-dismiss guard exempts elements
      // with this class so scrolling inside the pinned tooltip doesn't unpin it.
      className="echTooltip__tableBody"
      style={{
        margin: 0,
        fontSize: 10,
        lineHeight: 1.5,
        background: `${accent}12`,
        border: `1px solid ${accent}30`,
        borderRadius: 3,
        padding: '4px 6px',
        overflowX: 'auto',
        maxHeight: 180,
        overflowY: 'auto',
        whiteSpace: 'pre',
        color: 'inherit',
        opacity: 0.9,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const WorkflowTooltip: CustomTooltip = ({ values, backgroundColor, pinned }) => {
  const datum = values[0]?.datum as TraceDatum | undefined;
  if (!datum) return null;

  const meta = datum.meta as WorkflowMeta | undefined;
  const { input, output } = meta ?? {};
  const hasIO = input !== undefined || output !== undefined;

  return (
    <div
      style={{
        padding: '8px 12px',
        minWidth: 240,
        maxWidth: pinned ? 380 : 300,
        fontFamily: 'monospace',
        fontSize: 12,
        background: backgroundColor,
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        // The tooltip portal is pointer-events:none; re-enable when pinned so
        // wheel events land on this div (and scroll the <pre>) instead of
        // passing through to the chart canvas and zooming.
        pointerEvents: pinned ? 'auto' : 'none',
      }}
    >
      {/* Span name */}
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, wordBreak: 'break-word' }}>{datum.name}</div>

      {/* Timing rows from chart engine */}
      {values.map((v) => (
        <div key={v.label} style={ROW}>
          <span style={MUTED}>{v.label}</span>
          <span>{v.formattedValue}</span>
        </div>
      ))}

      {/* I/O section */}
      {hasIO && (
        <div style={DIVIDER}>
          {!pinned ? (
            // ── Compact: summary badge per direction ───────────────────────
            <>
              {input !== undefined && (
                <div style={ROW}>
                  <span style={{ fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>IN</span>
                  <span style={{ ...MUTED, textAlign: 'right' }}>{ioSummary(input)}</span>
                </div>
              )}
              {output !== undefined && (
                <div style={ROW}>
                  <span style={{ fontWeight: 700, color: '#10b981', flexShrink: 0 }}>OUT</span>
                  <span style={{ ...MUTED, textAlign: 'right' }}>{ioSummary(output)}</span>
                </div>
              )}
            </>
          ) : (
            // ── Pinned: full JSON per direction ────────────────────────────
            <>
              {input !== undefined && (
                <div style={{ marginBottom: output !== undefined ? 8 : 0 }}>
                  <div style={{ ...SECTION_LABEL, color: '#3b82f6' }}>Input</div>
                  <IoPre value={input} accent="#3b82f6" />
                </div>
              )}
              {output !== undefined && (
                <div>
                  <div style={{ ...SECTION_LABEL, color: '#10b981' }}>Output</div>
                  <IoPre value={output} accent="#10b981" />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer hint (hover only) */}
      {!pinned && (
        <div
          style={{
            ...DIVIDER,
            fontSize: 10,
            color: '#9ca3af',
            textAlign: 'center',
            paddingBottom: 0,
            marginBottom: 0,
          }}
        >
          Right-click to pin for full I/O
        </div>
      )}
    </div>
  );
};

// ── colorBy accessor ─────────────────────────────────────────────────────────

const BY_WORKFLOW_ID = (datum: TraceDatum) => {
  const meta = datum.meta as WorkflowMeta | undefined;
  return meta?.workflowId;
};

// ── Span data ────────────────────────────────────────────────────────────────

const DATA: TraceDatum[] = [
  // ── Root Workflow ───────────────────────────────────────────────────────────
  {
    id: ROOT_WORKFLOW,
    name: 'Trace Debug: Root Workflow',
    start: 1784283974785,
    end: 1784284006933,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW, input: { mode: 'normal' } } satisfies WorkflowMeta,
  },
  {
    id: '20ab52e0d452cb20ae0db36fbe462110b5df6099af456c3b2a41e56ad21a7157',
    name: 'initialize [data.set]',
    start: 1784283974805,
    end: 1784283974806,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { data: { mode: 'normal', phase: 'init' } },
      output: { data: { mode: 'normal', phase: 'init' } },
    } satisfies WorkflowMeta,
  },
  {
    id: 'ea741130fdad4bb3d32eb363fc1e264fb7602f9c6fb7b54e42037498d6f8c9cb',
    name: 'quick_pause [wait]',
    start: 1784283974852,
    end: 1784283975964,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW } satisfies WorkflowMeta,
  },
  {
    id: '60f50ae9dc0269e2f103277bb142786755d01bfebda6085d70622d3f7670cd28',
    name: 'select_path [if]',
    start: 1784283975993,
    end: 1784283978139,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { rawCondition: "${{ inputs.mode == 'fast' }}", condition: false, conditionResult: false },
      output: {},
    } satisfies WorkflowMeta,
  },
  {
    id: '419a7da4cdc7d773c4b9a862e15057eecd2ae4dc34211f40a6af550941a279c6',
    name: 'check_slow_mode [if]',
    start: 1784283976018,
    end: 1784283978122,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { rawCondition: "${{ inputs.mode == 'slow' }}", condition: false, conditionResult: false },
      output: {},
    } satisfies WorkflowMeta,
  },
  {
    id: '0c60fda9209a9e5343fceaa04cd003eeb5b40823a8f7bb9aa59429d0f4ba51a8',
    name: 'normal_delay [wait]',
    start: 1784283976043,
    end: 1784283978085,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW } satisfies WorkflowMeta,
  },
  {
    id: '4c788626cafe2e38920eabd1f7def54ea632104305e6e8050d5ece33a658e432',
    name: 'normal_action [data.set]',
    start: 1784283978104,
    end: 1784283978105,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { data: { path_taken: 'normal', delay_applied: '2s' } },
      output: { data: { path_taken: 'normal', delay_applied: '2s' } },
    } satisfies WorkflowMeta,
  },
  {
    id: 'd39345669858fb289421959275c1b5d91beeb510711488726aaec8bd4d9f53d2',
    name: 'parallel_enrichment [parallel]',
    start: 1784283978154,
    end: 1784283983809,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      output: {
        total: 2,
        failed: 0,
        succeeded: 2,
        status: 'completed',
        branches: {
          quick_lookup: { status: 'completed', output: { data: { source: 'quick_lookup', value: 'enrichment_a' } } },
          deep_analysis: { status: 'completed', output: { data: { source: 'deep_analysis', value: 'enrichment_b' } } },
        },
        results: [
          {
            index: 0,
            key: 'quick_lookup',
            status: 'completed',
            startedAt: 1784283978154,
            finishedAt: 1784283978156,
            durationMs: 2,
            output: { data: { source: 'quick_lookup', value: 'enrichment_a' } },
          },
          {
            index: 1,
            key: 'deep_analysis',
            status: 'completed',
            startedAt: 1784283978154,
            finishedAt: 1784283983808,
            durationMs: 5654,
            output: { data: { source: 'deep_analysis', value: 'enrichment_b' } },
          },
        ],
      },
    } satisfies WorkflowMeta,
  },
  {
    id: '57bc956bd9e5e08ec235b65153baa71b096b561423d3e89e0186a338f7943bf2',
    name: 'lookup_result [data.set]',
    start: 1784283978155,
    end: 1784283978155,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { data: { source: 'quick_lookup', value: 'enrichment_a' } },
      output: { data: { source: 'quick_lookup', value: 'enrichment_a' } },
    } satisfies WorkflowMeta,
  },
  {
    id: 'b42ccb3f4ddefe92efd64c8a6ee233476092315bb33314007dc77b6bda87e33f',
    name: 'analysis_delay [wait]',
    start: 1784283978155,
    end: 1784283983807,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW } satisfies WorkflowMeta,
  },
  {
    id: 'd184e6b4e5977325810439c2c332bf61a038aaea0d55efe75239dec764c17daf',
    name: 'analysis_result [data.set]',
    start: 1784283983808,
    end: 1784283983808,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { data: { source: 'deep_analysis', value: 'enrichment_b' } },
      output: { data: { source: 'deep_analysis', value: 'enrichment_b' } },
    } satisfies WorkflowMeta,
  },
  {
    id: '95a8b8545feb325624bcac2b6da6cbf6e5c0d746ac9f3b30ac08d39ac91018ca',
    name: 'run_child_a [workflow.execute]',
    start: 1784283983841,
    end: 1784284001782,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      input: { 'workflow-id': 'trace-debug-child-workflow-a', inputs: { context: 'from_root', mode: 'normal' } },
      output: {
        child: 'a',
        status: 'completed',
        child_b_output: { caller: 'from_root', depth: '2', child: 'b', status: 'completed' },
      },
    } satisfies WorkflowMeta,
  },
  // ── Child Workflow A ─────────────────────────────────────────────────────────
  {
    id: CHILD_WORKFLOW_A,
    name: 'Trace Debug: Child Workflow A',
    start: 1784283986811,
    end: 1784283998875,
    parentId: '95a8b8545feb325624bcac2b6da6cbf6e5c0d746ac9f3b30ac08d39ac91018ca',
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A, input: { context: 'from_root', mode: 'normal' } } satisfies WorkflowMeta,
  },
  {
    id: '60b81b38416bd1e516f402c5469ffff6b9db5f5c756b3c931d7a76aae337f86e',
    name: 'setup [data.set]',
    start: 1784283986827,
    end: 1784283986827,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_A,
      input: { data: { caller_context: 'from_root', child: 'a' } },
      output: { data: { caller_context: 'from_root', child: 'a' } },
    } satisfies WorkflowMeta,
  },
  {
    id: 'ce526d43aceeb9efefb965d6a59f2103ca6547e6d5d6a40d0ecf9bf31a2c26ab',
    name: 'medium_pause [wait]',
    start: 1784283986850,
    end: 1784283988935,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A } satisfies WorkflowMeta,
  },
  {
    id: 'b2f1ee63d6dfccd5ee7f4ca87bad69a6055d8553c90bd2fc86422115896f5989',
    name: 'extra_work_gate [if]',
    start: 1784283988963,
    end: 1784283991080,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_A,
      input: { rawCondition: "${{ inputs.mode != 'fast' }}", condition: true, conditionResult: true },
      output: { conditionResult: true },
    } satisfies WorkflowMeta,
  },
  {
    id: 'ead9bab007d70dcd49b8ef9bdb44fe5b27ec8649dfec3d629df798a4d61ae257',
    name: 'extra_wait [wait]',
    start: 1784283988986,
    end: 1784283991040,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A } satisfies WorkflowMeta,
  },
  {
    id: '2beff2680f368d2abacf8f3256526c3df9b530c50d167b41225f85b736213001',
    name: 'extra_data [data.set]',
    start: 1784283991058,
    end: 1784283991059,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_A,
      input: { data: { extra_work_done: true } },
      output: { data: { extra_work_done: true } },
    } satisfies WorkflowMeta,
  },
  {
    id: '97d6d93efb7c9846939bdc36bcaf53df827528ee1f18c484b7f3f6875012e900',
    name: 'run_child_b [workflow.execute]',
    start: 1784283991100,
    end: 1784283998786,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_A,
      input: { 'workflow-id': 'trace-debug-child-workflow-b', inputs: { depth: '2', caller: 'from_root' } },
      output: { caller: 'from_root', depth: '2', child: 'b', status: 'completed' },
    } satisfies WorkflowMeta,
  },
  // ── Child Workflow B ─────────────────────────────────────────────────────────
  {
    id: CHILD_WORKFLOW_B,
    name: 'Trace Debug: Child Workflow B',
    start: 1784283992743,
    end: 1784283995962,
    parentId: '97d6d93efb7c9846939bdc36bcaf53df827528ee1f18c484b7f3f6875012e900',
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B, input: { depth: '2', caller: 'from_root' } } satisfies WorkflowMeta,
  },
  {
    id: 'cf0760e2bbefeded91161931a6f961ff12c3504306318b854ceaa3f9a219a8a9',
    name: 'setup [data.set]',
    start: 1784283992777,
    end: 1784283992778,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_B,
      input: { data: { depth: '2', caller: 'from_root', child: 'b' } },
      output: { data: { depth: '2', caller: 'from_root', child: 'b' } },
    } satisfies WorkflowMeta,
  },
  {
    id: '1dfb17714f0c4063c6325accdac86ac2415b57cf405c7bc97c6583136d17da65',
    name: 'slow_processing [wait]',
    start: 1784283992802,
    end: 1784283995847,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B } satisfies WorkflowMeta,
  },
  {
    id: 'bf1351d2a04d82793895022e91fc8234ca61de6ed7eaf0903b82ef9cbaaa7571',
    name: 'finalize [data.set]',
    start: 1784283995869,
    end: 1784283995870,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_B,
      input: { data: { processed: true } },
      output: { data: { processed: true } },
    } satisfies WorkflowMeta,
  },
  {
    id: '59872cbed31c0593a9825e61619d5a42e4ddb8d9e8ccd5e9003d8db3dea3673a',
    name: 'done [workflow.output]',
    start: 1784283995890,
    end: 1784283995891,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_B,
      output: { child: 'b', depth: '2', caller: 'from_root', status: 'completed' },
    } satisfies WorkflowMeta,
  },
  // ── Back to Child A ──────────────────────────────────────────────────────────
  {
    id: '8ac04b6e75625e3d9cd66209b7a0f3cb1b2dbc08b9eb14695323948e9ae6d658',
    name: 'done [workflow.output]',
    start: 1784283998815,
    end: 1784283998816,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: CHILD_WORKFLOW_A,
      output: {
        child: 'a',
        status: 'completed',
        child_b_output: { caller: 'from_root', depth: '2', child: 'b', status: 'completed' },
      },
    } satisfies WorkflowMeta,
  },
  // ── Back to Root ─────────────────────────────────────────────────────────────
  {
    id: '6d01bbdf6806a63a42fa8798931814db36159ef8f835ea17198142078eb36d40',
    name: 'final_pause [wait]',
    start: 1784284001798,
    end: 1784284006856,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW } satisfies WorkflowMeta,
  },
  {
    id: '041090e27a3824ac239bdc8dcbf37e4d89464e1775eb774ed935961ab3253b8e',
    name: 'done [workflow.output]',
    start: 1784284006881,
    end: 1784284006881,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: {
      workflowId: ROOT_WORKFLOW,
      output: {
        mode: 'normal',
        status: 'completed',
        child_a_output: {
          child: 'a',
          status: 'completed',
          child_b_output: { caller: 'from_root', depth: '2', child: 'b', status: 'completed' },
        },
      },
    } satisfies WorkflowMeta,
  },
];

// ── Story ────────────────────────────────────────────────────────────────────

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 600 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Tooltip customTooltip={WorkflowTooltip} />
    <Trace id="trace_kibana_workflow" data={DATA} xScaleType="time" traceId={ROOT_WORKFLOW} colorBy={BY_WORKFLOW_ID} />
  </Chart>
);

Example.parameters = {
  markdown:
    'Kibana workflow execution trace: `Root → Child A → Child B`, ~32 s total. ' +
    'Each span carries `meta.workflowId`; `BY_WORKFLOW_ID` groups them into three palette colors.\n\n' +
    '**Tooltip:**\n' +
    '- **Hover** — compact view: timing + `IN { keys } · ~N B` / `OUT { keys } · ~N B` badges.\n' +
    '- **Right-click to pin** — full JSON for input and output in scrollable blocks.\n\n' +
    `Workflow ids: Root \`${ROOT_WORKFLOW}\`, Child A \`${CHILD_WORKFLOW_A}\`, Child B \`${CHILD_WORKFLOW_B}\`.`,
};
