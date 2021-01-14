/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { $Values } from 'utility-types';

import { isNil } from '../../../utils/commons';
import { Bounds } from '../../../utils/d3-delaunay';
import { IndexedGeometry, isPointGeometry } from '../../../utils/geometry';
import { Point } from '../../../utils/point';
import { PrimitiveValue } from '../../partition_chart/layout/utils/group_by_rollup';
import { IndexedGeometryLinearMap } from './indexed_geometry_linear_map';
import { IndexedGeometrySpatialMap } from './indexed_geometry_spatial_map';

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

  /**
   * Returns triangulation instance to render spatial grid
   *
   * @param bounds
   */
  triangulation(bounds?: Bounds) {
    return this.spatialMap.triangulation(bounds);
  }

  keys(): Array<number | string> {
    return [...this.linearMap.keys(), ...this.spatialMap.keys()];
  }

  get size(): number {
    return this.linearMap.size + this.spatialMap.size;
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
    point?: Point,
    smHorizontalValue?: PrimitiveValue,
    smVerticalValue?: PrimitiveValue,
  ): IndexedGeometry[] {
    if (x === null && !point) {
      return [];
    }

    const spatialValues = point === undefined ? [] : this.spatialMap.find(point);
    return [...this.linearMap.find(x), ...spatialValues].filter(
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
    }
  }
}
