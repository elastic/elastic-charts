/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Async loader + cache for Span-badge images (Spec 27 / ADR 0029). Canvas2D cannot draw a remote
 * image synchronously, so the badge draw pass asks this cache for a **decoded** image: a cache hit
 * returns it immediately; a miss starts an off-frame load, returns `undefined` (the draw pass paints
 * a placeholder box), and — once decoded — invokes `onLoad` so the chart re-renders with the real
 * image. Coalescing of the resulting redraws is delegated to the chart's own frame scheduler.
 *
 * One instance per chart: the cache is keyed by `crossOrigin|src` so the same URL requested with a
 * different CORS mode loads independently. Failed loads are cached as errors (never retried) and
 * warned about **once** per key so a broken URL cannot spam the console every frame.
 * @internal
 */

/** Load state of one cached image. */
type BadgeImageStatus = 'loading' | 'loaded' | 'error';

interface BadgeImageRecord {
  status: BadgeImageStatus;
  image: HTMLImageElement;
}

/** The CORS modes a badge image may request (mirrors `TraceSpanBadgeImage.crossOrigin`). */
export type BadgeImageCrossOrigin = 'anonymous' | 'use-credentials';

/** @internal */
export class BadgeImageCache {
  private readonly cache = new Map<string, BadgeImageRecord>();
  private readonly warned = new Set<string>();
  private readonly onLoad: () => void;

  /** `onLoad` is called after an image finishes decoding so the chart can schedule a redraw. */
  constructor(onLoad: () => void) {
    this.onLoad = onLoad;
  }

  /**
   * Returns a drawable image for `(src, crossOrigin)` when it is already decoded; otherwise starts a
   * load exactly once and returns `undefined` (the caller draws a placeholder until `onLoad` fires).
   * An errored image always returns `undefined`, so its placeholder is permanent.
   */
  get(src: string, crossOrigin: BadgeImageCrossOrigin): CanvasImageSource | undefined {
    const key = `${crossOrigin}|${src}`;
    const existing = this.cache.get(key);
    if (existing) return existing.status === 'loaded' ? existing.image : undefined;

    const image = new Image();
    image.crossOrigin = crossOrigin;
    const record: BadgeImageRecord = { status: 'loading', image };
    this.cache.set(key, record);

    image.onload = () => {
      record.status = 'loaded';
      this.onLoad();
    };
    image.onerror = () => {
      record.status = 'error';
      if (!this.warned.has(key)) {
        this.warned.add(key);
        // eslint-disable-next-line no-console
        console.warn(`[elastic-charts/trace] failed to load badge image: ${src}`);
      }
    };
    // Assigning `src` last ensures the handlers are attached before a (synchronously-cached) image
    // could fire, and mirrors the standard image-preload idiom.
    image.src = src;
    return undefined;
  }

  /** Test/inspection helper: the current load status for a key, or `undefined` if never requested. */
  statusOf(src: string, crossOrigin: BadgeImageCrossOrigin): BadgeImageStatus | undefined {
    return this.cache.get(`${crossOrigin}|${src}`)?.status;
  }
}
