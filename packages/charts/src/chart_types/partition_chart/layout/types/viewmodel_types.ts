/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PartitionLayout } from './config_types';
import { LegacyAnimationConfig } from '../../../../common/animation';
import { CategoryKey } from '../../../../common/category';
import { Color, Colors } from '../../../../common/colors';
import {
  Coordinate,
  Distance,
  Pixels,
  PointObject,
  PointTuple,
  PointTuples,
  Radian,
  SizeRatio,
} from '../../../../common/geometry';
import { Font, HorizontalAlignment, VerticalAlignments } from '../../../../common/text_utils';
import { GroupByAccessor } from '../../../../specs';
import { LegendPath } from '../../../../state/actions/legend';
import { Size } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { Prettify } from '../../../../utils/types';
import { ContinuousDomainFocus } from '../../renderer/canvas/partition';
import { Layer } from '../../specs';
import { MODEL_KEY, ValueGetterName } from '../config';
import { ArrayNode, HierarchyOfArrays, Key } from '../utils/group_by_rollup';
import { LinkLabelsViewModelSpec } from '../viewmodel/link_text_layout';

/** @internal */
export type LinkLabelVM = {
  isRTL: boolean;
  linkLabels: PointTuples;
  translate: PointTuple;
  textAlign: CanvasTextAlign;
  text: string;
  valueText: string;
  width: Distance;
  valueWidth: Distance;
};

/** @internal */
export interface RowBox extends Font {
  text: string;
  width: Distance;
  wordBeginning: Distance;
  isValue?: boolean;
}

interface RowAnchor {
  rowAnchorX: Coordinate;
  rowAnchorY: Coordinate;
}

/** @internal */
export interface RowSpace extends RowAnchor {
  maximumRowLength: Distance;
}

/** @internal */
export interface TextRow extends RowAnchor {
  length: number;
  maximumLength: number;
  rowWords: Array<RowBox>;
}

/** @internal */
export interface RowSet {
  id: string;
  rows: Array<TextRow>;
  fillTextColor?: string;
  fontSize: number;
  rotation: Radian;
  verticalAlignment: VerticalAlignments;
  horizontalAlignment: HorizontalAlignment;
  isRTL: boolean;
  container?: any;
  clipText?: boolean;
}

/** @internal */
export interface SmallMultiplesDescriptors {
  smAccessorValue: ReturnType<GroupByAccessor>;
  index: number;
  innerIndex: number;
}

/** @internal */
export interface QuadViewModel extends ShapeTreeNode, SmallMultiplesDescriptors {
  strokeWidth: number;
  strokeStyle: string;
  fillColor: string;
  textColor: string;
}

/** @internal */
export interface OutsideLinksViewModel {
  points: Array<PointTuple>;
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels, focus: ContinuousDomainFocus) => Array<QuadViewModel>;

/** @internal */
export interface PartitionSmallMultiplesModel extends SmallMultiplesDescriptors {
  smAccessorValue: number | string;
  layout: PartitionLayout;
  top: SizeRatio;
  left: SizeRatio;
  width: SizeRatio;
  height: SizeRatio;
  innerRowCount: number;
  innerColumnCount: number;
  innerRowIndex: number;
  innerColumnIndex: number;
  marginLeftPx: Pixels;
  marginTopPx: Pixels;
  panel: {
    title: string;
    innerWidth: Pixels;
    innerHeight: Pixels;
    fontFace: Font;
    fontSize: number;
  };
}

/** @internal */
export interface ShapeViewModel extends PartitionSmallMultiplesModel, LegacyAnimationConfig {
  style: Theme['partition'];
  chartDimensions: Size;
  layers: Layer[];
  quadViewModel: QuadViewModel[];
  rowSets: RowSet[];
  linkLabelViewModels: LinkLabelsViewModelSpec;
  outsideLinksViewModel: OutsideLinksViewModel[];
  diskCenter: PointObject;
  pickQuads: PickFunction;
  outerRadius: number;
}

const defaultFont: Font = {
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontFamily: '',
  fontWeight: 'normal',
  textColor: Colors.Black.keyword,
};

/** @internal */
export const nullPartitionSmallMultiplesModel = (
  layout: PartitionLayout = PartitionLayout.sunburst,
): PartitionSmallMultiplesModel => ({
  index: 0,
  innerIndex: 0,
  smAccessorValue: '',
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  innerRowCount: 0,
  innerColumnCount: 0,
  innerRowIndex: 0,
  innerColumnIndex: 0,
  marginLeftPx: 0,
  marginTopPx: 0,
  layout,
  panel: {
    title: '',
    innerWidth: 0,
    innerHeight: 0,
    fontSize: 10,
    fontFace: {
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      textColor: Colors.Black.keyword,
    },
  },
});

/** @internal */
export const nullShapeViewModel = (
  layout: PartitionLayout = PartitionLayout.sunburst,
  style: Theme['partition'] = LIGHT_THEME.partition,
  diskCenter?: PointObject,
): ShapeViewModel => ({
  ...nullPartitionSmallMultiplesModel(layout),
  style,
  layers: [],
  quadViewModel: [],
  rowSets: [],
  linkLabelViewModels: {
    linkLabels: [],
    labelFontSpec: defaultFont,
    valueFontSpec: defaultFont,
    strokeColor: '',
  },
  outsideLinksViewModel: [],
  diskCenter: diskCenter || { x: 0, y: 0 },
  pickQuads: () => [],
  outerRadius: 0,
  chartDimensions: {
    width: 0,
    height: 0,
  },
  animation: { duration: 0 },
});

/** @internal */
export const hasMostlyRTLLabels = (geoms: ShapeViewModel[]): boolean =>
  geoms.reduce(
    (surplus: number, { rowSets }) =>
      surplus + rowSets.reduce((excess: number, { isRTL }) => excess + (isRTL ? 1 : -1), 0),
    0,
  ) > 0;

/** @public */
export type TreeLevel = number;

/** @public */
export interface AngleFromTo {
  x0: Radian;
  x1: Radian;
}

/** @internal */
export interface LayerFromTo {
  y0: TreeLevel;
  y1: TreeLevel;
}

interface TreeNodeInternal extends AngleFromTo {
  x0: Radian;
  x1: Radian;
  y0: TreeLevel;
  y1: TreeLevel;
  fill?: Color;
}

/**
 * @public
 */
export type TreeNode = Prettify<TreeNodeInternal>;

/**
 * @public
 */
export interface SectorGeomSpecY {
  y0px: Distance;
  y1px: Distance;
}

/** @public */
export type DataName = CategoryKey; // todo consider narrowing it to eg. primitives

interface ShapeTreeNodeInternal extends TreeNode, SectorGeomSpecY {
  yMidPx: Distance;
  depth: number;
  sortIndex: number;
  path: LegendPath;
  dataName: DataName;
  value: number;
  [MODEL_KEY]: ArrayNode;
}

/** @public */
export type ShapeTreeNode = Prettify<ShapeTreeNodeInternal>;

/** @public */
export type RawTextGetter = (node: ShapeTreeNode) => string;
/** @public */
export type ValueGetterFunction = (node: ShapeTreeNode) => number;
/** @public */
export type ValueGetter = ValueGetterFunction | ValueGetterName;
/** @public */
export type NodeColorAccessor = (key: Key, sortIndex: number, node: ArrayNode, tree: HierarchyOfArrays) => string;
