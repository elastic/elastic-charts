/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { ChartsStory } from '../../types';

// ---------------------------------------------------------------------------
// Feature inventory table
// ---------------------------------------------------------------------------

interface FeatureRow {
  category: string;
  feature: string;
  api: string;
  stories: string[];
}

const FEATURES: FeatureRow[] = [
  // Data
  {
    category: 'Data',
    feature: 'Span waterfall (bars + segments)',
    api: 'data: TraceDatum[]',
    stories: ['Renderer', 'Interactive'],
  },
  {
    category: 'Data',
    feature: 'Self-time computation',
    api: 'activeSegments (implicit when omitted)',
    stories: ['Self Time Debug'],
  },
  {
    category: 'Data',
    feature: 'OTLP / OpenTelemetry import',
    api: 'fromOtlp()',
    stories: ['Kibana Trace', 'Chrome Network', 'Lane Order'],
  },
  { category: 'Data', feature: 'Multi-trace combined view', api: 'traceId filter', stories: ['Multi Trace'] },
  // Layout
  {
    category: 'Layout',
    feature: 'Wall-clock time axis',
    api: "xScaleType: 'time'",
    stories: ['Time Bar', 'Kibana Trace'],
  },
  {
    category: 'Layout',
    feature: 'Elapsed-time axis',
    api: "xScaleType: 'linear'",
    stories: ['Time Bar', 'Overview Sync'],
  },
  { category: 'Layout', feature: 'Lane ordering', api: "laneOrder: 'tree' | 'chronological'", stories: ['Lane Order'] },
  {
    category: 'Layout',
    feature: 'Responsive labels',
    api: "theme.trace.labelPosition: 'gutter' | 'inline' | 'none'",
    stories: ['Responsive Labels'],
  },
  // Colors
  {
    category: 'Colors',
    feature: 'Color by attribute',
    api: 'colorBy, colorByOtelAttribute(), colorByOtelKind()',
    stories: ['Color By', 'Lane Order'],
  },
  { category: 'Colors', feature: 'Segment phase palette', api: 'activeSegments[].label', stories: ['Segment Phases'] },
  // Interaction
  { category: 'Interaction', feature: 'Pan + wheel zoom', api: 'drag / wheel (built-in)', stories: ['Interactive'] },
  { category: 'Interaction', feature: 'Brush-to-zoom', api: "dragMode: 'brush'", stories: ['Brush Zoom'] },
  {
    category: 'Interaction',
    feature: 'Hover tooltip',
    api: 'showTooltipOverEmpty, customTooltip',
    stories: ['Tooltip Events', 'Kibana Workflow'],
  },
  {
    category: 'Interaction',
    feature: 'Pinnable tooltip',
    api: 'right-click / context-menu',
    stories: ['Pinned Tooltip', 'Kibana Workflow'],
  },
  {
    category: 'Interaction',
    feature: 'Keyboard navigation',
    api: 'showKeyboardFocusBadge (↑↓←→ +− Enter Esc)',
    stories: ['Accessibility'],
  },
  // Selection
  {
    category: 'Selection',
    feature: 'Click / multi-select',
    api: 'onElementClick, onElementOver',
    stories: ['Segment Selection'],
  },
  {
    category: 'Selection',
    feature: 'Controlled selection',
    api: 'selection, onSelectionChange',
    stories: ['Segment Selection Controlled'],
  },
  // Navigation
  {
    category: 'Navigation',
    feature: 'Scroll-to-span (imperative)',
    api: 'controlProviderCallback, TraceSearchProvider + useTraceSearch()',
    stories: ['Scroll To Lane'],
  },
  // Composition
  {
    category: 'Composition',
    feature: 'Overview + detail sync',
    api: 'focusDomain, onFocusDomainChange',
    stories: ['Overview Sync'],
  },
  // Empty states
  {
    category: 'Empty states',
    feature: 'No-data state (DOM overlay)',
    api: 'data={[]} + Settings.noResults',
    stories: ['Empty Trace'],
  },
  {
    category: 'Empty states',
    feature: 'Trace-not-found state (canvas message)',
    api: 'traceId, traceNotFoundMessage',
    stories: ['Empty Trace'],
  },
  // Accessibility
  {
    category: 'Accessibility',
    feature: 'Screen-reader table + live region',
    api: 'aria-live, ScreenReaderTraceTable (built-in)',
    stories: ['Accessibility'],
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 13,
  padding: '16px 20px',
  maxWidth: 900,
  color: '#1f2937',
};

const descStyle: React.CSSProperties = {
  marginBottom: 20,
  lineHeight: 1.6,
  color: '#374151',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  background: '#f3f4f6',
  fontWeight: 600,
  borderBottom: '2px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '5px 10px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
};

const categoryStyle: React.CSSProperties = {
  padding: '8px 10px 3px',
  color: '#6b7280',
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  background: '#fafafa',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  background: '#f3f4f6',
  borderRadius: 3,
  padding: '1px 4px',
  color: '#374151',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    const group = acc.get(k) ?? [];
    group.push(item);
    acc.set(k, group);
    return acc;
  }, new Map<string, T[]>());
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Example: ChartsStory = () => {
  const grouped = groupBy(FEATURES, (f) => f.category);

  return (
    <div style={containerStyle}>
      <p style={descStyle}>
        <strong>Trace (@alpha)</strong> is elastic-charts&apos; distributed-trace waterfall chart type. It renders a
        scrollable lane-per-span waterfall to a <code style={codeStyle}>&lt;canvas&gt;</code> element via a self-managed
        RAF loop — the same architecture as the Flame and Timeslip chart families.
      </p>
      <p style={descStyle}>
        Add a single <code style={codeStyle}>&lt;Trace id=&quot;…&quot; data={'{spans}'} /&gt;</code> inside a{' '}
        <code style={codeStyle}>&lt;Chart&gt;</code> to get a fully interactive waterfall with pan, zoom, keyboard
        navigation, selection, and screen-reader support out of the box. Supply an OTLP envelope directly via{' '}
        <code style={codeStyle}>fromOtlp()</code>, or bring your own <code style={codeStyle}>TraceDatum[]</code> array.
      </p>
      <p style={{ ...descStyle, marginBottom: 12 }}>
        The table below maps each implemented feature to the stories that demonstrate it. Use the sidebar to navigate to
        any story.
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 120 }}>Category</th>
            <th style={thStyle}>Feature</th>
            <th style={thStyle}>API / Theme surface</th>
            <th style={{ ...thStyle, width: 220 }}>Stories</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(grouped.entries()).map(([category, rows]) => (
            <React.Fragment key={category}>
              <tr>
                <td colSpan={4} style={categoryStyle}>
                  {category}
                </td>
              </tr>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td style={tdStyle} />
                  <td style={tdStyle}>{row.feature}</td>
                  <td style={tdStyle}>
                    <code style={codeStyle}>{row.api}</code>
                  </td>
                  <td style={tdStyle}>{row.stories.join(', ')}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// prettier-ignore
const markdownContent = "## `<Trace>` API Reference\n\nThe `Trace` component accepts the following props via the `Trace` spec. This table is\nauto-generated from the TypeScript types — run `yarn generate:trace-api-story` to refresh it.\n\n| Name | Type | Default | Required | Description |\n|------|------|---------|----------|-------------|\n| `badgeAccessor` | `TraceSpanBadgeAccessor` |  |  | Derives the ordered TraceSpanBadges for each span from its source `TraceDatum`. Evaluated while preparing trace data (not per animation frame), so pass a **stable or memoized reference**. Span badges are application presentation derived from a span; they do not modify the source `TraceDatum` or data produced by fromOtlp. See Spec 27. |\n| `badgeSize` | `TraceSpanBadgeSize` | `'m'` |  | One shared size for every Span badge in the Trace. Controls each badge's text, padding, height, and image box as one design unit; individual badges cannot select a different size. |\n| `collapsedSpanIds` | `string[]` |  |  | Controlled collapse state: array of span IDs whose descendant lanes are hidden. When supplied, this is the render source of truth; caret clicks and the `c` keyboard shortcut still execute and fire `onCollapseChange` — the parent decides whether to update the prop (perform-and-fire, same model as `focusDomain`/ADR 0007 and `selection`/ADR 0011). When omitted, the component manages collapse state internally (uncontrolled). Only active when `laneOrder === 'tree'` (the default); ignored with a dev-mode warning when in `'chronological'` mode. See ADR 0026. |\n| `colorBy` | `TraceColorAccessor` |  |  | Derives the color-group key for each span's active segments. Two spans that return the same key receive the same palette color (cyclic index into `theme.colors.vizColors`). Return `undefined` to fall through to the themed `activeSegmentColor` default. — Use the built-in helpers colorByOtelAttribute or colorByOtelKind for OTel data, or supply a custom function. Pass a **module-level or memoized reference** — a fresh arrow per render will rebuild the color map on every pipeline pass. — Precedence per span: explicit `TraceDatum.color` &gt; color-group color &gt; themed default. |\n| `controlProviderCallback` | `(callbacks: TraceControlCallbacks) => void` |  |  | Imperative control registration (ADR 0008). When supplied, called on mount and whenever this prop's reference changes, with the chart's live `TraceControlCallbacks`. Store the received callbacks object and call its methods to drive the chart programmatically (e.g. scroll a span into view from an external search box). — The callback must be idempotent — it is called on every re-registration (prop reference change). |\n| `criticalPath` | `TraceCriticalPath` |  |  | Consumer-supplied critical-path intervals. Each marks an interval-precise portion of a span that lay on the trace's critical path; rendered as a colored line along the bottom edge of the affected lane. An interval may cover only a sub-range of the span's `[start, end]` extent (including waiting regions). The presence of this prop is the on/off toggle — supply it to draw the line; omit it or pass `[]` to draw nothing. The chart never computes the critical path. — Times must be in the same units as TraceDatum `start`/`end`. In `'linear'` x-scale mode the chart re-zeros them internally alongside segment timestamps — supply raw pre-normalization values. When a parent lane is collapsed, its descendants' intervals roll up onto the parent lane (mirroring rolled-up active segments — see ADR 0015 Decision 4 and ADR 0026). |\n| `data` | `TraceDatum[]` |  | yes | Span data. Each element occupies exactly one lane in the waterfall. |\n| `dragMode` | `'pan' \\| 'brush'` | `'pan'` |  | Controls which gesture triggers the brush-to-zoom rubber-band. - `'pan'`: plain drag pans; `Shift`+drag draws the brush. - `'brush'`: plain drag draws the brush; `Shift`+drag pans. |\n| `focusDomain` | `[number, number]` |  |  | Controlled visible time window `[from, to]` in the chart's internal coordinates: - `'time'` x-scale: epoch-ms (same as `TraceDatum.start`/`end`). - `'linear'` x-scale: elapsed-from-zero-ms (`normalize()` re-zeros the domain to `[0, totalMs]`). — Perform-and-fire (ADR 0007): local gestures (wheel-zoom, drag-pan, brush) still execute and fire `onFocusDomainChange` even when this prop is supplied — the parent decides whether to update the prop. Change the **value** to re-drive the window; re-passing an identical value after a local gesture is a no-op (does not force-restore the window). Uncontrolled when omitted. — Pass a **stable or memoized reference** (same value → same object if possible) to avoid unnecessary change-detection overhead, though value comparison (`[0]`/`[1]`) makes inline literals safe. |\n| `id` | `string` |  | yes | unique Spec identifier |\n| `laneOrder` | `'tree' \\| 'chronological'` | `'tree'` |  | Controls the order in which spans are assigned to lanes (top → bottom). — - `'tree'` (**default**): depth-first `parentId` nesting — each parent is immediately followed by its descendants, recursively; siblings and roots are ordered by `start` ascending. Matches the Kibana APM trace view. In multi-trace mode (no `traceId` filter) this produces a forest: each subtree is grouped together rather than interleaved. - `'chronological'`: ascending by span `start` (Chrome DevTools Network panel style). Use this when the trace has no meaningful nesting or when start-time ordering is the primary concern. — See ADR 0018. |\n| `onBadgeClick` | `(event: TraceSpanBadgeEvent) => void` |  |  | Reports activation of a Span badge (pointer down+up on the same badge, or keyboard activation). When supplied, badges become interactive: pointer targets use an interactive cursor and the badge is exposed as a keyboard-activatable control in the screen-reader surface. |\n| `onBadgeOut` | `(event: TraceSpanBadgeEvent) => void` |  |  | Reports pointer exit for a Span badge. Optional and independent of `onBadgeClick`. |\n| `onBadgeOver` | `(event: TraceSpanBadgeEvent) => void` |  |  | Reports pointer entry for a Span badge. Optional and independent of `onBadgeClick`. |\n| `onCollapseChange` | `(next: string[]) => void` |  |  | Called when a caret click or `c` keypress changes the collapsed set. `next` is the new array of collapsed span IDs after the toggle. Suppressed when the set is identity-equal to the previous fire (no-op echo guard). See ADR 0026. |\n| `onDataDiagnosticsChange` | `(diagnostics: TraceDataDiagnostics) => void` |  |  | Called with a structured TraceDataDiagnostics report describing malformed, corrected, omitted, or invalid trace input found while preparing the visible output (Spec 28). This is the application-facing channel that supersedes developer-console warnings for these conditions. — Data-change driven: fires from the render pipeline only when the prepared data or spec changes the report's content, not on every animation frame and never as a render-phase side effect. Content-guarded like `onFocusDomainChange`/`onSelectionChange` — an unchanged report is not re-emitted. An empty report (`{ issues: [] }`) is emitted once for clean, non-empty prepared data so consumers can clear stale diagnostics UI. The separate no-data empty state (`data: []`) does not emit (the canvas is unmounted). |\n| `onFocusDomainChange` | `(domain: [number, number]) => void` |  |  | Called at RAF-loop stop with the settled visible window `[from, to]` (same coordinate space as `focusDomain`) whenever the window changes more than `epsilon = 0.001` of the visible extent. Covers all gesture sources (wheel-zoom, drag-pan, brush) and prop-driven view changes. Fires once on the initial mount fit-all settle and on each scale/traceId view reset. — Echo-suppressed (ADR 0007): feeding the emitted domain back as `focusDomain` does not re-arm the loop. Update `lastFiredDomain` before invoking (re-entrant-safe). |\n| `onSelectionChange` | `(next: TraceSelection, details: TraceSelectionDetail[]) => void` |  |  | Called once per completed gesture with the new thin `next` refs and rich `details`. Fires on single-click (after the ~250 ms debounce), double-click, keyboard Enter/Space, and Escape. Suppressed when the resulting set is identity-equal to the previous fire (no-op echo guard). |\n| `selection` | `TraceSelection` |  |  | Controlled selection. When supplied, this is the render source of truth; gestures still execute and fire `onSelectionChange` — the parent decides whether to update the prop (perform-and-fire, same model as `focusDomain`/ADR 0007). When omitted, the component manages selection internally. |\n| `showKeyboardFocusBadge` | `boolean` | `true` |  | When `true` (default), a small \"keyboard active\" badge appears in the top-left corner of the chart while the canvas has keyboard focus, giving sighted users a WCAG 2.4.7 focus-visible cue. Set to `false` to suppress the badge, e.g. in design mockups or when a custom focus indicator is provided externally. |\n| `showTooltipOverEmpty` | `boolean` | `false` |  | When `true`, the tooltip also appears while hovering the empty region of a lane (past the span's `[start, end]` extent). The span, not the whole lane, is the hover target when this is false. |\n| `traceId` | `string` |  |  | When set, only spans whose `traceId` matches this value are rendered. When omitted, all spans in `data` are rendered as one combined waterfall (one lane per span, interleaved by start time). An informational dev-mode warning is logged when spans from more than one trace are present and `traceId` is not set. |\n| `traceNotFoundMessage` | `string` | `'No spans found for trace \"<traceId>\"'` |  | Message drawn centered on the canvas when `traceId` is set but matches no spans (the trace-not-found empty state). The time bar and axis still render around it. — Note: this is a plain string, not a ReactNode — it is drawn directly on the canvas. `Settings.noResults` (which handles the separate no-data empty state) does not apply here. |\n| `xScaleType` | `'time' \\| 'linear'` | `'time'` | yes | Controls the x-axis scale and domain-origin semantics: - `'time'`: absolute epoch-ms; tick labels show wall-clock time. - `'linear'`: elapsed-from-zero (domain rezeroed to the earliest span start); tick labels show elapsed duration. — Both modes store domain values in milliseconds and share the same 1 ms minimum-visible-extent floor. When using `'time'`, ensure your `start`/`end` values are epoch-millisecond timestamps (e.g. `Date.now()`); small elapsed-ms values are interpreted as 1970-01-01 dates. Use `fromOtlp` (which converts OTLP nanoseconds to epoch-ms) or add your own epoch offset. |";

Example.storyName = 'Intro & API docs';
Example.parameters = { resize: { height: '480px', overflowY: 'auto' }, markdown: markdownContent };
