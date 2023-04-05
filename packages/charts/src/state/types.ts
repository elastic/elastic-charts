/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Cell } from '../chart_types/heatmap/layout/types/viewmodel_types';
import { Pixels } from '../common/geometry';
import { AnnotationType, BaseDatum, LineAnnotationDatum, RectAnnotationDatum } from '../specs';
import { Accessor } from '../utils/accessor';
import type { Datum, Position } from '../utils/common';
import type { GeometryValue } from '../utils/geometry';
import { LineAnnotationStyle, RectAnnotationStyle } from '../utils/themes/theme';

/** @public */
export interface DebugStateAxis {
  id: string;
  position: Position;
  title?: string;
  labels: string[];
  values: any[];
  gridlines: {
    y: number;
    x: number;
  }[];
}

/** @public */
export interface DebugStateAxes {
  x: DebugStateAxis[];
  y: DebugStateAxis[];
}

/** @public */
export interface DebugStateLegendItem {
  key: string;
  name: string;
  color: string;
}

/** @public */
export interface DebugStateLegend {
  items: DebugStateLegendItem[];
}

/** @public */
export interface DebugStateBase {
  key: string;
  name: string;
  color: string;
}

/** @public */
export type DebugStateValue = Pick<GeometryValue, 'x' | 'y' | 'mark'>;

/**@public */
export interface DebugStateLineConfig {
  visible: boolean;
  path: string;
  points: DebugStateValue[];
  visiblePoints: boolean;
}

/** @public */
export interface DebugStateLine extends DebugStateBase, DebugStateLineConfig {}

/** @public */
export type DebugStateArea = Omit<DebugStateLine, 'points' | 'visiblePoints'> & {
  path: string;
  lines: {
    y0?: DebugStateLineConfig;
    y1: DebugStateLineConfig;
  };
};

/** @public */
export type DebugStateBar = DebugStateBase & {
  visible: boolean;
  bars: DebugStateValue[];
  labels: any[];
};

type CellDebug = Pick<Cell, 'value' | 'formatted' | 'x' | 'y' | 'datum'> & { fill: string };

type HeatmapDebugState = {
  cells: CellDebug[];
  selection: {
    area: { x: number; y: number; width: number; height: number } | null;
    data: { x: Array<string | number>; y: Array<string | number> } | null;
  };
};

/** @public */
export type SinglePartitionDebugState = {
  name: string;
  depth: number;
  color: string;
  value: number;
  coords: [Pixels, Pixels];
};

/** @public */
export type PartitionDebugState = {
  panelTitle: string;
  partitions: Array<SinglePartitionDebugState>;
};

/** @public */
export type DebugStateAnnotations = {
  id: string;
  style: RectAnnotationStyle | LineAnnotationStyle;
  type: typeof AnnotationType.Line | typeof AnnotationType.Rectangle;
  domainType?: 'xDomain' | 'yDomain';
  data: LineAnnotationDatum | RectAnnotationDatum;
};

/**
 * Describes _visible_ chart state for use in functional tests
 *
 * TODO: add other chart types to debug state
 * @public
 */
export interface DebugState {
  legend?: DebugStateLegend;
  axes?: DebugStateAxes;
  areas?: DebugStateArea[];
  lines?: DebugStateLine[];
  bars?: DebugStateBar[];
  annotations?: DebugStateAnnotations[];
  /** Heatmap chart debug state */
  heatmap?: HeatmapDebugState;
  partition?: PartitionDebugState[];
}

/**
 * Contains the value of the non-dependent variable at the point where the mouse
 * pointer is.
 *
 * @public
 */
export interface PointerValue<D extends BaseDatum = Datum> {
  /**
   * The value
   */
  value: any;
  /**
   * The formatted value to display
   */
  formattedValue: string;
  /**
   * The accessor linked to the current tooltip value
   */
  valueAccessor?: Accessor<D>;
}
