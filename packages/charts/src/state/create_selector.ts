/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line no-restricted-imports
import { createSelector } from '@reduxjs/toolkit';
// eslint-disable-next-line no-restricted-imports
import type { ICacheObject } from 're-reselect';
// eslint-disable-next-line no-restricted-imports
import createCachedSelector from 're-reselect';

import type { GlobalChartState } from './chart_state';

/**
 * Wraps RTK's `createSelector` with a bounded LRU memo cache per chartId.
 * maxSize=2 captures all hit-rate gains with minimal memory footprint.
 * Keeping this small is critical because every cached entry can retain
 * large chart objects (geometry arrays, scales, tooltip info) and the
 * cost is multiplied by ~170 selectors × N charts on the page.
 */
const createSelectorWithLRU = ((selectors: any[], combiner: (...args: any[]) => any) =>
  createSelector(selectors, combiner, {
    memoizeOptions: {
      maxSize: 2,
    },
  })) as unknown as typeof createSelector;

/**
 * Custom cache backed by Map (re-reselect ICacheObject).
 * Map is preferred over a plain object because .size is O(1),
 * .delete() doesn't deoptimize V8 hidden classes
 * see https://github.com/toomuchdesign/re-reselect/tree/master/src/cache#write-your-custom-cache-object
 */
class CustomMapCache implements ICacheObject {
  private cache = new Map<string, () => any>();

  set(key: string, selectorFn: () => any) {
    this.cache.set(key, selectorFn);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  remove(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  isEmpty() {
    return this.cache.size === 0;
  }

  isValidCacheKey(key: string) {
    return typeof key === 'string';
  }
}

const keySelector = ({ chartId }: GlobalChartState) => chartId;

class GlobalSelectorCache {
  private selectorCaches: CustomMapCache[] = [];

  registerSelector() {
    const cache = new CustomMapCache();
    this.selectorCaches.push(cache);
    return {
      keySelector,
      cacheObject: cache,
      selectorCreator: createSelectorWithLRU,
    };
  }

  removeKeyFromAll(key: string) {
    this.selectorCaches.forEach((cache) => {
      cache.remove(key);
    });
    // NOTE: we intentionally do NOT prune empty caches from the array.
    // Each cache is shared by closure with a live re-reselect selector.
    // Pruning it here would orphan the cache: future chartIds written to
    // it by re-reselect would never be cleaned up by subsequent
    // removeKeyFromAll calls, causing a memory leak.
  }
}

/**
 * Global singleton to manage state of selector caches
 *
 * @internal
 */
export const globalSelectorCache = new GlobalSelectorCache();

/**
 * Wrapper around `createCachedSelector` to provide `keySelector` and `cacheObject`
 * for all selector instances in one place. This should be used in place of `createCachedSelector`.
 *
 * The types defining `createCachedSelector` are very complex and essentially hardcoded overloads for having any
 * number of selector inputs up to about 20 with generic types. Thus the types are extremely hard to duplciate.
 * To fix this I used the type of `createSelector` which is what is the same as that of `createCachedSelector`
 * method with the added curring for the cached options which this wrapper handles.
 *
 * @internal
 */
export const createCustomCachedSelector = ((...args: any[]) => {
  // @ts-ignore - forced types to simplify usage. All types align correctly
  return createCachedSelector(...args)(globalSelectorCache.registerSelector());
}) as unknown as typeof createSelector;
