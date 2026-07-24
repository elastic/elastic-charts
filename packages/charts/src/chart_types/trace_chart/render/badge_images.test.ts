/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BadgeImageCache } from './badge_images';

/** Controllable stand-in for the DOM `Image`, so tests can fire load/error deterministically. */
class FakeImage {
  static instances: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = '';
  src = '';
  constructor() {
    FakeImage.instances.push(this);
  }
}

let originalImage: unknown;

beforeEach(() => {
  FakeImage.instances = [];
  const g = global as unknown as { Image: unknown };
  originalImage = g.Image;
  g.Image = FakeImage;
});

afterEach(() => {
  (global as unknown as { Image: unknown }).Image = originalImage;
  jest.restoreAllMocks();
});

describe('BadgeImageCache', () => {
  it('loads browser-supported badge image sources', () => {
    // A first request starts one browser image load with the declared CORS mode and returns
    // undefined (the caller paints a placeholder) until the image decodes.
    const cache = new BadgeImageCache(jest.fn());
    expect(cache.get('a.png', 'anonymous')).toBeUndefined();
    expect(FakeImage.instances).toHaveLength(1);
    expect(FakeImage.instances[0]!.crossOrigin).toBe('anonymous');
    expect(FakeImage.instances[0]!.src).toBe('a.png');
    expect(cache.statusOf('a.png', 'anonymous')).toBe('loading');
  });

  it('shares badge image load state by source and cors mode', () => {
    const cache = new BadgeImageCache(jest.fn());
    // Same (src, crossOrigin): one shared load, no duplicate image.
    cache.get('a.png', 'anonymous');
    cache.get('a.png', 'anonymous');
    expect(FakeImage.instances).toHaveLength(1);
    // Different CORS mode for the same URL is a distinct identity: loads independently.
    cache.get('a.png', 'use-credentials');
    expect(FakeImage.instances).toHaveLength(2);
    expect(FakeImage.instances[1]!.crossOrigin).toBe('use-credentials');
  });

  it('image resolution schedules a non-blocking redraw', () => {
    // Decoding happens off-frame; when it completes the cache fires onLoad so the chart can
    // schedule a redraw, then serves the decoded image on the next request.
    const onLoad = jest.fn();
    const cache = new BadgeImageCache(onLoad);
    cache.get('a.png', 'anonymous');
    expect(onLoad).not.toHaveBeenCalled();
    FakeImage.instances[0]!.onload!();
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(cache.statusOf('a.png', 'anonymous')).toBe('loaded');
    expect(cache.get('a.png', 'anonymous')).toBe(FakeImage.instances[0]);
  });

  it('rejects images without compatible CORS', () => {
    // An image whose load fails (e.g. missing CORS headers that would taint the canvas) never
    // becomes drawable: get() stays undefined so the badge keeps its placeholder, and the canvas
    // is never fed a tainting image.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const cache = new BadgeImageCache(jest.fn());
    cache.get('cross-origin.png', 'anonymous');
    FakeImage.instances[0]!.onerror!();
    expect(cache.statusOf('cross-origin.png', 'anonymous')).toBe('error');
    expect(cache.get('cross-origin.png', 'anonymous')).toBeUndefined();
    // No retry: the failed load is not re-attempted.
    expect(FakeImage.instances).toHaveLength(1);
  });

  it('badge image cache eviction is not observable', () => {
    // Once decoded, repeated requests return the same image and never trigger a reload — eviction
    // (if any) is an unobservable implementation detail.
    const cache = new BadgeImageCache(jest.fn());
    cache.get('a.png', 'anonymous');
    FakeImage.instances[0]!.onload!();
    const first = cache.get('a.png', 'anonymous');
    const second = cache.get('a.png', 'anonymous');
    expect(second).toBe(first);
    expect(FakeImage.instances).toHaveLength(1);
  });

  it('deduplicates image failure warnings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const cache = new BadgeImageCache(jest.fn());
    cache.get('bad.png', 'anonymous');
    FakeImage.instances[0]!.onerror!();
    // Re-requesting the same failed source many times warns only once.
    cache.get('bad.png', 'anonymous');
    cache.get('bad.png', 'anonymous');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('image failure warnings are source scoped', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const cache = new BadgeImageCache(jest.fn());
    cache.get('bad-1.png', 'anonymous');
    FakeImage.instances[0]!.onerror!();
    cache.get('bad-2.png', 'anonymous');
    FakeImage.instances[1]!.onerror!();
    // One warning per distinct failing source — a failure on one does not suppress the other.
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]![0]).toContain('bad-1.png');
    expect(warn.mock.calls[1]![0]).toContain('bad-2.png');
  });

  it('image load failures are a render-time console warning, not a trace data diagnostic (Spec 28)', () => {
    // The async badge-image decode failure path (a runtime/CORS concern) stays a developer
    // console.warn. It is deliberately outside the prepared-data diagnostics report: the cache takes
    // only a redraw callback, never a TraceDiagnosticsCollector, so a broken image URL cannot appear
    // as a TraceDataDiagnostics issue.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const onLoad = jest.fn();
    const cache = new BadgeImageCache(onLoad);
    cache.get('broken.png', 'anonymous');
    FakeImage.instances[0]!.onerror!();
    expect(warn).toHaveBeenCalledTimes(1);
    // The redraw callback is unrelated to diagnostics and is not invoked by a failure.
    expect(onLoad).not.toHaveBeenCalled();
    expect(cache.statusOf('broken.png', 'anonymous')).toBe('error');
  });
});
