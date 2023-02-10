/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { Color } from '../../../../common/colors';
import { Pixels } from '../../../../common/geometry';
import { PerPanelMap } from '../../../../common/panel_utils';
import { Box, Font, TextAlign } from '../../../../common/text_utils';
import { Fill, Line, Rect, Stroke } from '../../../../geoms/types';
import { HeatmapBrushEvent } from '../../../../specs/settings';
import { Point } from '../../../../utils/point';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Visible, HeatmapStyle } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { HeatmapCellDatum } from '../viewmodel/viewmodel';

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
  textColor: Color;
  fontSize: Pixels;
}

/** @internal */
export type GridCell = { x: NonNullable<PrimitiveValue>; y: NonNullable<PrimitiveValue> };

/** @internal */
export interface TextBox extends Box {
  value: NonNullable<PrimitiveValue>;
  x: number;
  y: number;
  align: TextAlign;
}

/** @internal */
export type HeatmapTitleConfig = Font &
  Visible & {
    fontSize: number;
    text: string;
    origin: Point;
    rotation: 0 | -90;
  };

/** @internal */
export interface HeatmapViewModel extends PerPanelMap {
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
  cellFontSize: (c: Cell) => Pixels;
  xValues: Array<TextBox>;
  yValues: Array<TextBox>;
  pageSize: number;
  primaryRow: boolean;
  primaryColumn: boolean;
  titles: HeatmapTitleConfig[];
}

/** @internal */
export function isPickedCells(v: unknown): v is Cell[] {
  return Array.isArray(v);
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Cell[] | TextBox;

/** @internal */
export type PickDragFunction = (points: [start: Point, end: Point]) => HeatmapBrushEvent;

/** @internal */
export type PickDragShapeFunction = (points: [start: Point, end: Point]) => Rect | null;

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
  smHorizontalAccessorValue?: string | number,
  smVerticalAccessorValue?: string | number,
) => Rect | null;

/** @internal */
export type PickCursorBand = (x: NonNullable<PrimitiveValue>) => Rect | undefined;

/** @internal */
export type PickGridCell = (x: Pixels, y: Pixels) => GridCell | undefined;

/** @internal */
export type DragShape = ReturnType<PickDragShapeFunction>;

/** @internal */
export type ShapeViewModel = {
  theme: HeatmapStyle;
  heatmapViewModels: HeatmapViewModel[];
  pickQuads: PickFunction;
  pickDragArea: PickDragFunction;
  pickDragShape: PickDragShapeFunction;
  pickHighlightedArea: PickHighlightedArea;
  pickGridCell: PickGridCell;
  pickCursorBand: PickCursorBand;
};

/** @internal */
export const nullShapeViewModel = (): ShapeViewModel => ({
  theme: LIGHT_THEME.heatmap,
  heatmapViewModels: [],
  pickQuads: () => [],
  pickDragArea: () => ({ cells: [], x: [], y: [], chartType: ChartType.Heatmap }),
  pickDragShape: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  pickHighlightedArea: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  pickGridCell: () => undefined,
  pickCursorBand: () => undefined,
});
