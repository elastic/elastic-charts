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
 * under the License. */

import { Delaunay } from 'd3-delaunay';

import { IndexedGeometry, PointGeometry, isPointGeometry } from '../../../utils/geometry';
import { Point } from '../../../utils/point';

export type IndexedGeometryMapPoint = [number, number];
export type IndexedGeometryMapKey = string | number | IndexedGeometryMapPoint;

export class IndexedGeometryMap {
  private linearMap = new Map<string | number, IndexedGeometry[]>();
  private spatialMap: Delaunay<IndexedGeometryMapPoint> | null = null;
  // private pointMap = new Map<string | number, IndexedGeometry[]>();
  private points: IndexedGeometryMapPoint[] = [];
  private pointGeometries: PointGeometry[] = [];
  // private searchStartIndex: number = 0;

  constructor(points: PointGeometry[] = []) {
    this.setSpatial(points);
  }

  private setLinear(geometry: IndexedGeometry) {
    const { x } = geometry.value;
    const existing = this.linearMap.get(x);
    const upsertGeometry: IndexedGeometry[] = Array.isArray(geometry) ? geometry : [geometry];
    if (existing === undefined) {
      this.linearMap.set(x, upsertGeometry);
    } else {
      this.linearMap.set(x, [...upsertGeometry, ...existing]);
    }
  }

  private setSpatial(points: PointGeometry[]) {
    // TODO: handle coincident points
    this.pointGeometries.push(...points);
    this.points.push(
      ...points.map<IndexedGeometryMapPoint>(({ x, y }) => [x, y]),
    );

    if (this.points.length > 0) {
      this.spatialMap = Delaunay.from(this.points);
    }
  }

  voronoi(bounds?: Delaunay.Bounds) {
    return this.spatialMap?.voronoi(bounds);
  }

  getMergeData() {
    return {
      pointGeometries: [...this.pointGeometries],
      linearGeometries: [...this.linearMap.values()],
    };
  }

  keys(): Array<number> {
    return [...this.linearMap.keys()].filter((key): key is number => typeof key === 'number');
  }

  set(geometry: IndexedGeometry, spatial = false) {
    if (spatial) {
      if (!isPointGeometry(geometry)) {
        throw new Error('Spatial geometry must be PointGeometry');
      }
      this.setSpatial([geometry]);
    } else {
      this.setLinear(geometry);
    }
  }

  find(x: number | string | null, point: Point, neighbors = false): IndexedGeometry[] {
    if (x === null) {
      return [];
    }

    const elements = [];
    if (this.spatialMap !== null) {
      const index = this.spatialMap.find(point.x, point.y);

      if (neighbors) {
        [...this.spatialMap.neighbors(index)].forEach((i) => {
          elements.push(...([this.pointGeometries[i]] ?? []));
        });
      }

      elements.push(...([this.pointGeometries[index]] ?? []));
    }

    if (x !== null) {
      elements.push(...(this.linearMap.get(x) ?? []));
    }

    return elements;
  }

  /**
   * Merge multiple indexedMaps into base indexedMaps
   * @param indexedMaps
   */
  merge(...indexedMaps: IndexedGeometryMap[]) {
    for (const indexedMap of indexedMaps) {
      const { pointGeometries, linearGeometries } = indexedMap.getMergeData();
      this.setSpatial(pointGeometries);
      linearGeometries.forEach((geometry) => {
        if (Array.isArray(geometry)) {
          geometry.forEach(this.setLinear.bind(this));
        } else {
          this.setLinear(geometry);
        }
      });
    }
  }
}
