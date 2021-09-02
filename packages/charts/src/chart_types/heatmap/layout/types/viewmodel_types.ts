/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { Pixels } from '../../../../common/geometry';
import { Box } from '../../../../common/text_utils';
import { Fill, Line, Rect, Stroke } from '../../../../geoms/types';
import { Point } from '../../../../utils/point';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { HeatmapStyles } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { HeatmapBrushEvent } from '../../specs/heatmap';
import { HeatmapCellDatum } from '../viewmodel/viewmodel';

/** @internal */
export interface Value {
  order: number;
  value: string | number;
  formatted: string;
}

/** @public */
export interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
  yIndex: number;
  fill: Fill;
  stroke: Stroke;
  value: number;
  formatted: string;
  visible: boolean;
  datum: HeatmapCellDatum;
}

/** @internal */
export interface TextBox extends Box {
  value: NonNullable<PrimitiveValue>;
  x: number;
  y: number;
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
export function isPickedCells(v: unknown): v is Cell[] {
  return Array.isArray(v);
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Cell[] | TextBox;

/** @internal */
export type PickDragFunction = (points: [Point, Point]) => HeatmapBrushEvent;

/** @internal */
export type PickDragShapeFunction = (points: [Point, Point]) => Rect | null;

/**
 * From x and y coordinates in the data domain space to a canvas projected rectangle
 * that cover entirely the data domain coordinates provided.
 * If the data domain coordinates leaves within a bucket, then the full bucket is taken in consideration.
 * Used mainly for the Highlighter that shows the rounded selected area.
 * @internal
 */
export type PickHighlightedArea = (
  x: Array<NonNullable<PrimitiveValue>>,
  y: Array<NonNullable<PrimitiveValue>>,
) => Rect | null;

/** @internal */
export type DragShape = ReturnType<PickDragShapeFunction>;

/** @internal */
export type ShapeViewModel = {
  theme: HeatmapStyles;
  heatmapViewModel: HeatmapViewModel;
  pickQuads: PickFunction;
  pickDragArea: PickDragFunction;
  pickDragShape: PickDragShapeFunction;
  pickHighlightedArea: PickHighlightedArea;
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
export const nullShapeViewModel = (): ShapeViewModel => ({
  theme: LIGHT_THEME.heatmap,
  heatmapViewModel: nullHeatmapViewModel,
  pickQuads: () => [],
  pickDragArea: () => ({ cells: [], x: [], y: [], chartType: ChartType.Heatmap }),
  pickDragShape: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  pickHighlightedArea: () => ({ x: 0, y: 0, width: 0, height: 0 }),
});
