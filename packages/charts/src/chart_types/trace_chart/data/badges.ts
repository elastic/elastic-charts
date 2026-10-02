/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceDiagnosticsCollector } from './diagnostics';
import type { NormalizedSpan } from './types';
import type { TraceSpanBadge, TraceSpanBadgeAccessor } from '../trace_api';

/** The Label-position values a badge's `visibleIn` may contain (Spec 27). */
const VALID_VISIBILITY: ReadonlySet<string> = new Set(['gutter', 'inline', 'none']);

/**
 * Whether a badge's `text` resolves to visible text: a non-empty string after trimming. A non-string
 * value or a whitespace-only string counts as **absent** text (Spec 27).
 */
function hasVisibleText(text: unknown): boolean {
  return typeof text === 'string' && text.trim() !== '';
}

/** Whether a badge carries a usable image source (a non-empty `src` string). */
function hasImage(badge: TraceSpanBadge): boolean {
  return typeof badge.image?.src === 'string' && badge.image.src.trim() !== '';
}

/**
 * Evaluates `badgeAccessor` for each span (Spec 27) and attaches the structurally-valid Span badges
 * to `NormalizedSpan.badges`, in accessor order. Runs once per prepared-data change — never per
 * animation frame — at both pipeline call sites (the chart component and the screen-reader selector),
 * so the visual and accessible surfaces resolve identical badges (ADR 0004).
 *
 * Pure: original `TraceDatum` and badge objects are never mutated. Kept badges are retained **by
 * reference** so interaction events return the caller's `badge` and its opaque `meta` unchanged.
 * Spans with no accessor, no returned badges, or no surviving badges keep their original reference.
 *
 * Structural validation is reported through `diagnostics` (Spec 28) rather than developer logs:
 * - `badge_empty` — neither visible text nor image → **dropped** from layout and hit testing.
 * - `badge_non_string_text` — `text` present but not a string → text treated as absent (the badge is
 *   kept only if it still has an image; otherwise it also counts as empty and is dropped).
 * - `badge_duplicate_id` — repeated id within the span → **kept** (pointer hit testing resolves to
 *   the first match, keeping interaction deterministic), but reported.
 * - `badge_invalid_visibility` — `visibleIn` held values outside the Label-position set → reported;
 *   invalid entries are ignored at layout.
 * - `badge_missing_aria_label` — image-only badge without `ariaLabel` → kept and reported; it renders
 *   with a generated accessible name.
 *
 * @internal
 */
export function resolveSpanBadges(
  spans: NormalizedSpan[],
  badgeAccessor: TraceSpanBadgeAccessor | undefined,
  diagnostics?: TraceDiagnosticsCollector,
): NormalizedSpan[] {
  if (badgeAccessor === undefined) return spans;

  return spans.map((span) => {
    const raw = badgeAccessor(span.meta);
    if (raw === undefined || raw.length === 0) return span;

    const kept: TraceSpanBadge[] = [];
    const seenIds = new Set<string>();

    for (const badge of raw) {
      const example = `${span.id}/${String(badge.id)}`;

      const textIsPresentNonString = badge.text !== undefined && typeof badge.text !== 'string';
      if (textIsPresentNonString) {
        diagnostics?.add('badge_non_string_text', 'warning', 'badge', example);
      }

      const text = hasVisibleText(badge.text);
      const image = hasImage(badge);

      if (!text && !image) {
        // Neither visible text nor image (includes whitespace-only and non-string text with no
        // image): reported and omitted from visual layout and hit testing.
        diagnostics?.add('badge_empty', 'warning', 'badge', example);
        continue;
      }

      if (seenIds.has(String(badge.id))) {
        diagnostics?.add('badge_duplicate_id', 'warning', 'badge', example);
      }
      seenIds.add(String(badge.id));

      if (badge.visibleIn !== undefined && badge.visibleIn.some((v) => !VALID_VISIBILITY.has(v))) {
        diagnostics?.add('badge_invalid_visibility', 'warning', 'badge', example);
      }

      if (image && !text && !hasVisibleText(badge.ariaLabel)) {
        diagnostics?.add('badge_missing_aria_label', 'warning', 'badge', example);
      }

      kept.push(badge);
    }

    return kept.length > 0 ? { ...span, badges: kept } : span;
  });
}
