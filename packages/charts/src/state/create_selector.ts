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
 * This wraps Redux Toolkit's `createSelector` with a custom cache size of 100.
 * It will be passed on to re-reselect's `createCachedSelector` to handle the cache.
 * This means we'll get a cache size of 100 for each chartId. The default cache size
 * of 1 slowed things down quite a bit after migrating to Redux Toolkit.
 */
const createSelectorWithMaxSize100 = ((selectors: any[], combiner: (...args: any[]) => any) =>
  createSelector(selectors, combiner, {
    memoizeOptions: {
      maxSize: 100,
    },
  })) as unknown as typeof createSelector;

/**
 * Custom object cache
 * see https://github.com/toomuchdesign/re-reselect/tree/master/src/cache#write-your-custom-cache-object
 */
class CustomMapCache implements ICacheObject {
  private cache: any = {};

  set(key: string, selectorFn: () => any) {
    this.cache[key] = selectorFn;
  }

  get(key: string) {
    return this.cache[key];
  }

  remove(key: string) {
    delete this.cache[key];
  }

  clear() {
    this.cache = {};
  }

  isEmpty() {
    return Object.keys(this.cache).length === 0;
  }

  isValidCacheKey(key: string) {
    return typeof key === 'string';
  }
}

class GlobalSelectorCache {
  private selectorCaches: CustomMapCache[] = [];

  static keySelector({ chartId }: GlobalChartState) {
    return chartId;
  }

  getNewOptions() {
    return {
      keySelector: GlobalSelectorCache.keySelector,
      cacheObject: this.getCacheObject(),
      selectorCreator: createSelectorWithMaxSize100,
    };
  }

  removeKeyFromAll(key: string) {
    // remove the chart id from all caches
    this.selectorCaches.forEach((cache) => {
      cache.remove(key);
    });
    // clean up empty caches
    this.selectorCaches = this.selectorCaches.filter((cache) => !cache.isEmpty());
  }

  private getCacheObject(): CustomMapCache {
    const cache = new CustomMapCache();
    this.selectorCaches.push(cache);

    return cache;
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
  return createCachedSelector(...args)(globalSelectorCache.getNewOptions());
}) as unknown as typeof createSelector;
