/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp } from '../utils/common';

/** @internal */
export class LRUCache<K, V> {
  private readonly max: number;
  private readonly cache: Map<K, V>;
  constructor(max = 10) {
    this.max = clamp(max, 1, Infinity);
    this.cache = new Map();
  }

  get(key: K) {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, val: V) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size === this.max) {
      const first = this.first();
      if(first) this.cache.delete(first)
    };
    this.cache.set(key, val);
  }

  first() {
    return this.cache.keys().next().value;
  }
}
