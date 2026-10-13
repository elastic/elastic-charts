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

type LazyLinearFinder = (x: number | string) => IndexedGeometry[];

/** @internal */
export class IndexedGeometryMap {
  private linearMap = new IndexedGeometryLinearMap();

  private spatialMap = new IndexedGeometrySpatialMap();

  private lazyLinearFinders: LazyLinearFinder[] = [];

  private lazyLinearKeys = new Set<number | string>();

  /**
   * Returns triangulation instance to render spatial grid
   *
   * @param bounds
   */
  triangulation(bounds?: Bounds) {
    return this.spatialMap.triangulation(bounds);
  }

  /**
   * Register x values whose point geometries are built only when find() runs.
   * Used when line/area points are not painted (visible never, or auto + dense).
   */
  addLazyLinearSource(keys: Iterable<number | string>, find: LazyLinearFinder) {
    Array.from(keys, (key) => this.lazyLinearKeys.add(key));
    this.lazyLinearFinders.push(find);
  }

  keys(): Array<number | string> {
    if (this.lazyLinearKeys.size === 0) {
      return [...this.linearMap.keys(), ...this.spatialMap.keys()];
    }
    const keys = new Set<number | string>(this.linearMap.keys());
    this.lazyLinearKeys.forEach((key) => keys.add(key));
    this.spatialMap.keys().forEach((key) => keys.add(key));
    return [...keys];
  }

  get size(): number {
    if (this.lazyLinearKeys.size === 0) {
      return this.linearMap.size + this.spatialMap.size;
    }
    return this.keys().length;
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
    const lazyValues =
      x === null || this.lazyLinearFinders.length === 0 ? [] : this.lazyLinearFinders.flatMap((findFn) => findFn(x));
    return [...this.linearMap.find(x), ...lazyValues, ...spatialValues].filter(
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
      linearGeometries.forEach((geometry) => {
        if (Array.isArray(geometry)) {
          geometry.forEach((geometry) => this.linearMap.set(geometry));
        } else {
          this.linearMap.set(geometry);
        }
      });
      this.lazyLinearFinders.push(...indexedMap.lazyLinearFinders);
      indexedMap.lazyLinearKeys.forEach((key) => this.lazyLinearKeys.add(key));
    }
  }
}
