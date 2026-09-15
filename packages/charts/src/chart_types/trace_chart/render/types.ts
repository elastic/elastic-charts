/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../common/colors';
import { DEFAULT_FONT_FAMILY } from '../../../common/default_theme_attributes';
import type { Dimensions } from '../../../utils/dimensions';
import type { ResolvedTraceAnnotation } from '../data/annotations';
import type { NormalizedSpan } from '../data/types';
import type { TraceAnnotationType, TraceSpanBadge } from '../trace_api';

/**
 * Style configuration for the trace waterfall chart. Set via `theme.trace` on the global `Theme`.
 * @public
 */
export interface TraceStyle {
  /** Width of the left gutter that shows span names, in px. */
  gutterWidth: number;
  /** Height of the top time bar that shows tick labels, in px. */
  timeBarHeight: number;
  /** Height of each span lane, in px. */
  laneHeight: number;
  /** Thickness of the total-duration line drawn for each span, in px. */
  totalLineThickness: number;
  /**
   * Minimum rendered width (px) of a span's mark, so a very short span stays visible instead of
   * collapsing to a sub-pixel sliver on a skewed trace. Applies to the duration bar
   * (`spanDisplay: 'duration'`) and, in the default `'segments'` mode, to the total line plus a
   * guaranteed active mark for a sub-floor span. Hit-testing mirrors the floor so the whole visible
   * mark is hoverable; the span's `start`/`end` timing values are unchanged.
   * See [ADR 0036](../../../../../../../docs/adr/trace-viz/0036-skewed-duration-readability.md).
   */
  minSpanWidthPx: number;
  /** Color of the total-duration line (muted). */
  totalLineColor: Color;
  /** Color of the active (self-time) segments (stronger). */
  activeSegmentColor: Color;
  /** Font for span name labels in the gutter. */
  gutterLabel: { fontFamily: string; fontSize: number; color: Color };
  /** Where span-name labels are drawn: fixed left gutter, inline on a row below the bar, or omitted. */
  labelPosition: 'gutter' | 'inline' | 'none';
  /** Font for time-bar tick labels. */
  timeBarLabel: { fontFamily: string; fontSize: number; color: Color };
  /**
   * Number of stacked tick-label rows in the trace time bar.
   * - `0` — single row (the existing sub-second detail only; today's behavior).
   * - `2` — two rows: finest detail + absolute time (e.g. `0ms` + `22:51:13`). Default.
   * - `3` — three rows: finest detail + time + date (e.g. `0ms` + `22:51:13` + `January 13, 2022`).
   * Applies only when `xScaleType === 'time'`. `linear` mode is always single-row regardless.
   * Density gating may reduce the number of rows actually drawn below this cap when zoomed out.
   * Mirrors the XY axis `AxisSpec.timeAxisLayerCount` token so consumers have one mental model.
   */
  timeAxisLayerCount: number;
  /** Color of the faint gridlines drawn down through the plot area. */
  gridLineColor: Color;
  /**
   * Color of the tree-guide spine and elbow lines in the disclosure gutter when `showTreeGuides` is
   * true (Spec 33 / ADR 0039). Uses the theme's `borderBasePlain` hairline token so guides read as
   * faint structural marks without competing with span bars. Consumers override via `PartialTheme`.
   */
  treeGuideColor: Color;
  /** Background fill for the full-width highlight behind the keyboard-focused lane. */
  focusedLaneBackground: Color;
  /** Stroke color for the selection-highlight outline drawn around selected segments. */
  selectedSegmentStroke: Color;
  /** Stroke width in px for the selection-highlight outline. */
  selectedSegmentStrokeWidth: number;
  /** Color of the critical-path line drawn along the bottom edge of affected lanes. */
  criticalPathColor: Color;
  /** Thickness in px of the critical-path line. */
  criticalPathThickness: number;
  /** Span-badge sizing, spacing, and color treatments (Spec 27). */
  badge: TraceBadgeStyle;
  /** Trace-annotation rail/marker sizing and color treatments (Spec 29). */
  annotation: TraceAnnotationStyle;
}

/**
 * Resolved stroke/fill for one Trace-annotation color treatment (Spec 29). `stroke` draws the rail
 * or marker line; `fill` tints a time-range band at {@link TraceAnnotationStyle.fillOpacity}.
 * @public
 */
export interface TraceAnnotationColorStyle {
  stroke: Color;
  fill: Color;
}

/**
 * Trace-annotation style tokens (Spec 29): rail/marker thickness, range-band fill opacity (idle and
 * hover), and the named-color palette. A custom `Color` annotation is resolved at draw time
 * (`stroke` = the color, `fill` = the color tinted by `fillOpacity`). The minimum interactive hit
 * width is intentionally not a token — it is a private renderer constant (Spec 29 / ADR 0030).
 * @public
 */
export interface TraceAnnotationStyle {
  /** Thickness of the vertical boundary rail and time markers, in px. */
  railThickness: number;
  /** Fill opacity (0..1) applied to a time-range band when idle. */
  fillOpacity: number;
  /** Fill opacity (0..1) applied to a time-range band while hovered. */
  hoverFillOpacity: number;
  /** Size (px) of the time-bar annotation's triangular marker head at the gutter/plot boundary. */
  markerSize: number;
  /** Named EUI-like color treatments. */
  palette: Record<'default' | 'primary' | 'success' | 'warning' | 'danger', TraceAnnotationColorStyle>;
}

/**
 * Default Trace-annotation style tokens, shared by every base theme (Spec 29 / ADR 0030). The palette
 * uses theme-neutral EUI-like hues; individual base themes may override `theme.trace.annotation`.
 * @internal
 */
export const DEFAULT_TRACE_ANNOTATION_STYLE: TraceAnnotationStyle = {
  railThickness: 2,
  fillOpacity: 0.15,
  hoverFillOpacity: 0.3,
  markerSize: 6,
  palette: {
    default: { stroke: '#69707d', fill: '#69707d' },
    primary: { stroke: '#0b64dd', fill: '#0b64dd' },
    success: { stroke: '#00785a', fill: '#00785a' },
    warning: { stroke: '#f5a700', fill: '#f5a700' },
    danger: { stroke: '#bd271e', fill: '#bd271e' },
  },
};

/**
 * Per-size badge metrics in px (Spec 27). One shared `TraceSpanBadgeSize` applies to every badge in
 * a Trace; these values own the badge's text, padding, height, and image box as one design unit.
 * @public
 */
export interface TraceBadgeSizeMetrics {
  /** Total pill height. */
  height: number;
  /** Badge text font size. */
  fontSize: number;
  /** Horizontal padding inside the pill (each side). */
  paddingX: number;
  /** Square side of the image/icon box. */
  imageSize: number;
  /** Gap between the image box and the text within a badge. */
  imageTextGap: number;
}

/**
 * Resolved fill/text/border for one badge color treatment. `border` is drawn only when present
 * (e.g. the `hollow` treatment or a derived border for contrast).
 * @public
 */
export interface TraceBadgeColorStyle {
  background: Color;
  text: Color;
  border?: Color;
}

/**
 * Span-badge style tokens (Spec 27): per-size metrics, inter-badge spacing, the pill radius, the
 * minimum readable label/text widths used by overflow, and the named-color palette. A custom
 * `Color` badge is resolved at draw time (background = the color, text/border derived for contrast).
 * @public
 */
export interface TraceBadgeStyle {
  /** Metrics for the small size token. */
  s: TraceBadgeSizeMetrics;
  /** Metrics for the medium (default) size token. */
  m: TraceBadgeSizeMetrics;
  /** Font family for badge text. */
  fontFamily: string;
  /** Gap between adjacent badges in a cluster. */
  gap: number;
  /** Gap between the owning label (or bar start) and the first badge. */
  labelGap: number;
  /** Corner radius of the badge pill. */
  borderRadius: number;
  /** Minimum readable label width preserved before badges are laid out (overflow). */
  minLabelWidth: number;
  /** Minimum truncated badge text width; below this a badge is omitted rather than shown. */
  minTextWidth: number;
  /** Named EUI-like color treatments. */
  palette: Record<'default' | 'hollow' | 'primary' | 'success' | 'warning' | 'danger', TraceBadgeColorStyle>;
}

/**
 * Default Span-badge style tokens, shared by every base theme (Spec 27 / ADR 0029). Sizes mirror
 * EUI badge density; the palette uses theme-neutral EUI-like hues. Individual base themes may
 * override `theme.trace.badge` if a palette needs dark/light-specific tuning.
 * @internal
 */
export const DEFAULT_TRACE_BADGE_STYLE: TraceBadgeStyle = {
  s: { height: 16, fontSize: 10, paddingX: 4, imageSize: 10, imageTextGap: 3 },
  m: { height: 20, fontSize: 12, paddingX: 6, imageSize: 12, imageTextGap: 4 },
  fontFamily: DEFAULT_FONT_FAMILY,
  gap: 4,
  labelGap: 6,
  borderRadius: 3,
  minLabelWidth: 40,
  minTextWidth: 16,
  palette: {
    default: { background: '#e3e8f2', text: '#1a1c21' },
    hollow: { background: 'transparent', text: '#1a1c21', border: '#c2cbd6' },
    primary: { background: '#0b64dd', text: '#ffffff' },
    success: { background: '#00785a', text: '#ffffff' },
    warning: { background: '#f5a700', text: '#1a1c21' },
    danger: { background: '#bd271e', text: '#ffffff' },
  },
};

/**
 * Theme-invariant `TraceStyle` fields: dimensions, thicknesses, label position, and the shared
 * badge/annotation sub-styles. Every built-in theme's `trace` block spreads this and overrides only
 * the theme-specific colors and fonts, so these layout constants live in exactly one place. @internal
 */
export const DEFAULT_TRACE_LAYOUT: Pick<
  TraceStyle,
  | 'gutterWidth'
  | 'timeBarHeight'
  | 'timeAxisLayerCount'
  | 'laneHeight'
  | 'totalLineThickness'
  | 'minSpanWidthPx'
  | 'selectedSegmentStrokeWidth'
  | 'criticalPathThickness'
  | 'labelPosition'
  | 'badge'
  | 'annotation'
> = {
  gutterWidth: 200,
  timeBarHeight: 32,
  timeAxisLayerCount: 2,
  laneHeight: 24,
  totalLineThickness: 2,
  minSpanWidthPx: 5,
  selectedSegmentStrokeWidth: 2,
  criticalPathThickness: 2,
  labelPosition: 'gutter',
  badge: DEFAULT_TRACE_BADGE_STYLE,
  annotation: DEFAULT_TRACE_ANNOTATION_STYLE,
};

/**
 * Padding above/below the bar band within a lane (px). Shared by the renderer's bar/label geometry
 * and the badge-layout pass so both agree on where the label row and badge rows sit. @internal
 */
export const LANE_PADDING = 3;

/**
 * Width of the caret glyph zone (▶/▼) in the disclosure gutter, in px.
 * Sized to provide a comfortable click/tap target. @internal
 */
export const CARET_GLYPH_PX = 28;

/**
 * Additional px per depth level for caret indentation in the disclosure gutter. @internal
 */
export const CARET_INDENT_STEP_PX = 8;

/**
 * Additional px per depth level when `showTreeGuides` is on (Spec 33 / ADR 0037 D2 / ADR 0039).
 * Wider than `CARET_INDENT_STEP_PX` so the elbow's straight run is:
 *   step − gap − corner = 16 − 7 − 3 = 9 px
 * which reads as a connector. The 8 px default would leave a 1 px stub, and an earlier draft of 14
 * would leave 4 px — exactly the "reads as a tick mark" defect ADR 0037 D2 was written to prevent.
 * @internal
 */
export const TREE_GUIDE_INDENT_STEP_PX = 16;

/**
 * Trailing inset (px) inside the child-count reserve so the count text never crowds the gutter
 * label. Added to the measured ink width to produce `countPx`. See Spec 32 / ADR 0037 D1.
 * @internal
 */
export const CHILD_COUNT_INSET_PX = 4;

/**
 * Published disclosure-gutter sub-widths (ADR 0037 D1). Single source of truth for the caret/count
 * draw passes, `pickDisclosure`, and badge layout — none of them re-derive it.
 * @internal
 */
export interface DisclosureColumnGeometry {
  /** Caret glyph zone width (px). `CARET_GLYPH_PX` when the trace has parents; 0 otherwise. */
  caretPx: number;
  /** Measured reserve for the widest display-child-count string (px). 0 when the prop is off or
   * the trace has no parents. */
  countPx: number;
  /**
   * Effective px per depth level. `CARET_INDENT_STEP_PX` when `showTreeGuides` is false;
   * `TREE_GUIDE_INDENT_STEP_PX` when on, so the elbow has a 9 px straight run instead of the stub
   * that ADR 0037 D2 explicitly rejects. Set once in `buildGeometry`; never changes on collapse
   * toggles (ADR 0037 D2 no-reflow guarantee). See Spec 33 / ADR 0039.
   */
  indentStepPx: number;
  /** Deepest lane depth — sizes the total indent allocation. */
  maxDepth: number;
}

/**
 * Total width of the disclosure column: indent allocation + caret + count.
 *
 * Used by label-position consumers (gutter label `labelX`/`labelWidth`) that need the full
 * reserved width. `pickDisclosure` instead adds `entry.depth * indentStepPx` per lane, so the
 * two sums differ by design — see ADR 0037 Consequences.
 * @internal
 */
export function disclosureColumnWidth(c: DisclosureColumnGeometry): number {
  return c.maxDepth * c.indentStepPx + c.caretPx + c.countPx;
}

/**
 * Per-lane guide-mask entry published on `TraceGeometry.treeGuidesByLane` (Spec 33 / ADR 0039).
 * Absent for root lanes (depth 0) and when `showTreeGuides` is false (empty shared Map).
 * Built by `buildTreeGuideMap` in a single forward pass over the visible-lane DFS sequence.
 * @internal
 */
export interface TreeGuideEntry {
  /** Tree depth of this lane (≥ 1; root lanes have no entry). */
  depth: number;
  /**
   * True when this lane is the last visible display child of its parent below this lane; false means
   * the parent has at least one later child and the spine continues past this lane as a tee (`├`).
   * Determines whether the parent-spine segment uses a rounded terminating elbow (`└`) or a straight
   * tee (`├`) per ADR 0039.
   */
  isLastChild: boolean;
  /**
   * Lane index (in the current visible-lane array) of the display parent. Used to derive the spine's
   * start y for the first child: DFS guarantees the first child is always at `parentLane + 1`, so the
   * spine can join just below the parent's caret ink without an extra field. See ADR 0039.
   */
  parentLane: number;
}

/**
 * One entry in `TraceGeometry.disclosureByLane` — describes the collapse caret for a parent lane.
 * @internal
 */
export interface DisclosureEntry {
  /** Whether the parent's children are currently hidden. */
  state: 'collapsed' | 'expanded';
  /** Tree depth of this span (root = 0); used to indent the caret. */
  depth: number;
  /** Total number of descendants in the original (pre-collapse) tree; used for the aria announcement. */
  descendantCount: number;
  /** Number of direct display children in the pre-collapse tree. Used to draw the count beside the
   * caret when `showDisplayChildCount` is true (Spec 32 / ADR 0037 D1). */
  childCount: number;
}

/**
 * Returns the effective left gutter width for layout and coordinate math.
 *
 * In `'gutter'` mode the gutter shows span-name labels plus (when parents exist) the disclosure column.
 * In `'inline'` and `'none'` modes there are no label columns but **when the trace has parent
 * spans** a minimal disclosure-gutter column is still reserved so carets render in all label modes
 * (Spec 21 / ADR 0026). Flat traces (no parents) reserve nothing → no regression for the common
 * non-nested case.
 * @internal
 */
export function gutterPx(
  style: TraceStyle,
  opts?: { hasParents?: boolean; maxDepth?: number; childCountPx?: number; indentStepPx?: number },
): number {
  const caretColumnWidth = opts?.hasParents
    ? CARET_GLYPH_PX + (opts.maxDepth ?? 0) * (opts.indentStepPx ?? CARET_INDENT_STEP_PX) + (opts.childCountPx ?? 0)
    : 0;
  return style.labelPosition === 'gutter' ? style.gutterWidth + caretColumnWidth : caretColumnWidth;
}

/**
 * One laid-out Span badge within a lane (Spec 27). Produced by the badge-layout pass with a text
 * measurer, then consumed by the badge draw pass (Phase 4) and `pickBadge` (Phase 5). Coordinates
 * are canvas px in the same space as `TraceGeometry.plot`/`gutter` (already scroll-adjusted for y).
 * @internal
 */
export interface BadgeLayoutItem {
  /** The original badge object, retained by reference for interaction events. */
  badge: TraceSpanBadge;
  /** Pill rectangle (hit-test + fill bounds). */
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * The text actually drawn — already trimmed and, when space is tight, truncated with an ellipsis.
   * `undefined` for an image-only badge (or a badge whose text did not fit its minimum width).
   */
  text?: string;
  /** Image box (canvas px) when the badge has a usable image; `undefined` otherwise. */
  image?: { src: string; crossOrigin: 'anonymous' | 'use-credentials'; x: number; y: number; size: number };
  /** X where badge text begins (after the image box + gap when an image is present). */
  textX: number;
  /** Font size (px) for the badge text — from the active size token; carried so the draw pass need not re-derive it. */
  fontSize: number;
  /** The resolved accessible name (visible text, else `ariaLabel`, else a generated fallback). */
  ariaLabel: string;
}

/**
 * The laid-out Span badges for one lane, plus any inline-label adjustment they force (Spec 27).
 * In `'inline'` mode a badge cluster is drawn adjacent to the label; when the label+badges combination
 * would overflow the right edge, the whole group is shifted left (breaking bar-start alignment), which
 * the renderer applies via `labelX`. `gutter`/`none` modes leave `labelX` undefined.
 * @internal
 */
export interface LaneBadgeLayout {
  /** Inline-mode label draw x after any right-edge shift; `undefined` → renderer uses the bar start. */
  labelX?: number;
  /** Laid-out badge items in accessor order (overflow already truncated/omitted from the end). */
  items: readonly BadgeLayoutItem[];
}

/** An axis-aligned rectangle in canvas px (fill band or hit band). @internal */
export interface AnnotationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A straight line segment in canvas px (a rail segment, time marker, or range edge). @internal */
export interface AnnotationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * One laid-out Trace annotation (Spec 29), produced per frame by `layoutAnnotations` and consumed by
 * `drawAnnotations` and `pickAnnotation`. Coordinates are canvas px in the same space as
 * `TraceGeometry.plot` (already scroll-adjusted for y). Domain culling, viewport clipping, and
 * collapse omission have already been applied — an item here is visible and interactive.
 * @internal
 */
export interface AnnotationLayoutItem {
  id: string;
  kind: TraceAnnotationType;
  /** The resolved annotation, retained by reference for interaction events. */
  annotation: ResolvedTraceAnnotation;
  /** Resolved stroke/fill for the annotation's color intent. */
  colors: TraceAnnotationColorStyle;
  /** Filled range band across the plot ('plot'-placement time ranges only). */
  band?: AnnotationRect;
  /** Filled band in the lower half of the time bar ('timebar'-placement time ranges only, Spec 29). */
  timeBarBand?: AnnotationRect;
  /** Rail/marker lines to stroke: time point/edges, or lane/hierarchy rail segments. */
  lines: AnnotationLine[];
  /** Time-bar triangular marker heads at the gutter/plot boundary ('timebar' placement, Spec 29). */
  markers?: { x: number; y: number }[];
  /** Thin hit bands (min interactive width applied): point band, range edges, or rail bands. */
  hitRects: AnnotationRect[];
}

/**
 * The pure layout model produced by `buildGeometry`. Every field downstream consumers (time bar,
 * canvas renderer, picking) need is present here; no external mutable state is read at draw time.
 * @internal
 */
export interface TraceGeometry {
  /** Spans in visible lane order (tree topology, or start-ascending in chronological mode); post-collapse. */
  spans: NormalizedSpan[];
  /** The fixed left gutter region (x=0, y=0, width=gutterWidth, height=canvasHeight). */
  gutter: Dimensions;
  /** The fixed top time bar region (x=gutterWidth, y=0, width=plotWidth, height=timeBarHeight). */
  timeBar: Dimensions;
  /** The scrollable plot region below the time bar and to the right of the gutter. */
  plot: Dimensions;
  /** Lane height in px (same as TraceStyle.laneHeight). */
  laneHeight: number;
  /**
   * Height (px) of the inline label/badge row at the bottom of each lane in `'inline'` Label position
   * (0 in `'gutter'`/`'none'`). Sized to fit the taller of the label text and — when the trace has
   * Span badges — the active badge size, so inline badges never spill into the bar band (Spec 27).
   * The renderer's bar/label split and the badge-layout pass both read this so they agree.
   */
  labelBandPx: number;
  /** Full trace extent across all spans (used for reset/fit). */
  domain: { min: number; max: number };
  /** Current zoom window (eased by the caller; identical to domain when no zoom is active). */
  focusDomain: { min: number; max: number };
  /** Vertical scroll offset in px (1 unit = 1 px); passed through unchanged. */
  scrollOffset: number;
  /** Which x-scale the trace uses; controls raster-engine and time-bar unit selection. */
  xScaleType: 'time' | 'linear';
  /**
   * How each span bar is drawn (ADR 0035): `'segments'` draws the thin total line plus active-segment
   * rects; `'duration'` fills the full `[start, end]` extent with the span's color-group color. Purely
   * visual — `activeSegments` (and therefore `selfTime`, tooltip, events, SR) are unaffected.
   */
  spanDisplay: 'segments' | 'duration';
  /**
   * Minimum rendered/hit width (px) of a span's mark (ADR 0036 / B1); mirrors `TraceStyle.minSpanWidthPx`.
   * The draw pass floors a short span's mark to this width and `pickRegion` widens the span's hit area
   * to match, so a floored (sub-pixel) span is hoverable across the whole visible mark.
   */
  minSpanWidthPx: number;
  /**
   * The lane currently focused by keyboard navigation, or `null` when no lane is focused.
   * Distinct from `hoverIndex` (mouse-driven). Drawn as a full-width background highlight.
   */
  focusedLaneIndex: number | null;
  /**
   * Resolved selection entries, filtered to refs that exist in the current span array and have
   * valid `segmentIndex` values. Deduplicated: segment entries subsumed by a same-span `'span'`
   * entry are dropped. Built by `buildGeometry`; consumed by the selection-highlight draw pass.
   */
  resolvedSelection: ReadonlyArray<{ laneIndex: number; region: 'span' | 'active' | 'waiting'; segmentIndex?: number }>;
  /**
   * Maps a time value (ms) to an x pixel coordinate within the plot, based on `focusDomain`.
   * Returns `plot.left` when the domain is zero-width (degenerate guard).
   */
  scale: (tMs: number) => number;
  /**
   * When non-null, drawn centered on the canvas plot area after the time bar renders.
   * Set by `frame()` in `trace_chart.tsx` for the `trace-not-found` empty state; `null` otherwise.
   */
  emptyMessage: string | null;
  /**
   * Disclosure carets for parent lanes (tree mode only). Key = lane index in the visible `spans`
   * array. Absent for leaf lanes and in `'chronological'` mode (empty Map).
   * Populated by `buildGeometry`; consumed by `canvas2d_renderer` and keyboard handler.
   */
  disclosureByLane: Map<number, DisclosureEntry>;
  /**
   * Published disclosure-column sub-widths (ADR 0037 D1). Single source of truth for the caret draw
   * pass, the count draw pass, `pickDisclosure`, and badge layout — none of them re-derive it.
   * All fields are 0 when the trace has no parents (flat trace, chronological mode, or no data).
   */
  disclosureColumn: DisclosureColumnGeometry;
  /**
   * Projected critical-path intervals grouped by lane index. Populated by `buildGeometry` from the
   * rolled-up pipeline output (post-collapse). Empty map when `criticalPath` is absent or empty.
   * Consumed by the critical-path draw pass in `canvas2d_renderer`.
   */
  criticalIntervalsByLane: ReadonlyMap<number, ReadonlyArray<{ start: number; end: number }>>;
  /**
   * Laid-out Span badges grouped by lane index (Spec 27), for the visible lane range only. Populated
   * by the badge-layout pass after partitioning; empty when no `badgeAccessor` is supplied or no
   * badge participates in the current label mode. Consumed by the badge draw pass and `pickBadge`.
   */
  badgesByLane: ReadonlyMap<number, LaneBadgeLayout>;
  /**
   * Per-lane guide mask for the tree-guide draw pass (Spec 33 / ADR 0039). Absent for root lanes and
   * when `showTreeGuides` is false (empty shared Map — no allocation on the prop-off path). Published
   * by `buildGeometry`; consumed by `drawTreeGuides` in `canvas2d_renderer`. `pickDisclosure`,
   * `pickRegion`, and `pickBadge` are untouched — guides are non-interactive by construction.
   */
  treeGuidesByLane: ReadonlyMap<number, TreeGuideEntry>;
  /**
   * Laid-out Trace annotations (Spec 29) for the current frame — already domain-culled, viewport-
   * clipped, and collapse-omitted. Empty when no annotation resolves or participates. Consumed by the
   * annotation draw pass and `pickAnnotation`. Kept off `buildGeometry` (like `badgesByLane`) because
   * it depends on the separately-memoized annotation resolution, not the span pipeline.
   */
  annotationsLayout: readonly AnnotationLayoutItem[];
}

/**
 * The x-axis region the pointer is over within a lane.
 * - `active`  — inside an active segment (self-time, per ADR 0003)
 * - `waiting` — inside [start, end] but not an active segment (time spent in children, by default)
 * - `empty`   — outside [start, end]; no span activity at this x in this lane
 * - `span`    — inside [start, end] of a **collapsed** parent (whole-span picking; Spec 21 / ADR 0026).
 *               Sub-segment indices are ambiguous for rolled-up bars, so collapsed bars use this
 *               region instead of `active`/`waiting`. Click selects the whole span ref.
 * @internal
 */
export type HoverRegion = 'active' | 'waiting' | 'empty' | 'span';

/**
 * Result of x-aware lane picking (`pickRegion`). `index` is the 0-based span-array index; `region`
 * is the x-axis sub-region under the pointer within that lane.
 * @internal
 */
export interface PickResult {
  index: number;
  region: HoverRegion;
  /**
   * 0-based index into `span.activeSegments` when `region === 'active'`; -1 otherwise.
   * Use this to display per-segment duration in the tooltip.
   */
  segmentIndex: number;
}

/**
 * The renderer seam that allows a Canvas2D or WebGL backend to be swapped without changing
 * geometry, interaction, or the public API. See ADR 0001.
 * @internal
 */
export interface TraceRenderer {
  draw(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void;
  /** Returns the 0-based span-array index under (x, y), or -1 if outside all lanes. */
  pickLane(x: number, y: number, geom: TraceGeometry): number;
  /**
   * Fine-grained hit test: returns the segment region (active / waiting) under (x, y), or null
   * when the pointer is outside all segments. This is the picker used by hover, click, and
   * keyboard interaction — `pickLane` only resolves the lane.
   */
  pickRegion(x: number, y: number, geom: TraceGeometry): PickResult | null;
}

export { type Size, type Dimensions } from '../../../utils/dimensions';
