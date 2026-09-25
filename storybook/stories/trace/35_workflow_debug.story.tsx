/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React, { useEffect, useMemo, useState } from 'react';

import type {
  CustomTooltip,
  ElementOverListener,
  TraceColorAccessor,
  TraceDataDiagnostics,
  TraceDatum,
  TraceSpanBadge,
  TraceSpanBadgeAccessor,
} from '@elastic/charts';
import {
  Chart,
  isTraceAnnotationElementEvent,
  Settings,
  Tooltip,
  Trace,
  TraceHierarchyAnnotation,
  TraceLaneAnnotation,
  TraceTimeAnnotation,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ── CSV shape ─────────────────────────────────────────────────────────────────
//
// Columns produced by the workflow-trace ES|QL query (order-independent; matched by header name):
//   span_id, is_step, run_id, name, workflowId, status, start, end,
//   parentExecutionId, stepId, stepType, childExecutionId, inputJson, outputJson, errorJson
//
// `start` / `end` are epoch-ms (TO_LONG(startedAt|finishedAt)). Two row kinds:
//   • workflow executions (`is_step = false`): `span_id === run_id`; the root has an empty
//     `parentExecutionId`, nested workflows carry their parent's execution id.
//   • steps (`is_step = true`): belong to the workflow run in `run_id`; a `workflow.execute` /
//     `workflow.executeAsync` step carries the spawned child workflow's id in `childExecutionId`.
//
// Parenting (drives the tree + nested-workflow collapse):
//   • a step's parent is its `run_id` (the workflow it belongs to);
//   • a nested workflow's parent is the step that spawned it — the step whose `childExecutionId`
//     equals this workflow's `run_id` — so collapsing that step collapses the whole nested workflow.

interface WorkflowMeta {
  isStep: boolean;
  runId?: string;
  workflowId?: string;
  /** YAML step type, e.g. `kibana.request`, `data.set`, `workflow.execute`. Absent on workflow rows. */
  stepType?: string;
  status?: string;
  /** For `workflow.execute` steps: the spawned child workflow's execution id. */
  childExecutionId?: string;
  error?: string;
}

// A compact failing run used as the out-of-the-box sample: an orchestrator workflow that spawns a
// nested `detection` workflow via a `workflow.execute` step; the nested workflow's Slack step failed,
// bubbling up. Collapse the `detect [workflow.execute]` step to fold the whole nested workflow away.
// Replace the textarea contents with your own query output (paste the CSV verbatim, header included).
/* eslint-disable max-len */
const DEFAULT_CSV = `span_id,is_step,run_id,name,workflowId,status,start,end,parentExecutionId,stepId,stepType,childExecutionId,inputJson,outputJson,errorJson
root-exec,false,root-exec,Workflow orchestrator,orchestrator,failed,1784532658966,1784532663966,,,,,,,
s-init,true,root-exec,init [data.set],,completed,1784532658976,1784532658986,,init,data.set,,,,
s-detect,true,root-exec,detect [workflow.execute],,failed,1784532659000,1784532663000,,detect,workflow.execute,child-exec,,,
child-exec,false,child-exec,Workflow detection,detection,failed,1784532659010,1784532662990,root-exec,,,,,,
c-query,true,child-exec,query_alerts [kibana.request],,completed,1784532659020,1784532660000,,query_alerts,kibana.request,,,,
c-post,true,child-exec,post_results [slack],,failed,1784532660100,1784532660200,,post_results,slack,,,,"{""type"":""ConnectorError"",""message"":""Connector slack-prod not found""}"
s-final,true,root-exec,finalize [workflow.output],,completed,1784532663100,1784532663200,,finalize,workflow.output,,,,`;
/* eslint-enable max-len */

// ── CSV parsing ───────────────────────────────────────────────────────────────

// Minimal RFC-4180-ish tokenizer: handles quoted fields, escaped quotes (`""`), commas and newlines
// inside quotes, and CRLF. Returns rows of raw (still-quoted-stripped) string cells.
function tokenizeCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    switch (c) {
      case '"':
        inQuotes = true;
        break;
      case ',':
        row.push(field);
        field = '';
        break;
      case '\n':
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        break;
      case '\r':
        break;
      default:
        field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

interface ParsedTrace {
  data: TraceDatum[];
  /** Span ids that are the origin of a failure (failed, with no failed child). */
  originIds: Set<string>;
  /** Resolved failure-origin spans, in render order. */
  origins: TraceDatum[];
  /** Step spans that spawned a nested workflow — the collapse targets for folding nested workflows. */
  nestedWorkflowStepIds: string[];
}

const EMPTY_PARSED: ParsedTrace = { data: [], originIds: new Set(), origins: [], nestedWorkflowStepIds: [] };

const meta = (d: TraceDatum) => d.meta as WorkflowMeta | undefined;
const isFailed = (d: TraceDatum) => meta(d)?.status === 'failed';

// `errorJson` is the raw `JSON_EXTRACT(_source, "error")` cell. Render it as `type: message` when it
// parses to an object, the string itself when it's a bare JSON string, or the raw text as a fallback.
function errorMessage(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object') {
      const { type, message, reason } = parsed as { type?: string; message?: string; reason?: string };
      const text = message ?? reason;
      if (typeof text === 'string') return type ? `${type}: ${text}` : text;
      return JSON.stringify(parsed);
    }
  } catch {
    return raw;
  }
  return raw;
}

/** Trimmed cell at column `i` (empty string when the column is absent or the row is short). */
const csvCell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? '').trim() : '');

function parseWorkflowCsv(csv: string): ParsedTrace {
  const table = tokenizeCsv(csv.trim()).filter((r) => r.some((c) => c.trim() !== ''));
  if (table.length < 2) return EMPTY_PARSED;

  const header = table[0].map((h) => h.trim());
  const iSpan = header.indexOf('span_id');
  const iIsStep = header.indexOf('is_step');
  const iRunId = header.indexOf('run_id');
  const iName = header.indexOf('name');
  const iWorkflowId = header.indexOf('workflowId');
  const iStatus = header.indexOf('status');
  const iStart = header.indexOf('start');
  const iEnd = header.indexOf('end');
  const iStepType = header.indexOf('stepType');
  const iChildExec = header.indexOf('childExecutionId');
  const iError = header.indexOf('errorJson');

  // The identity + timing columns are mandatory; everything else is optional metadata.
  if (iSpan < 0 || iStart < 0 || iEnd < 0) return EMPTY_PARSED;

  // First pass: map each spawned child-workflow execution id → the step span that spawned it. A
  // nested workflow row (whose `run_id` is that execution id) is then parented under this step.
  const childExecToStep = new Map<string, string>();
  for (const row of table.slice(1)) {
    const isStep = iIsStep >= 0 && csvCell(row, iIsStep) === 'true';
    const childExec = csvCell(row, iChildExec);
    const id = csvCell(row, iSpan);
    if (isStep && childExec && id) childExecToStep.set(childExec, id);
  }

  const data: TraceDatum[] = [];
  for (const row of table.slice(1)) {
    const id = csvCell(row, iSpan);
    const start = Number(csvCell(row, iStart));
    const end = Number(csvCell(row, iEnd));
    if (!id || !Number.isFinite(start) || !Number.isFinite(end)) continue;

    const stepType = csvCell(row, iStepType) || undefined;
    const isStep = iIsStep >= 0 ? csvCell(row, iIsStep) === 'true' : stepType !== undefined;
    const runId = csvCell(row, iRunId) || undefined;
    const workflowId = csvCell(row, iWorkflowId) || undefined;

    // Steps hang off their owning workflow run; a nested workflow hangs off the step that spawned it.
    const parentId = isStep ? runId : childExecToStep.get(runId ?? id);

    data.push({
      id,
      name: iName >= 0 ? row[iName] ?? id : id,
      start,
      end,
      parentId: parentId && parentId !== id ? parentId : undefined,
      meta: {
        isStep,
        runId,
        workflowId,
        stepType,
        status: csvCell(row, iStatus) || undefined,
        childExecutionId: csvCell(row, iChildExec) || undefined,
        error: csvCell(row, iError) || undefined,
      } satisfies WorkflowMeta,
    });
  }

  const withRoots = synthesizeMissingRoots(data);
  const originIds = failureOriginIds(withRoots);
  // Collapse targets: the steps that are the parent of at least one nested workflow row.
  const nestedWorkflowStepIds = [
    ...new Set(withRoots.filter((d) => !meta(d)?.isStep && d.parentId).map((d) => d.parentId as string)),
  ];
  return {
    data: withRoots,
    originIds,
    origins: withRoots.filter((d) => originIds.has(d.id)),
    nestedWorkflowStepIds,
  };
}

// When a step references a workflow-run id that has no row of its own (a partial export), synthesize
// a `Workflow <id>` root spanning its children so the orphaned steps still nest under one lane.
function synthesizeMissingRoots(data: TraceDatum[]): TraceDatum[] {
  const ids = new Set(data.map((d) => d.id));
  const missing = new Map<string, { start: number; end: number }>();

  for (const d of data) {
    if (!d.parentId || ids.has(d.parentId)) continue;
    const acc = missing.get(d.parentId);
    if (!acc) {
      missing.set(d.parentId, { start: d.start, end: d.end });
    } else {
      acc.start = Math.min(acc.start, d.start);
      acc.end = Math.max(acc.end, d.end);
    }
  }
  if (missing.size === 0) return data;

  const anyFailedUnder = (rootId: string) => data.some((d) => d.parentId === rootId && isFailed(d));

  const roots: TraceDatum[] = [...missing].map(([rootId, info]) => ({
    id: rootId,
    name: `Workflow ${rootId}`,
    start: info.start,
    end: info.end,
    meta: { isStep: false, status: anyFailedUnder(rootId) ? 'failed' : 'completed' } satisfies WorkflowMeta,
  }));

  return [...roots, ...data];
}

// A span is a failure *origin* when it failed but no child failed — the error started here rather
// than bubbling up from a descendant. Annotations mark origins, not the whole ancestor chain.
function failureOriginIds(data: TraceDatum[]): Set<string> {
  const hasFailedChild = (id: string) => data.some((d) => d.parentId === id && isFailed(d));
  return new Set(data.filter((d) => isFailed(d) && !hasFailedChild(d.id)).map((d) => d.id));
}

// ── Presentation ──────────────────────────────────────────────────────────────

// Color lanes by step type so each step family reads as its own hue; workflow-execution rows
// (no stepType) fall back to `workflow`.
const BY_STEP_TYPE: TraceColorAccessor = (datum) => meta(datum)?.stepType ?? 'workflow';

const SEVERITY_COLOR: Record<TraceDataDiagnostics['issues'][number]['severity'], string> = {
  info: '#0077cc',
  warning: '#bd8c00',
  error: '#bd271e',
};

const STATUS_COLOR: Record<string, TraceSpanBadge['color']> = {
  completed: 'success',
  failed: 'danger',
  running: 'primary',
  waiting: 'warning',
};

// ── Custom tooltip (metadata + error) ─────────────────────────────────────────

const TOOLTIP_MUTED: React.CSSProperties = { color: '#9ca3af' };
const TOOLTIP_ROW: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 2,
};
const TOOLTIP_DIVIDER: React.CSSProperties = {
  borderTop: '1px solid rgba(128,128,128,0.2)',
  marginTop: 6,
  paddingTop: 6,
};

const MetaRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div style={TOOLTIP_ROW}>
      <span style={TOOLTIP_MUTED}>{label}</span>
      <span style={{ wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
    </div>
  ) : null;

// Renders the span name, its workflow metadata (step type, status, run/workflow/child-execution ids),
// the timing rows the Trace pipeline supplies via `values`, and — for failures — the parsed error.
const WorkflowTooltip: CustomTooltip = ({ values, backgroundColor }) => {
  const datum = values[0]?.datum as TraceDatum | undefined;
  if (!datum) return null;

  const m = meta(datum);
  const error = errorMessage(m?.error);

  return (
    <div
      style={{
        padding: '8px 12px',
        minWidth: 240,
        maxWidth: 360,
        fontFamily: 'monospace',
        fontSize: 12,
        background: backgroundColor,
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, wordBreak: 'break-word' }}>{datum.name}</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span>{m?.isStep ? m?.stepType ?? 'step' : 'workflow'}</span>
        {m?.status && (
          <span style={{ fontWeight: 700, color: m.status === 'failed' ? '#ef4444' : '#10b981' }}>{m.status}</span>
        )}
      </div>

      {values.map((v) => (
        <div key={v.label} style={TOOLTIP_ROW}>
          <span style={TOOLTIP_MUTED}>{v.label}</span>
          <span>{v.formattedValue}</span>
        </div>
      ))}

      <div style={TOOLTIP_DIVIDER}>
        <MetaRow label="run id" value={m?.runId} />
        <MetaRow label="workflow" value={m?.workflowId} />
        <MetaRow label="child execution" value={m?.childExecutionId} />
      </div>

      {error && <div style={{ ...TOOLTIP_DIVIDER, color: '#ef4444', wordBreak: 'break-word' }}>{error}</div>}
    </div>
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────

export const Example: ChartsStory = (_, { title, description }) => {
  const xScaleType = select<'time' | 'linear'>('xScaleType', { time: 'time', linear: 'linear' }, 'time');
  const labelPosition = select<'gutter' | 'inline' | 'none'>(
    'labelPosition',
    { gutter: 'gutter', inline: 'inline', none: 'none' },
    'inline',
  );
  const minSpanWidthPx = number('minSpanWidthPx (theme floor)', 5, { min: 0, max: 40, step: 1, range: true });
  const minVisibleExtent = number('minVisibleExtent (ms)', 1, { min: 0, max: 5000, step: 1 });
  const collapseNested = boolean('collapse nested workflows', true);
  const showHierarchy = boolean('failure hierarchy annotations', true);
  const showTimeMarker = boolean('failure timebar/plot annotations', true);
  const timePlacement = select<'timebar' | 'plot'>(
    'failure annotation placement',
    { timebar: 'timebar', plot: 'plot' },
    'timebar',
  );

  // A real in-story textarea (not a knob): it preserves newlines and has no URL-length limit, so a
  // large multi-line CSV paste round-trips intact — unlike an addon-knobs `text` knob, which collapses
  // a big paste into a single line and yields "no data".
  const [csv, setCsv] = useState(DEFAULT_CSV);

  const { data, originIds, origins, nestedWorkflowStepIds } = useMemo(() => parseWorkflowCsv(csv), [csv]);

  // Controlled collapse: nested workflows sit under their spawning `workflow.execute` step, so
  // collapsing those steps folds the whole nested workflow away. The `collapse nested workflows`
  // knob (and any re-parse) resets the set; caret clicks still toggle individual lanes.
  const [collapsed, setCollapsed] = useState<string[]>([]);
  useEffect(() => {
    setCollapsed(collapseNested ? nestedWorkflowStepIds : []);
  }, [collapseNested, nestedWorkflowStepIds]);

  // Structured data-quality report emitted by the Trace pipeline (Spec 28): reparented orphans,
  // clock-skew corrections, dropped non-finite spans, unresolved annotation targets, etc.
  const [diagnostics, setDiagnostics] = useState<TraceDataDiagnostics | null>(null);

  // Annotations carry no built-in tooltip, so an element-over listener surfaces their `meta.tip`
  // (which includes the failure's error message) in a small overlay pinned to the chart corner.
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);
  const onElementOver: ElementOverListener = (elements) => {
    const event = elements.find(isTraceAnnotationElementEvent);
    if (!event) return;
    const tip = (event.annotation.meta as { tip?: string } | undefined)?.tip;
    setHoveredTip(tip ?? event.annotation.ariaLabel ?? event.annotation.id);
  };

  // Status chip: only notable statuses get a chip. `completed` (happy path) shows none; `failed` is
  // shown only on the failure origin, not on the ancestors it bubbled up through.
  const badgeAccessor = useMemo<TraceSpanBadgeAccessor>(
    () => (datum) => {
      const status = meta(datum)?.status;
      if (!status || status === 'completed') return [];
      if (status === 'failed' && !originIds.has(datum.id)) return [];
      return [
        {
          id: 'status',
          text: status,
          color: STATUS_COLOR[status] ?? 'default',
          visibleIn: ['gutter', 'inline', 'none'],
        },
      ];
    },
    [originIds],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        spellCheck={false}
        placeholder="Paste the workflow-trace query CSV here (the first line must be the header row)…"
        style={{
          width: '100%',
          height: 120,
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: 11,
          lineHeight: 1.4,
          padding: 8,
          boxSizing: 'border-box',
          border: '1px solid rgba(128,128,128,0.4)',
          borderRadius: 4,
          whiteSpace: 'pre',
          overflow: 'auto',
        }}
      />
      <div style={{ fontSize: 12, color: data.length > 0 ? '#6b7280' : '#bd271e' }}>
        {data.length > 0
          ? `Parsed ${data.length} spans` +
            `${nestedWorkflowStepIds.length > 0 ? ` · ${nestedWorkflowStepIds.length} nested workflow(s)` : ''}` +
            `${origins.length > 0 ? ` · ${origins.length} failure origin(s)` : ''}`
          : 'No spans parsed — the first line must be the CSV header (span_id,is_step,run_id,name,workflowId,status,start,end,…) and rows must be newline-separated.'}
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <Chart title={title} description={description} size={{ width: '100%', height: 400 }}>
          <Settings
            baseTheme={useBaseTheme()}
            theme={{ trace: { labelPosition, minSpanWidthPx } }}
            onElementOver={onElementOver}
            onElementOut={() => setHoveredTip(null)}
          />
          <Tooltip customTooltip={WorkflowTooltip} />
          <Trace
            id="trace_workflow_csv"
            data={data}
            xScaleType={xScaleType}
            minVisibleExtent={minVisibleExtent}
            colorBy={BY_STEP_TYPE}
            badgeAccessor={badgeAccessor}
            collapsedSpanIds={collapsed}
            onCollapseChange={setCollapsed}
            onDataDiagnosticsChange={setDiagnostics}
          >
            {origins.map((origin) => {
              const originError = errorMessage(meta(origin)?.error);
              const failed = originError ? `${origin.name} failed — ${originError}` : `${origin.name} failed`;
              return (
                <React.Fragment key={origin.id}>
                  {showHierarchy && (
                    <TraceHierarchyAnnotation
                      id={`failure-path-${origin.id}`}
                      spanId={origin.id}
                      color="danger"
                      ariaLabel={`Failure propagation path: ${origin.name}`}
                      meta={{ tip: `Failure path to ${origin.name}${originError ? ` — ${originError}` : ''}` }}
                    />
                  )}
                  {showHierarchy && (
                    <TraceLaneAnnotation
                      id={`failure-origin-${origin.id}`}
                      spanId={origin.id}
                      color="danger"
                      ariaLabel={`Failed step: ${origin.name}`}
                      meta={{ tip: failed }}
                    />
                  )}
                  {showTimeMarker && (
                    <TraceTimeAnnotation
                      id={`failure-time-${origin.id}`}
                      time={origin.end}
                      placement={timePlacement}
                      color="danger"
                      ariaLabel={`Failure time: ${origin.name}`}
                      meta={{
                        tip: `${origin.name} failed at ${new Date(origin.end).toISOString()}${originError ? ` — ${originError}` : ''}`,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Trace>
        </Chart>
        {hoveredTip && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              maxWidth: '60%',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              borderRadius: 4,
              fontSize: 12,
              pointerEvents: 'none',
            }}
          >
            {hoveredTip}
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Data diagnostics{diagnostics && diagnostics.issues.length > 0 ? ` (${diagnostics.issues.length})` : ''}
        </div>
        {!diagnostics || diagnostics.issues.length === 0 ? (
          <p style={{ margin: 0, color: '#69707d' }}>No issues reported — the trace prepared cleanly.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {diagnostics.issues.map((issue) => (
              <li
                key={`${issue.kind}|${issue.scope}|${issue.severity}`}
                style={{
                  borderLeft: `3px solid ${SEVERITY_COLOR[issue.severity]}`,
                  padding: '4px 8px',
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {issue.kind} <span style={{ color: SEVERITY_COLOR[issue.severity] }}>({issue.severity})</span>
                </div>
                <div style={{ color: '#69707d' }}>
                  scope: {issue.scope} · count: {issue.count}
                  {issue.examples.length > 0 ? ` · e.g. ${issue.examples.join(', ')}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Example.parameters = {
  resize: { height: '860px', overflowY: 'auto' },
  markdown:
    'Paste the CSV output of the workflow-trace **ES|QL query** into the textarea above the chart and ' +
    'the story parses it into `TraceDatum[]` — no code changes. Expected columns (matched by ' +
    'header name, order-independent): `span_id, is_step, run_id, name, workflowId, status, start, ' +
    'end, parentExecutionId, stepId, stepType, childExecutionId, inputJson, outputJson, errorJson`. ' +
    '`start`/`end` are epoch-ms; quoted fields and JSON payloads (with embedded commas/quotes) are ' +
    'handled. A live status line reports how many spans, nested workflows, and failure origins ' +
    'parsed.\n\n' +
    '**Tree shape** — the query returns two row kinds: workflow executions (`is_step = false`, where ' +
    '`span_id === run_id`) and steps (`is_step = true`, belonging to the workflow in `run_id`). A ' +
    'step is parented under its `run_id` workflow; a **nested workflow** is parented under the ' +
    '`workflow.execute` / `workflow.executeAsync` step that spawned it (matched via the step\u2019s ' +
    '`childExecutionId`), so the nested run folds away when that step is collapsed. If a partial ' +
    'export omits a workflow row, a synthetic `Workflow <id>` root is generated so its steps still ' +
    'nest under one lane.\n\n' +
    'The CSV input is a real `<textarea>` (React state), not an addon-knobs `text` knob: a knob ' +
    'collapses a large multi-line paste into a single line via its URL round-trip, which parses to ' +
    'zero rows ("no data"). A plain textarea preserves the newlines.\n\n' +
    '**Knobs**\n' +
    '- **xScaleType** — `time` (wall-clock ticks, the default for epoch-ms data) vs `linear` ' +
    '(elapsed-from-zero).\n' +
    '- **labelPosition** — span-name labels in the `gutter`, `inline` below the bar, or `none`.\n' +
    '- **minSpanWidthPx** — theme floor so sub-pixel spans in a skewed trace stay visible (ADR 0036).\n' +
    '- **minVisibleExtent** — coarsens the finest zoom-in window, in ms (Spec 31).\n' +
    '- **collapse nested workflows** — seeds the controlled collapse set (ADR 0026) with every ' +
    '`workflow.execute` / `workflow.executeAsync` step that spawned a nested workflow, folding the ' +
    'nested runs on load. Caret clicks still expand/collapse individual lanes; re-parsing or ' +
    'toggling the knob re-seeds the set.\n' +
    '- **failure hierarchy annotations** — for every failure *origin* (a `failed` span with no ' +
    'failed child), a danger `TraceHierarchyAnnotation` traces the root→origin route plus a ' +
    '`TraceLaneAnnotation` on the origin lane. Inert unless the data contains failures.\n' +
    "- **failure timebar/plot annotations** — a danger `TraceTimeAnnotation` at each origin's finish " +
    'time; the placement knob switches between `timebar` and full-height `plot`. Also inert without ' +
    'failures.\n\n' +
    'Lanes are colored by step type (`colorBy`), and non-`completed` statuses surface a chip ' +
    '(`failed` only on the origin). The bundled sample is an orchestrator workflow that spawns a ' +
    'nested `detection` workflow whose Slack step failed; replace the textarea contents with your ' +
    'own run.\n\n' +
    '**Tooltip & annotation hover** — a `customTooltip` renders each span\u2019s metadata (step type, ' +
    'status, run / workflow / child-execution ids, plus timing) and, for failures, the parsed ' +
    '`errorJson` message. The failure annotations carry no built-in tooltip, so an `onElementOver` ' +
    'listener surfaces their `meta.tip` — including that same error message — in a corner overlay.\n\n' +
    '**Data diagnostics** — the panel below the chart lists the structured `TraceDataDiagnostics` ' +
    'report emitted via `onDataDiagnosticsChange` (Spec 28): reparented orphans (e.g. the synthetic ' +
    'root case), clock-skew corrections, dropped non-finite spans, unresolved annotation targets, ' +
    'and more, each with its severity, scope, count, and example ids.',
};
