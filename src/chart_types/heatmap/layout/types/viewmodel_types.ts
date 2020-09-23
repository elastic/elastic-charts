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

import { Fill, Line, Stroke } from '../../../../geoms/types';
import { Point } from '../../../../utils/point';
import { Pixels } from '../../../partition_chart/layout/types/geometry_types';
import { config } from '../config/config';
import { HeatmapCellDatum, TextBox } from '../viewmodel/viewmodel';
import { Config } from './config_types';

/** @internal */
export interface Value {
  order: number;
  value: string | number;
  formatted: string;
}

/** @internal */
export interface Cell {
  x: number;
  y: number;
  yIndex: number;
  width: number;
  height: number;
  fill: Fill;
  stroke: Stroke;
  value: number;
  formatted: string;
  datum: HeatmapCellDatum;
}

/** @internal */
export interface HeatmapViewModel {
  gridOrigin: {
    x: number;
    y: number;
  };
  gridLines: {
    x: Line[];
    y: Line[];
    stroke: Stroke;
  };
  cells: Cell[];
  xValues: Array<TextBox>;
  yValues: Array<TextBox>;
  pageSize: number;
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Cell[] | TextBox;

/** @internal */
export type PickDragFunction = (points: [Point, Point]) => { cells: Cell[]; x: any[]; y: any[] };

/** @internal */
export type PickDragShapeFunction = (points: [Point, Point]) => { x: number; y: number; width: number; height: number };

/** @internal */
export type DragShape = ReturnType<PickDragShapeFunction>;

/** @internal */
export type ShapeViewModel = {
  config: Config;
  heatmapViewModel: HeatmapViewModel;
  pickQuads: PickFunction;
  pickDragArea: PickDragFunction;
  pickDragShape: PickDragShapeFunction;
};

/** @internal */
export const nullHeatmapViewModel: HeatmapViewModel = {
  gridOrigin: {
    x: 0,
    y: 0,
  },
  gridLines: {
    x: [],
    y: [],
    stroke: { width: 0, color: { r: 0, g: 0, b: 0, opacity: 0 } },
  },
  cells: [],
  xValues: [],
  yValues: [],
  pageSize: 0,
};

/** @internal */
export const nullShapeViewModel = (specifiedConfig?: Config): ShapeViewModel => ({
  config: specifiedConfig || config,
  heatmapViewModel: nullHeatmapViewModel,
  pickQuads: () => [],
  pickDragArea: () => ({ cells: [], x: [], y: [] }),
  pickDragShape: () => ({ x: 0, y: 0, width: 0, height: 0 }),
});
