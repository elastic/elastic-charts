/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import { IndexedGeometryLinearMap } from './indexed_geometry_linear_map';
import { IndexedGeometrySpatialMap } from './indexed_geometry_spatial_map';
import type { MarkBuffer } from '../../../specs';
import { isNil } from '../../../utils/common';
import type { Bounds } from '../../../utils/d3-delaunay';
import type { IndexedGeometry } from '../../../utils/geometry';
import { isPointGeometry } from '../../../utils/geometry';
import type { Point } from '../../../utils/point';
import type { PrimitiveValue } from '../../partition_chart/layout/utils/group_by_rollup';

/** @internal */
export const GeometryType = Object.freeze({
  linear: 'linear' as const,
  spatial: 'spatial' as const,
});
/** @internal */
export type GeometryType = $Values<typeof GeometryType>;

/** @internal */
export class IndexedGeometryMap {
  private linearMap = new IndexedGeometryLinearMap();

  private spatialMap = new IndexedGeometrySpatialMap();

  // series that draw only some of their rows: the x values of the drawn rows, which the pointer snaps to, and finders
  // of the geometries of all their rows at an x
  private lookupKeys = new Set<number | string>();

  private lookups: Array<(x: number | string) => IndexedGeometry[]> = [];

  /**
   * Returns triangulation instance to render spatial grid
   *
   * @param bounds
   */
  triangulation(bounds?: Bounds) {
    return this.spatialMap.triangulation(bounds);
  }

  keys(): Array<number | string> {
    return [...this.linearMap.keys(), ...this.spatialMap.keys(), ...this.lookupKeys];
  }

  get size(): number {
    return this.linearMap.size + this.spatialMap.size + this.lookupKeys.size;
  }

  setLookup(keys: Array<number | string>, lookup: (x: number | string) => IndexedGeometry[]) {
    keys.forEach((key) => this.lookupKeys.add(key));
    this.lookups.push(lookup);
  }

  set(geometry: IndexedGeometry, type: GeometryType = GeometryType.linear) {
    if (type === GeometryType.spatial && isPointGeometry(geometry)) {
      // TODO: Add dev error here when attempting spatial upset with non-point
      this.spatialMap.set([geometry]);
    } else {
      this.linearMap.set(geometry);
    }
  }

  find(
    x: number | string | null,
    pointBuffer: MarkBuffer,
    point?: Point,
    smHorizontalValue?: PrimitiveValue,
    smVerticalValue?: PrimitiveValue,
  ): IndexedGeometry[] {
    if (x === null && !point) {
      return [];
    }

    const spatialValues = point === undefined ? [] : this.spatialMap.find(point, pointBuffer);
    const lookedUp = x === null ? [] : this.lookups.flatMap((lookup) => lookup(x));
    return [...this.linearMap.find(x), ...lookedUp, ...spatialValues].filter(
      ({ seriesIdentifier: { smHorizontalAccessorValue, smVerticalAccessorValue } }) =>
        (isNil(smVerticalValue) || smVerticalAccessorValue === smVerticalValue) &&
        (isNil(smHorizontalValue) || smHorizontalAccessorValue === smHorizontalValue),
    );
  }

  getMergeData() {
    return {
      spatialGeometries: this.spatialMap.getMergeData(),
      linearGeometries: this.linearMap.getMergeData(),
    };
  }

  /**
   * Merge multiple indexedMaps into base indexedMaps
   * @param indexedMaps
   */
  merge(...indexedMaps: IndexedGeometryMap[]) {
    // eslint-disable-next-line no-restricted-syntax
    for (const indexedMap of indexedMaps) {
      const { spatialGeometries, linearGeometries } = indexedMap.getMergeData();
      this.spatialMap.set(spatialGeometries);
      this.lookups.push(...indexedMap.lookups);
      indexedMap.lookupKeys.forEach((key) => this.lookupKeys.add(key));
      linearGeometries.forEach((geometry) => {
        if (Array.isArray(geometry)) {
          geometry.forEach((geometry) => this.linearMap.set(geometry));
        } else {
          this.linearMap.set(geometry);
        }
      });
    }
  }
}
