/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MarkBuffer } from '../../../specs';
import { getDistance, isFiniteNumber } from '../../../utils/common';
import { Delaunay, Bounds } from '../../../utils/d3-delaunay';
import { IndexedGeometry, PointGeometry } from '../../../utils/geometry';
import { Point } from '../../../utils/point';

/** @internal */
export type IndexedGeometrySpatialMapPoint = [number, number];

/** @internal */
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
    this.maxRadius = Math.max(this.maxRadius, ...points.map(({ radius }) => radius));
    const { pointGeometries } = this;
    points.forEach((p) => {
      if (isFiniteNumber(p.y)) pointGeometries.push(p);
    });
    this.points.push(
      ...points.map<IndexedGeometrySpatialMapPoint>(({ x, y }) => {
        // TODO: handle coincident points better
        // This nonce is used to slightly offset every point such that each point
        // has a unique position in the index. This number is only used in the index.
        // The other option would be to find the point(s) near a Point and add logic
        // to account for multiple values in the pointGeometries array. This would be
        // a very computationally expensive approach having to repeat for every point.
        const nonce = Math.random() * 0.000001;
        return [x + nonce, y];
      }),
    );

    if (this.points.length > 0) {
      // TODO: handle write/read init
      this.map = Delaunay.from(this.points);
    }
  }

  triangulation(bounds?: Bounds) {
    return this.map?.voronoi(bounds);
  }

  getMergeData() {
    return [...this.pointGeometries];
  }

  keys(): Array<number> {
    return this.pointGeometries.map(({ value: { x } }) => x);
  }

  find(point: Point, pointBuffer: MarkBuffer): IndexedGeometry[] {
    const elements = [];
    if (this.map !== null) {
      const index = this.map.find(point.x, point.y, this.searchStartIndex);
      const geometry = this.pointGeometries[index];

      if (geometry) {
        // Set next starting search index for faster lookup
        this.searchStartIndex = index;
        elements.push(geometry);
        this.getRadialNeighbors(index, point, new Set([index]), pointBuffer).forEach((g) => elements.push(g));
      }
    }

    return elements;
  }

  /**
   * Gets surrounding points whose radius could be within the active cursor position
   *
   */
  private getRadialNeighbors(
    selectedIndex: number,
    point: Point,
    visitedIndices: Set<number>,
    pointBuffer: MarkBuffer,
  ): IndexedGeometry[] {
    if (this.map === null) {
      return [];
    }

    const neighbors = [...this.map.neighbors(selectedIndex)];
    return neighbors.reduce<IndexedGeometry[]>((acc, i) => {
      if (visitedIndices.has(i)) {
        return acc;
      }

      visitedIndices.add(i);
      const geometry = this.pointGeometries[i];

      if (geometry) {
        acc.push(geometry);
        const radiusBuffer = typeof pointBuffer === 'number' ? pointBuffer : pointBuffer(geometry.radius);
        if (getDistance(geometry, point) < Math.min(this.maxRadius, radiusBuffer)) {
          // Gets neighbors based on relation to maxRadius
          this.getRadialNeighbors(i, point, visitedIndices, pointBuffer).forEach((g) => acc.push(g));
        }
      }

      return acc;
    }, []);
  }
}
