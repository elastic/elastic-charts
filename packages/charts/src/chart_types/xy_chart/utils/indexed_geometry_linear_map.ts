/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { IndexedGeometry } from '../../../utils/geometry';

/** @internal */
export class IndexedGeometryLinearMap {
  private map = new Map<string | number, IndexedGeometry[]>();

  get size() {
    return this.map.size;
  }

  set(geometry: IndexedGeometry) {
    const { x } = geometry.value;
    const existing = this.map.get(x);
    if (existing === undefined) {
      this.map.set(x, [geometry]);
    } else {
      this.map.set(x, [geometry, ...existing]);
    }
  }

  getMergeData() {
    return [...this.map.values()];
  }

  keys(): Array<number | string> {
    return [...this.map.keys()];
  }

  find(x: number | string | null): IndexedGeometry[] {
    if (x === null) {
      return [];
    }

    return this.map.get(x) ?? [];
  }
}
