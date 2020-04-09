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

import { IndexedGeometry, PointGeometry } from '../../../utils/geometry';
import { Point } from '../../../utils/point';
import { getDistance } from '../state/utils';
// @ts-ignore
import { Delaunay } from '../../../utils/d3-delaunay';

export type IndexedGeometrySpatialMapPoint = [number, number];

export class IndexedGeometrySpatialMap {
  private map: Delaunay<IndexedGeometrySpatialMapPoint> | null = null;
  private points: IndexedGeometrySpatialMapPoint[] = [];
  private pointGeometries: PointGeometry[] = [];
  private searchStartIndex: number = 0;
  private maxRadius = -Infinity;

  constructor(points: PointGeometry[] = []) {
    this.set(points);
  }

  get size() {
    return this.points.length;
  }

  isSpatial() {
    return this.pointGeometries.length > 0;
  }

  set(points: PointGeometry[]) {
    // TODO: handle coincident points
    this.maxRadius = Math.max(this.maxRadius, ...points.map(({ radius }) => radius));
    this.pointGeometries.push(...points);
    this.points.push(
      ...points.map<IndexedGeometrySpatialMapPoint>(({ x, y }) => [x, y]),
    );

    if (this.points.length > 0) {
      // TODO: handle write/read init
      this.map = Delaunay.from(this.points);
    }
  }

  triangulation = (bounds?: Delaunay.Bounds) => {
    return this.map?.voronoi(bounds);
  };

  getMergeData() {
    return [...this.pointGeometries];
  }

  keys(): Array<number> {
    return this.pointGeometries.map(({ value: { x } }) => x);
  }

  find(x: number | string | null, point: Point): IndexedGeometry[] {
    if (x === null) {
      return [];
    }

    const elements = [];
    if (this.map !== null) {
      const index = this.map.find(point.x, point.y, this.searchStartIndex);

      // Set next starting search index for faster lookup
      this.searchStartIndex = index;
      elements.push(...this.getRadialNeighbors(index, point, new Set([index])));
      elements.push(...[this.pointGeometries[index] ?? []]);
    }

    return elements;
  }

  /**
   * Gets surrounding points whose radius could be within the active cursor position
   *
   * @param selectedIndex
   * @param point
   * @param visitedIndices
   */
  private getRadialNeighbors(selectedIndex: number, point: Point, visitedIndices: Set<number>): IndexedGeometry[] {
    if (this.map === null) {
      return [];
    }

    return [...this.map.neighbors(selectedIndex)]
      .filter((i) => !visitedIndices.has(i))
      .flatMap((i) => {
        visitedIndices.add(i);
        const geometry = this.pointGeometries[i];

        if (getDistance(geometry, point) < this.maxRadius) {
          // Gets neighbors based on relation to maxRadius
          return [geometry, ...this.getRadialNeighbors(i, point, visitedIndices)];
        }

        return [];
      });
  }
}
