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

import { Scale } from '../../../../scales';
import { OrdinalDomain } from '../../../../utils/domain';
import {
  PointGeometry,
  BarGeometry,
  AreaGeometry,
  LineGeometry,
  BubbleGeometry,
  PerPanel,
} from '../../../../utils/geometry';
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
  xScale: Scale;
  yScales: Map<GroupId, Scale>;
}

/** @internal */
export interface Geometries {
  points: PointGeometry[];
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
export interface SeriesDomainsAndData {
  xDomain: XDomain;
  yDomains: YDomain[];
  smVDomain: OrdinalDomain;
  smHDomain: OrdinalDomain;
  formattedDataSeries: DataSeries[];
}

/** @internal */
export interface LastValues {
  y0: number | null;
  y1: number | null;
}
