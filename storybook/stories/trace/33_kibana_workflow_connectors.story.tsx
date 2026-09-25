/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';

import type {
  CustomTooltip,
  ElementOverListener,
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

// The failed slack step; the hierarchy annotation resolves its root→target
// route (Digest workflow → commits_count_check → post_empty_update) on its own.
const SLACK_SPAN = '8268015efbe6bb08198ad426b6e7fedfe61f1dd81aff7437cfb6e691e10fdb78';
const FAILURE_MESSAGE = 'Connector one-workflow-playground not found';
// Epoch-ms when the slack step failed (its `finishedAt`).
const FAILURE_TIME = 1785313672094;

// Real trace pulled from a Kibana `.workflows-executions` run (the "Digest
// workflow": search recent commits → branch → AI-summarize → post to Slack).
// Every span carries `meta.connectorType` (drives the badge icon) plus the
// real step `input` / `output` / `error` (drives the tooltip). See the
// `.claude`-generated ES|QL + generator that produced this literal.

const RUN = '712b5f0c-d931-4462-b6b7-38f594e6229a';

// ── Meta type ────────────────────────────────────────────────────────────────

interface WorkflowMeta {
  workflowId: string;
  /** YAML step type, e.g. `elasticsearch.request`, `ai.prompt`, `slack`. */
  connectorType?: string;
  status?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: { type: string; message: string };
}

// ── Connector icon badges ─────────────────────────────────────────────────────

// Base64 data-URLs of the real connector logos — the same EUI marks Kibana's
// workflow UI resolves for these step types (`logoElasticsearch`, EUI
// `product_agent` for `ai.*`, `logoSlack`). Only external connectors get a
// badge; built-in flow-control steps (`if`, `foreach`, `wait`, `data.set`, …)
// and the workflow root render none.
const ELASTICSEARCH_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDMyIDMyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIpIj48cGF0aCBmaWxsPSIjMUMxRTIzIiBkPSJNMCwxNiBDMCwxNy4zODQgMC4xOTQsMTguNzIgMC41MjQsMjAgTDIwLDIwIEMyMi4yMDksMjAgMjQsMTguMjA5IDI0LDE2IEMyNCwxMy43OTEgMjIuMjA5LDEyIDIwLDEyIEwwLjUyNCwxMiBDMC4xOTQsMTMuMjggMCwxNC42MTYgMCwxNiIvPjxwYXRoIGZpbGw9IiNGRUM1MTQiIGQ9Ik0yNi45MjM4LDcuNjYyMSBDMjcuNDgyOCw3LjE0NjEgMjguMDAyOCw2LjU5MzEgMjguNDc5OCw2LjAwMDEgQzI1LjU0NjgsMi4zNDYxIDIxLjA0OTgsMC4wMDAxIDE1Ljk5OTgsMC4wMDAxIEM5LjY3ODgsMC4wMDAxIDQuMjM4OCwzLjY3ODEgMS42NDM4LDkuMDAwMSBMMjMuNTEwOCw5LjAwMDEgQzI0Ljc3NjgsOS4wMDAxIDI1Ljk5MzgsOC41MTkxIDI2LjkyMzgsNy42NjIxIi8+PHBhdGggZmlsbD0iIzAwQkZCMyIgZD0iTTIzLjUxMDcsMjMgTDEuNjQzNywyMyBDNC4yMzk3LDI4LjMyMyA5LjY3ODcsMzIgMTUuOTk5NywzMiBDMjEuMDQ5NywzMiAyNS41NDY3LDI5LjY1NCAyOC40Nzk3LDI2IEMyOC4wMDI3LDI1LjQwNyAyNy40ODI3LDI0Ljg1NCAyNi45MjM3LDI0LjMzOCBDMjUuOTkzNywyMy40OCAyNC43NzY3LDIzIDIzLjUxMDcsMjMiLz48L2c+PC9zdmc+';
const SLACK_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDMyIDMyIj48ZyBmaWxsPSJub25lIj48cGF0aCBmaWxsPSIjRTAxRTVBIiBkPSJNNi44MTI5MDMyMyAzLjQwNjQ1MTYxQzYuODEyOTAzMjMgNS4yMzg3MDk2OCA1LjMxNjEyOTAzIDYuNzM1NDgzODcgMy40ODM4NzA5NyA2LjczNTQ4Mzg3IDEuNjUxNjEyOSA2LjczNTQ4Mzg3LjE1NDgzODcxIDUuMjM4NzA5NjguMTU0ODM4NzEgMy40MDY0NTE2MS4xNTQ4Mzg3MSAxLjU3NDE5MzU1IDEuNjUxNjEyOS4wNzc0MTkzNTQ4IDMuNDgzODcwOTcuMDc3NDE5MzU0OEw2LjgxMjkwMzIzLjA3NzQxOTM1NDggNi44MTI5MDMyMyAzLjQwNjQ1MTYxek04LjQ5MDMyMjU4IDMuNDA2NDUxNjFDOC40OTAzMjI1OCAxLjU3NDE5MzU1IDkuOTg3MDk2NzcuMDc3NDE5MzU0OCAxMS44MTkzNTQ4LjA3NzQxOTM1NDggMTMuNjUxNjEyOS4wNzc0MTkzNTQ4IDE1LjE0ODM4NzEgMS41NzQxOTM1NSAxNS4xNDgzODcxIDMuNDA2NDUxNjFMMTUuMTQ4Mzg3MSAxMS43NDE5MzU1QzE1LjE0ODM4NzEgMTMuNTc0MTkzNSAxMy42NTE2MTI5IDE1LjA3MDk2NzcgMTEuODE5MzU0OCAxNS4wNzA5Njc3IDkuOTg3MDk2NzcgMTUuMDcwOTY3NyA4LjQ5MDMyMjU4IDEzLjU3NDE5MzUgOC40OTAzMjI1OCAxMS43NDE5MzU1TDguNDkwMzIyNTggMy40MDY0NTE2MXoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMTYuNzc0KSIvPjxwYXRoIGZpbGw9IiMzNkM1RjAiIGQ9Ik0xMS44MTkzNTQ4IDYuODEyOTAzMjNDOS45ODcwOTY3NyA2LjgxMjkwMzIzIDguNDkwMzIyNTggNS4zMTYxMjkwMyA4LjQ5MDMyMjU4IDMuNDgzODcwOTcgOC40OTAzMjI1OCAxLjY1MTYxMjkgOS45ODcwOTY3Ny4xNTQ4Mzg3MSAxMS44MTkzNTQ4LjE1NDgzODcxIDEzLjY1MTYxMjkuMTU0ODM4NzEgMTUuMTQ4Mzg3MSAxLjY1MTYxMjkgMTUuMTQ4Mzg3MSAzLjQ4Mzg3MDk3TDE1LjE0ODM4NzEgNi44MTI5MDMyMyAxMS44MTkzNTQ4IDYuODEyOTAzMjN6TTExLjgxOTM1NDggOC40OTAzMjI1OEMxMy42NTE2MTI5IDguNDkwMzIyNTggMTUuMTQ4Mzg3MSA5Ljk4NzA5Njc3IDE1LjE0ODM4NzEgMTEuODE5MzU0OCAxNS4xNDgzODcxIDEzLjY1MTYxMjkgMTMuNjUxNjEyOSAxNS4xNDgzODcxIDExLjgxOTM1NDggMTUuMTQ4Mzg3MUwzLjQ4Mzg3MDk3IDE1LjE0ODM4NzFDMS42NTE2MTI5IDE1LjE0ODM4NzEuMTU0ODM4NzEgMTMuNjUxNjEyOS4xNTQ4Mzg3MSAxMS44MTkzNTQ4LjE1NDgzODcxIDkuOTg3MDk2NzcgMS42NTE2MTI5IDguNDkwMzIyNTggMy40ODM4NzA5NyA4LjQ5MDMyMjU4TDExLjgxOTM1NDggOC40OTAzMjI1OHoiLz48cGF0aCBmaWxsPSIjMkVCNjdEIiBkPSJNOC40MTI5MDMyMyAxMS44MTkzNTQ4QzguNDEyOTAzMjMgOS45ODcwOTY3NyA5LjkwOTY3NzQyIDguNDkwMzIyNTggMTEuNzQxOTM1NSA4LjQ5MDMyMjU4IDEzLjU3NDE5MzUgOC40OTAzMjI1OCAxNS4wNzA5Njc3IDkuOTg3MDk2NzcgMTUuMDcwOTY3NyAxMS44MTkzNTQ4IDE1LjA3MDk2NzcgMTMuNjUxNjEyOSAxMy41NzQxOTM1IDE1LjE0ODM4NzEgMTEuNzQxOTM1NSAxNS4xNDgzODcxTDguNDEyOTAzMjMgMTUuMTQ4Mzg3MSA4LjQxMjkwMzIzIDExLjgxOTM1NDh6TTYuNzM1NDgzODcgMTEuODE5MzU0OEM2LjczNTQ4Mzg3IDEzLjY1MTYxMjkgNS4yMzg3MDk2OCAxNS4xNDgzODcxIDMuNDA2NDUxNjEgMTUuMTQ4Mzg3MSAxLjU3NDE5MzU1IDE1LjE0ODM4NzEuMDc3NDE5MzU0OCAxMy42NTE2MTI5LjA3NzQxOTM1NDggMTEuODE5MzU0OEwuMDc3NDE5MzU0OCAzLjQ4Mzg3MDk3Qy4wNzc0MTkzNTQ4IDEuNjUxNjEyOSAxLjU3NDE5MzU1LjE1NDgzODcxIDMuNDA2NDUxNjEuMTU0ODM4NzEgNS4yMzg3MDk2OC4xNTQ4Mzg3MSA2LjczNTQ4Mzg3IDEuNjUxNjEyOSA2LjczNTQ4Mzg3IDMuNDgzODcwOTdMNi43MzU0ODM4NyAxMS44MTkzNTQ4eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTYuNzc0KSIvPjxwYXRoIGZpbGw9IiNFQ0IyMkUiIGQ9Ik0zLjQwNjQ1MTYxIDguNDEyOTAzMjNDNS4yMzg3MDk2OCA4LjQxMjkwMzIzIDYuNzM1NDgzODcgOS45MDk2Nzc0MiA2LjczNTQ4Mzg3IDExLjc0MTkzNTUgNi43MzU0ODM4NyAxMy41NzQxOTM1IDUuMjM4NzA5NjggMTUuMDcwOTY3NyAzLjQwNjQ1MTYxIDE1LjA3MDk2NzcgMS41NzQxOTM1NSAxNS4wNzA5Njc3LjA3NzQxOTM1NDggMTMuNTc0MTkzNS4wNzc0MTkzNTQ4IDExLjc0MTkzNTVMLjA3NzQxOTM1NDggOC40MTI5MDMyMyAzLjQwNjQ1MTYxIDguNDEyOTAzMjN6TTMuNDA2NDUxNjEgNi43MzU0ODM4N0MxLjU3NDE5MzU1IDYuNzM1NDgzODcuMDc3NDE5MzU0OCA1LjIzODcwOTY4LjA3NzQxOTM1NDggMy40MDY0NTE2MS4wNzc0MTkzNTQ4IDEuNTc0MTkzNTUgMS41NzQxOTM1NS4wNzc0MTkzNTQ4IDMuNDA2NDUxNjEuMDc3NDE5MzU0OEwxMS43NDE5MzU1LjA3NzQxOTM1NDhDMTMuNTc0MTkzNS4wNzc0MTkzNTQ4IDE1LjA3MDk2NzcgMS41NzQxOTM1NSAxNS4wNzA5Njc3IDMuNDA2NDUxNjEgMTUuMDcwOTY3NyA1LjIzODcwOTY4IDEzLjU3NDE5MzUgNi43MzU0ODM4NyAxMS43NDE5MzU1IDYuNzM1NDgzODdMMy40MDY0NTE2MSA2LjczNTQ4Mzg3eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTYuNzc0IDE2Ljc3NCkiLz48L2c+PC9zdmc+';
const AI_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSIjOEE2M0QyIj48cGF0aCBkPSJNMTAuNDQ3IDExLjUyM0M5LjgyNiAxMi43NjcgOC41OSAxMyA4IDEzYy0uNTkgMC0xLjgyNi0uMjMzLTIuNDQ3LTEuNDc3bC44OTQtLjQ0N0M2LjgyNiAxMS44MzMgNy41OSAxMiA4IDEyYy40MSAwIDEuMTc0LS4xNjcgMS41NTMtLjkyNGwuODk0LjQ0N1oiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjUgN2ExLjUgMS41IDAgMSAxIDAgMyAxLjUgMS41IDAgMCAxIDAtM1ptMCAxYS41LjUgMCAxIDAgMCAxIC41LjUgMCAwIDAgMC0xWm01LTFhMS41IDEuNSAwIDEgMSAwIDMgMS41IDEuNSAwIDAgMSAwLTNabTAgMWEuNS41IDAgMSAwIDAgMSAuNS41IDAgMCAwIDAtMVoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTggMGExLjUgMS41IDAgMCAxIC41IDIuOTEyVjRIMTFhMyAzIDAgMCAxIDMgM2gxbC4xMDIuMDA1QTEgMSAwIDAgMSAxNiA4djNhMSAxIDAgMCAxLTEgMWgtMXYyYTEgMSAwIDAgMS0xIDFIM2ExIDEgMCAwIDEtMS0xdi0ySDFhMSAxIDAgMCAxLTEtMVY4YTEgMSAwIDAgMSAxLTFoMWEzIDMgMCAwIDEgMy0zaDIuNVYyLjkxMkExLjQ5OCAxLjQ5OCAwIDAgMSA4IDBaTTUgNWEyIDIgMCAwIDAtMiAydjdoMTBWN2EyIDIgMCAwIDAtMi0ySDVabS00IDZoMVY4SDF2M1ptMTMgMGgxVjhoLTF2M1pNOCAxYS41LjUgMCAxIDAgMCAxIC41LjUgMCAwIDAgMC0xWiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+';

// A small gold "token" coin, shown on AI steps next to the total tokens used.
const TOKEN_COIN_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iI0Y1QTcwMCIgc3Ryb2tlPSIjQjU3MjAwIiBzdHJva2Utd2lkdGg9IjEiLz48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNC42IiBmaWxsPSJub25lIiBzdHJva2U9IiNCNTcyMDAiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iLjU1Ii8+PHBhdGggZmlsbD0iI0I1NzIwMCIgZD0iTTggNC4zYy0xIDAtMS44LjUtMS44IDEuNCAwIDEgLjkgMS4zIDEuNyAxLjUuNi4yIDEgLjMgMSAuNyAwIC4zLS4zLjUtLjguNS0uNiAwLTEtLjMtMS0uOEg2LjJjMCAuOS43IDEuNSAxLjUgMS42di44aC44di0uOGMxLS4xIDEuNi0uNyAxLjYtMS41IDAtMS0uOS0xLjMtMS43LTEuNS0uNi0uMi0xLS4zLTEtLjcgMC0uMy4zLS40LjctLjQuNSAwIC44LjIuOC43aDFjMC0uOC0uNi0xLjQtMS40LTEuNVY0LjNIOHoiLz48L3N2Zz4=';

/** Total LLM tokens an AI step reported, from `output.metadata.tokenUsage.totalTokens`. */
const totalTokensUsed = (meta?: WorkflowMeta): number | undefined => {
  const usage = (meta?.output as { metadata?: { tokenUsage?: { totalTokens?: unknown } } } | undefined)?.metadata
    ?.tokenUsage?.totalTokens;
  return typeof usage === 'number' ? usage : undefined;
};

/** External-connector badge presets, matched by `connectorType`. Bundled steps are absent by design. */
const CONNECTOR_BADGES: Array<{ match: (t: string) => boolean; name: string; icon: string }> = [
  { match: (t) => t.startsWith('elasticsearch'), name: 'Elasticsearch', icon: ELASTICSEARCH_ICON },
  { match: (t) => t.startsWith('ai.'), name: 'AI', icon: AI_ICON },
  { match: (t) => t === 'slack', name: 'Slack', icon: SLACK_ICON },
];

const connectorPreset = (type?: string) => (type ? CONNECTOR_BADGES.find((c) => c.match(type)) : undefined);

const STATUS_COLOR: Record<string, TraceSpanBadge['color']> = {
  completed: 'success',
  failed: 'danger',
  running: 'primary',
  waiting: 'warning',
};

// A span is the failure *origin* when it failed but no child failed — i.e. the
// error started here rather than bubbling up from a descendant. Only the origin
// gets a `failed` badge, so the whole ancestor chain isn't flagged as failed.
const hasFailedChild = (id: string) =>
  DATA.some((d) => d.parentId === id && (d.meta as WorkflowMeta | undefined)?.status === 'failed');
const isFailureOrigin = (datum: TraceDatum) =>
  (datum.meta as WorkflowMeta | undefined)?.status === 'failed' && !hasFailedChild(datum.id);

const badgeAccessor: TraceSpanBadgeAccessor = (datum) => {
  const meta = datum.meta as WorkflowMeta | undefined;

  // Only external connectors carry badges; built-in steps and the root render none.
  const preset = connectorPreset(meta?.connectorType);
  if (!preset) return [];

  const badges: TraceSpanBadge[] = [
    {
      id: 'connector',
      image: { src: preset.icon },
      text: preset.name,
      ariaLabel: `${preset.name} connector`,
      visibleIn: ['gutter', 'inline', 'none'],
      color: 'hollow',
    },
  ];

  // AI steps: show total LLM tokens used with a coin icon.
  if (meta?.connectorType?.startsWith('ai.')) {
    const tokens = totalTokensUsed(meta);
    if (tokens !== undefined) {
      badges.push({
        id: 'tokens',
        image: { src: TOKEN_COIN_ICON },
        text: `${tokens.toLocaleString()} tokens`,
        ariaLabel: `${tokens} tokens used`,
        color: 'hollow',
        visibleIn: ['gutter', 'inline', 'none'],
      });
    }
  }

  // Status chip only when it's notable: `completed` is the happy path (no chip),
  // and `failed` is shown only on the true origin, not the ancestors it bubbled up through.
  const status = meta?.status;
  const notable = status !== undefined && status !== 'completed';
  if (notable && (status !== 'failed' || isFailureOrigin(datum))) {
    badges.push({
      id: 'status',
      text: status,
      color: STATUS_COLOR[status] ?? 'default',
      visibleIn: ['gutter', 'inline', 'none'],
    });
  }

  return badges;
};

// Color lanes by connector family so each connector type reads as its own hue;
// the root workflow span (no connectorType) falls back to `workflow`.
const BY_CONNECTOR = (datum: TraceDatum) => {
  const meta = datum.meta as WorkflowMeta | undefined;
  return meta?.connectorType ?? 'workflow';
};

// ── Custom tooltip (timing + connector + status + I/O + error) ────────────────

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
const ROW: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 };
const MUTED: React.CSSProperties = { color: '#9ca3af' };

const ioSummary = (val: Record<string, unknown>): string => {
  const bytes = JSON.stringify(val).length;
  const keys = Object.keys(val);
  const shown = keys.slice(0, 3).join(', ');
  const extra = keys.length > 3 ? ` +${keys.length - 3}` : '';
  return `{ ${shown}${extra} }  ·  ~${bytes} B`;
};

const IoPre = ({ value, accent }: { value: Record<string, unknown>; accent: string }) => (
  <pre
    className="echTooltip__tableBody"
    style={{
      margin: 0,
      fontSize: 10,
      lineHeight: 1.5,
      background: `${accent}12`,
      border: `1px solid ${accent}30`,
      borderRadius: 3,
      padding: '4px 6px',
      overflow: 'auto',
      maxHeight: 180,
      whiteSpace: 'pre',
      color: 'inherit',
      opacity: 0.9,
    }}
  >
    {JSON.stringify(value, null, 2)}
  </pre>
);

const WorkflowTooltip: CustomTooltip = ({ values, backgroundColor, pinned }) => {
  const datum = values[0]?.datum as TraceDatum | undefined;
  if (!datum) return null;

  const meta = datum.meta as WorkflowMeta | undefined;
  const { connectorType, status, input, output, error } = meta ?? {};
  const preset = connectorPreset(connectorType);
  const hasIO = input !== undefined || output !== undefined;

  return (
    <div
      style={{
        padding: '8px 12px',
        minWidth: 240,
        maxWidth: pinned ? 420 : 320,
        fontFamily: 'monospace',
        fontSize: 12,
        background: backgroundColor,
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: pinned ? 'auto' : 'none',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, wordBreak: 'break-word' }}>{datum.name}</div>

      {(preset || status) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          {preset && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <img src={preset.icon} width={12} height={12} alt="" />
              {preset.name}
            </span>
          )}
          {status && (
            <span style={{ fontWeight: 700, color: status === 'failed' ? '#ef4444' : '#10b981' }}>{status}</span>
          )}
        </div>
      )}

      {values.map((v) => (
        <div key={v.label} style={ROW}>
          <span style={MUTED}>{v.label}</span>
          <span>{v.formattedValue}</span>
        </div>
      ))}

      {error && (
        <div style={{ ...DIVIDER, color: '#ef4444', wordBreak: 'break-word' }}>
          <span style={{ fontWeight: 700 }}>{error.type}: </span>
          {error.message}
        </div>
      )}

      {hasIO && (
        <div style={DIVIDER}>
          {!pinned ? (
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

      {!pinned && hasIO && (
        <div style={{ ...DIVIDER, fontSize: 10, color: '#9ca3af', textAlign: 'center', paddingBottom: 0 }}>
          Right-click to pin for full I/O
        </div>
      )}
    </div>
  );
};

// ── Span data (generated from run 712b5f0c via ES|QL + _source enrichment) ────

const DATA: TraceDatum[] = [
  {
    id: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    name: 'Digest workflow',
    start: 1785313669674,
    end: 1785313672154,
    traceId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    meta: {
      workflowId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
      status: 'failed',
      error: { type: 'Error', message: 'Connector one-workflow-playground not found' },
      input: {},
    } satisfies WorkflowMeta,
  },
  {
    id: '8beb2517feac4f87d63332c4cef08bf3ba7d4bfc7ce5921b4024a7c19829c4a6',
    name: 'search_commit_messages [elasticsearch.request]',
    start: 1785313669705,
    end: 1785313669712,
    parentId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    traceId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    meta: {
      workflowId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
      connectorType: 'elasticsearch.request',
      status: 'completed',
      input: {
        method: 'GET',
        path: '/indexed_commits_v1/_search',
        body: {
          query: {
            bool: {
              filter: [
                { match_phrase: { 'commit.message': 'One Workflow' } },
                { range: { 'commit.author.date': { gte: 'now-7d/d', lte: 'now' } } },
              ],
            },
          },
          size: 50,
        },
      },
      output: {
        took: 0,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
      },
    } satisfies WorkflowMeta,
  },
  {
    id: 'f826a17a7d064b5cee81ad8d1b9995bc8632d3934feb64d8e73aa8ea6a637da6',
    name: 'commits_count_check [if]',
    start: 1785313669740,
    end: 1785313672108,
    parentId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    traceId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    meta: {
      workflowId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
      connectorType: 'if',
      status: 'failed',
      input: {
        rawCondition: 'steps.search_commit_messages.output.hits.hits.length > 0',
        condition: 'steps.search_commit_messages.output.hits.hits.length > 0',
        conditionResult: false,
      },
      error: { type: 'Error', message: 'Connector one-workflow-playground not found' },
    } satisfies WorkflowMeta,
  },
  {
    id: 'cf5cce84426336d91d7f3c74b10d3bef234c446e307e769f4a1c6dd46813eaf1',
    name: 'generate_empty_updates [ai.prompt]',
    start: 1785313669763,
    end: 1785313672053,
    parentId: 'f826a17a7d064b5cee81ad8d1b9995bc8632d3934feb64d8e73aa8ea6a637da6',
    traceId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    meta: {
      workflowId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
      connectorType: 'ai.prompt',
      status: 'completed',
      input: {
        prompt: `## Role...`,
        temperature: 0.6,
      },
      output: {
        metadata: { tokenUsage: { promptTokens: 224, totalTokens: 311, completionTokens: 87 } },
        content: `👋 **Weekly Workflows Execution Engine Update**...`,
      },
    } satisfies WorkflowMeta,
  },
  {
    id: '8268015efbe6bb08198ad426b6e7fedfe61f1dd81aff7437cfb6e691e10fdb78',
    name: 'post_empty_update [slack]',
    start: 1785313672079,
    end: 1785313672094,
    parentId: 'f826a17a7d064b5cee81ad8d1b9995bc8632d3934feb64d8e73aa8ea6a637da6',
    traceId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
    meta: {
      workflowId: '712b5f0c-d931-4462-b6b7-38f594e6229a',
      connectorType: 'slack',
      status: 'failed',
      input: {
        message: `👋 **Weekly Workflows Execution Engine Update**
Hello, Workflow Enthusiasts! ...`,
      },
      error: { type: 'Error', message: 'Connector one-workflow-playground not found' },
    } satisfies WorkflowMeta,
  },
];

// ── Story ────────────────────────────────────────────────────────────────────

export const Example: ChartsStory = (_, { title, description }) => {
  // Annotations carry no built-in tooltip; hover metadata drives this overlay.
  const [hovered, setHovered] = useState<string | null>(null);

  const onElementOver: ElementOverListener = (elements) => {
    const event = elements.find(isTraceAnnotationElementEvent);
    if (!event) return;
    const meta = event.annotation.meta as { tip?: string } | undefined;
    setHovered(meta?.tip ?? event.annotation.ariaLabel ?? event.annotation.id);
  };
  const onElementOut = () => {
    action('annotation out')();
    setHovered(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Chart title={title} description={description} size={{ width: '100%', height: 360 }}>
        <Settings
          baseTheme={useBaseTheme()}
          theme={{ trace: { labelPosition: 'inline', gutterLabel: { fontSize: 14 } } }}
          onElementOver={onElementOver}
          onElementOut={onElementOut}
        />
        <Tooltip customTooltip={WorkflowTooltip} />
        <Trace
          id="trace_kibana_workflow_connectors"
          data={DATA}
          xScaleType="linear"
          traceId={RUN}
          colorBy={BY_CONNECTOR}
          badgeAccessor={badgeAccessor}
        >
          {/* When the failure occurred, on the time axis. */}
          <TraceTimeAnnotation
            id="failure-time"
            time={FAILURE_TIME}
            placement="timebar"
            color="danger"
            ariaLabel="Failure time"
            meta={{ tip: `Failed at ${new Date(FAILURE_TIME).toISOString()} — ${FAILURE_MESSAGE}` }}
          />
          {/* Failure origin: the slack step whose connector was missing. */}
          <TraceLaneAnnotation
            id="failure-origin"
            spanId={SLACK_SPAN}
            color="danger"
            ariaLabel="Failed step: post_empty_update"
            meta={{ tip: `post_empty_update failed — ${FAILURE_MESSAGE}` }}
          />
          {/* Failure propagation: segmented rail along root → if → slack. */}
          <TraceHierarchyAnnotation
            id="failure-path"
            spanId={SLACK_SPAN}
            color="danger"
            ariaLabel="Failure propagation path"
            meta={{ tip: 'Failure path: Digest workflow → commits_count_check → post_empty_update' }}
          />
        </Trace>
      </Chart>
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
          }}
        >
          {hovered}
        </div>
      )}
    </div>
  );
};

Example.parameters = {
  markdown:
    'Kibana workflow execution trace built from **real `.workflows-executions` data** ' +
    '(the scheduled *Digest workflow*: search commits → branch → AI-summarize → post to Slack). ' +
    'It failed because the Slack connector was missing.\n\n' +
    '- **Connector icons** — each span carries `meta.connectorType`; `badgeAccessor` maps external ' +
    'connectors to their real logo badge (`Elasticsearch`, `AI`, `Slack`, as base64 data-URLs of the ' +
    'EUI marks Kibana uses). Built-in flow-control steps (`if`, `foreach`, `wait`, …) and the ' +
    'workflow root get no badge.\n' +
    '- **status chip** — only notable statuses get a chip: `completed` (the happy path) shows none, ' +
    'and `failed` is shown only on the failure *origin* (`post_empty_update`), not on the ancestors ' +
    'it bubbled up through.\n' +
    '- **colorBy** — lanes are colored by connector family via `BY_CONNECTOR`.\n' +
    '- **failure annotations** — a `TraceTimeAnnotation` (danger) marks *when* it failed on the time ' +
    'axis, a `TraceLaneAnnotation` (danger) marks the failing `slack` step (the connector origin), ' +
    'and a `TraceHierarchyAnnotation` (danger) draws a segmented rail along the failure propagation ' +
    'path (Digest workflow → commits_count_check → post_empty_update). Hover any of them to drive ' +
    'the top-right overlay from `annotation.meta`.\n' +
    '- **Tooltip** — hover for connector + status + timing and compact `IN`/`OUT` badges; ' +
    'right-click to pin for full request/response JSON. The failed `if` and `slack` spans surface ' +
    'the connector error.',
};
