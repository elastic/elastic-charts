/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultiplesSeriesDomains } from '../../../../common/panel_utils';
import { ScaleBand, ScaleContinuous } from '../../../../scales';
import { BarGeometry, AreaGeometry, LineGeometry, BubbleGeometry, PerPanel } from '../../../../utils/geometry';
import { GroupId } from '../../../../utils/ids';
import { XDomain, YDomain } from '../../domains/types';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import { DataSeries } from '../../utils/series';

/** @internal */
export interface Transform {
  x: number;
  y: number;
  rotate: number;
}

/** @internal */
export interface GeometriesCounts {
  points: number;
  bars: number;
  areas: number;
  areasPoints: number;
  lines: number;
  linePoints: number;
  bubbles: number;
  bubblePoints: number;
}

/** @internal */
export interface ComputedScales {
  xScale: ScaleBand | ScaleContinuous;
  yScales: Map<GroupId, ScaleContinuous>;
}

/** @internal */
export interface Geometries {
  bars: Array<PerPanel<BarGeometry[]>>;
  areas: Array<PerPanel<AreaGeometry>>;
  lines: Array<PerPanel<LineGeometry>>;
  bubbles: Array<PerPanel<BubbleGeometry>>;
}

/** @internal */
export interface ComputedGeometries {
  scales: ComputedScales;
  geometries: Geometries;
  geometriesIndex: IndexedGeometryMap;
  geometriesCounts: GeometriesCounts;
}

/** @internal */
export interface SeriesDomainsAndData extends SmallMultiplesSeriesDomains {
  xDomain: XDomain;
  yDomains: YDomain[];
  formattedDataSeries: DataSeries[];
}

/** @internal */
export interface LastValues {
  y0: number | null;
  y1: number | null;
}
