/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line no-restricted-imports
import createCachedSelector, { ICacheObject, Options } from 're-reselect';
import { createSelector } from 'reselect';

import { GlobalChartState } from './chart_state';

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

  getNewOptions(): Options<GlobalChartState, unknown, unknown> {
    return {
      keySelector: GlobalSelectorCache.keySelector,
      cacheObject: this.getCacheObject(),
    };
  }

  removeKeyFromAll(key: string) {
    this.selectorCaches.forEach((cache) => {
      cache.remove(key);
    });
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
