/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from '../data/types';
import type { TraceSpanBadge, TraceSpanBadgeSize } from '../trace_api';
import type { BadgeLayoutItem, LaneBadgeLayout, TraceBadgeSizeMetrics, TraceGeometry, TraceStyle } from './types';
import { LANE_PADDING } from './types';

/** Inset (px) between a label column edge and its text/badges (matches the renderer's label inset). */
const LABEL_INSET = 4;

/** The default `visibleIn` set when a badge omits it: it accompanies a visible label (Spec 27). */
const DEFAULT_VISIBLE_IN: ReadonlyArray<'gutter' | 'inline' | 'none'> = ['gutter', 'inline'];

/** Upper bound (px) on the badge-only gutter width so a pathological badge cannot dominate the plot. */
const MAX_BADGE_GUTTER_PX = 240;

/** Measures the pixel width of `text` at the badge font/size. Backed by `ctx.measureText` at draw time. */
export type BadgeTextMeasurer = (text: string, fontSize: number) => number;

/** The label position values a badge may participate in. */
type LabelPosition = TraceStyle['labelPosition'];

/** Whether a badge's text resolves to a non-empty string after trimming (mirrors data/badges.ts). */
function visibleText(badge: TraceSpanBadge): string | undefined {
  return typeof badge.text === 'string' && badge.text.trim() !== '' ? badge.text.trim() : undefined;
}

/** Whether a badge carries a usable image source. */
function badgeImage(badge: TraceSpanBadge): { src: string; crossOrigin: 'anonymous' | 'use-credentials' } | undefined {
  const src = badge.image?.src;
  if (typeof src !== 'string' || src.trim() === '') return undefined;
  return { src, crossOrigin: badge.image?.crossOrigin ?? 'anonymous' };
}

/**
 * Resolves the accessible name for a badge (Spec 27): an explicit `ariaLabel` wins, else the visible
 * text, else a generated fallback for an image-only badge. Uses the **full** (untruncated) text so
 * assistive tech always gets the complete label even when the visible badge is clipped. Shared with
 * the screen-reader table (Phase 6). `index` is the badge's 0-based position within its span.
 * @internal
 */
export function resolveBadgeAriaLabel(badge: TraceSpanBadge, index: number): string {
  const aria = typeof badge.ariaLabel === 'string' && badge.ariaLabel.trim() !== '' ? badge.ariaLabel.trim() : undefined;
  return aria ?? visibleText(badge) ?? `Badge ${index + 1}`;
}

/** Whether a badge participates in the given label position, ignoring invalid `visibleIn` entries. */
function participatesIn(badge: TraceSpanBadge, position: LabelPosition): boolean {
  const set = badge.visibleIn ?? DEFAULT_VISIBLE_IN;
  return set.includes(position);
}

/** Intrinsic (untruncated) measurements for one badge at the active size. */
interface BadgeMetrics {
  fullWidth: number;
  imageWidth: number;
  innerGap: number;
  text?: string;
  image?: { src: string; crossOrigin: 'anonymous' | 'use-credentials' };
}

function measureBadge(badge: TraceSpanBadge, m: TraceBadgeSizeMetrics, measure: BadgeTextMeasurer): BadgeMetrics {
  const text = visibleText(badge);
  const image = badgeImage(badge);
  const imageWidth = image ? m.imageSize : 0;
  const innerGap = image && text ? m.imageTextGap : 0;
  const textWidth = text ? measure(text, m.fontSize) : 0;
  const fullWidth = m.paddingX * 2 + imageWidth + innerGap + textWidth;
  return { fullWidth, imageWidth, innerGap, text, image };
}

/** Truncates `text` with a trailing ellipsis to the largest prefix whose width fits `maxWidth`. */
function truncateToWidth(text: string, maxWidth: number, fontSize: number, measure: BadgeTextMeasurer): string {
  const ellipsis = '…';
  if (measure(text, fontSize) <= maxWidth) return text;
  // Linear shrink from the end; badge text is short so this is cheap and exact.
  for (let len = text.length - 1; len > 0; len--) {
    const candidate = text.slice(0, len) + ellipsis;
    if (measure(candidate, fontSize) <= maxWidth) return candidate;
  }
  return ellipsis;
}

/**
 * Lays a cluster of participating badges left→right from `startX`, centered vertically on `centerY`,
 * within `[startX, rightBound]`. Applies overflow (Spec 27): a badge whose text no longer fits its
 * design minimum truncates with an ellipsis down to `minTextWidth`; anything that still does not fit
 * is omitted from the end of the ordered collection (image-only badges cannot shrink, so they are
 * omitted whole). Returns the visible items in accessor order.
 */
function layoutCluster(
  badges: readonly TraceSpanBadge[],
  startX: number,
  centerY: number,
  rightBound: number,
  m: TraceBadgeSizeMetrics,
  style: TraceBadgeStyleLike,
  measure: BadgeTextMeasurer,
): BadgeLayoutItem[] {
  const items: BadgeLayoutItem[] = [];
  const y = centerY - m.height / 2;
  let cursor = startX;
  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i]!;
    const met = measureBadge(badge, m, measure);
    const available = rightBound - cursor;
    if (available < m.paddingX * 2 + met.imageWidth) break; // not even the image/padding fits → omit rest

    let width = met.fullWidth;
    let drawnText = met.text;
    if (cursor + met.fullWidth > rightBound) {
      // Would overflow: try to truncate text; omit if there is no text or too little room.
      const fixed = m.paddingX * 2 + met.imageWidth + met.innerGap;
      const textRoom = rightBound - cursor - fixed;
      if (met.text === undefined || textRoom < style.minTextWidth) break;
      drawnText = truncateToWidth(met.text, textRoom, m.fontSize, measure);
      width = fixed + measure(drawnText, m.fontSize);
    }

    const imageX = cursor + m.paddingX;
    const textX = imageX + met.imageWidth + met.innerGap;
    items.push({
      badge,
      x: cursor,
      y,
      width,
      height: m.height,
      text: drawnText,
      image: met.image ? { ...met.image, x: imageX, y: centerY - m.imageSize / 2, size: m.imageSize } : undefined,
      textX,
      fontSize: m.fontSize,
      ariaLabel: resolveBadgeAriaLabel(badge, i),
    });
    cursor += width + style.gap;
  }
  return items;
}

/** The subset of `TraceBadgeStyle` the cluster layout needs (keeps `measureBadge`/`layoutCluster` decoupled). */
interface TraceBadgeStyleLike {
  gap: number;
  minTextWidth: number;
}

/** Natural (untruncated) width of a full badge cluster, including inter-badge gaps. */
function naturalClusterWidth(
  badges: readonly TraceSpanBadge[],
  m: TraceBadgeSizeMetrics,
  gap: number,
  measure: BadgeTextMeasurer,
): number {
  if (badges.length === 0) return 0;
  let total = 0;
  for (const badge of badges) total += measureBadge(badge, m, measure).fullWidth;
  return total + gap * (badges.length - 1);
}

/** The caret column width within the gutter, mirroring the renderer's derivation. */
function caretColumnWidth(geom: TraceGeometry, style: TraceStyle): number {
  if (geom.disclosureByLane.size === 0) return 0;
  return style.labelPosition === 'gutter' ? geom.gutter.width - style.gutterWidth : geom.gutter.width;
}

/**
 * Computes the fixed width (px) of the badge-only gutter for `'none'` Label position (Spec 27), or
 * `0` when no span has a badge visible in `'none'` (the gutter is then absent and the plot keeps its
 * width). Sized to the widest participating cluster across **all** spans so it never reflows on
 * vertical scroll, and capped at {@link MAX_BADGE_GUTTER_PX}. Only meaningful in `'none'` mode.
 * @internal
 */
export function computeBadgeGutterWidth(
  spans: NormalizedSpan[],
  style: TraceStyle,
  badgeSize: TraceSpanBadgeSize,
  measure: BadgeTextMeasurer,
): number {
  if (style.labelPosition !== 'none') return 0;
  const m = style.badge[badgeSize];
  let max = 0;
  for (const span of spans) {
    if (!span.badges) continue;
    const participating = span.badges.filter((b) => participatesIn(b, 'none'));
    if (participating.length === 0) continue;
    const w = naturalClusterWidth(participating, m, style.badge.gap, measure);
    if (w > max) max = w;
  }
  if (max === 0) return 0;
  return Math.min(MAX_BADGE_GUTTER_PX, max + LABEL_INSET * 2);
}

/**
 * The pure badge-layout pass (Spec 27). For each **visible** lane, resolves the participating Span
 * badges for the current Label position and lays them out into pill rectangles the renderer draws and
 * `pickBadge` hit-tests. Modes:
 * - `inline`: badges sit adjacent to the inline label (below the bar); if the label+badges group would
 *   overflow the right edge it is shifted left (reported via `labelX`), breaking bar-start alignment.
 * - `gutter`: badges sit on a row below the gutter label, at the label's x (library-fixed placement).
 * - `none`: badges sit in the fixed, lane-aligned badge-only gutter (does not move on zoom/pan).
 *
 * `measure` measures badge text; `labelMeasure` measures the (gutter-label-font) span name for inline
 * placement. `firstLane`/`lastLane` bound the pass to the visible range. Runs per frame in `inline`
 * mode (positions track the bars); scale-independent in `gutter`/`none`.
 * @internal
 */
export function layoutBadges(
  geom: TraceGeometry,
  style: TraceStyle,
  badgeSize: TraceSpanBadgeSize,
  measure: BadgeTextMeasurer,
  labelMeasure: BadgeTextMeasurer,
  firstLane: number,
  lastLane: number,
): Map<number, LaneBadgeLayout> {
  const result = new Map<number, LaneBadgeLayout>();
  const { spans, plot, gutter, laneHeight, scrollOffset, scale, labelBandPx } = geom;
  const position = style.labelPosition;
  const m = style.badge[badgeSize];
  const bstyle = style.badge;
  const plotRight = plot.left + plot.width;
  const caretW = caretColumnWidth(geom, style);

  for (let i = Math.max(0, firstLane); i <= lastLane && i < spans.length; i++) {
    const span = spans[i]!;
    if (!span.badges || span.badges.length === 0) continue;
    const participating = span.badges.filter((b) => participatesIn(b, position));
    if (participating.length === 0) continue;

    const laneTop = plot.top + i * laneHeight - scrollOffset;

    if (position === 'inline') {
      const rawX1 = scale(span.start);
      const rawX2 = scale(span.end);
      if (rawX2 < plot.left || rawX1 > plotRight) continue; // no visible bar to anchor to
      const barStartX = Math.max(plot.left, rawX1);
      const labelWidth = span.name ? labelMeasure(span.name, style.gutterLabel.fontSize) : 0;
      const clusterNatural = naturalClusterWidth(participating, m, bstyle.gap, measure);
      const groupWidth = labelWidth + bstyle.labelGap + clusterNatural;
      // Right-edge shift: push the whole label+badges group left when it would overflow.
      const groupLeft =
        barStartX + groupWidth <= plotRight ? barStartX : Math.max(plot.left, plotRight - groupWidth);
      const clusterStartX = groupLeft + labelWidth + bstyle.labelGap;
      const centerY = laneTop + laneHeight - LANE_PADDING - labelBandPx / 2;
      const items = layoutCluster(participating, clusterStartX, centerY, plotRight - LABEL_INSET, m, bstyle, measure);
      if (items.length === 0) continue;
      result.set(i, { labelX: groupLeft === barStartX ? undefined : groupLeft, items });
    } else if (position === 'gutter') {
      // Beside the gutter label, sharing its row (vertically centered on the lane, like the label).
      // Badges are right-aligned in the gutter; the label keeps at least `minLabelWidth` on the left
      // (the renderer shrinks the label to end before the first badge). Robust for any lane height.
      const labelX = gutter.left + caretW + LABEL_INSET;
      const rightBound = gutter.left + gutter.width - LABEL_INSET;
      const clusterNatural = naturalClusterWidth(participating, m, bstyle.gap, measure);
      const maxCluster = rightBound - labelX - bstyle.minLabelWidth - bstyle.labelGap;
      const clusterWidth = Math.min(clusterNatural, maxCluster);
      if (clusterWidth <= 0) continue; // gutter too narrow to host badges beside the label → omit
      const clusterStartX = rightBound - clusterWidth;
      const centerY = laneTop + laneHeight / 2;
      const items = layoutCluster(participating, clusterStartX, centerY, rightBound, m, bstyle, measure);
      if (items.length === 0) continue;
      result.set(i, { items });
    } else {
      // 'none': fixed badge-only gutter between the disclosure gutter and the plot.
      const clusterStartX = gutter.width + LABEL_INSET;
      const rightBound = plot.left - LABEL_INSET;
      if (rightBound <= clusterStartX) continue; // no badge-only gutter reserved
      const centerY = laneTop + laneHeight / 2;
      const items = layoutCluster(participating, clusterStartX, centerY, rightBound, m, bstyle, measure);
      if (items.length === 0) continue;
      result.set(i, { items });
    }
  }
  return result;
}
