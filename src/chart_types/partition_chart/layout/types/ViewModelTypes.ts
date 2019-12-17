import { Config } from './ConfigTypes';
import { Coordinate, Distance, PointObject, PointTuple, Radian } from './GeometryTypes';
import { Color, FontWeight } from './Types';
import { config } from '../config/config';

export type LinkLabelVM = {
  link: [PointTuple, ...PointTuple[]]; // at least one point
  translate: [number, number];
  textAlign: CanvasTextAlign;
  text: string;
  width: Distance;
  verticalOffset: Distance;
};

export interface RowBox {
  text: string;
  width: Distance;
  verticalOffset: Distance;
  wordBeginning: Distance;
}

export interface TextRow {
  rowCentroidX: Coordinate;
  rowCentroidY: Coordinate;
  length: number;
  maximumLength: number;
  rowWords: Array<RowBox>;
}

export interface RowSet {
  id: string;
  rows: Array<TextRow>;
  fillTextColor: string;
  fillTextWeight: FontWeight;
  fontFamily: string;
  fontStyle: string;
  fontVariant: string;
  fontSize: number;
  rotation: Radian;
}

export interface QuadViewModel extends RingSectorGeometry {
  strokeWidth: number;
  fillColor: string;
}

export interface OutsideLinksViewModel {
  points: Array<PointTuple>;
}

export type ShapeViewModel = {
  config: Config;
  quadViewModel: QuadViewModel[];
  rowSets: RowSet[];
  linkLabelViewModels: LinkLabelVM[];
  outsideLinksViewModel: OutsideLinksViewModel[];
  diskCenter: PointObject;
};

export const nullSectorViewModel = (): ShapeViewModel => ({
  config,
  quadViewModel: [],
  rowSets: [],
  linkLabelViewModels: [],
  outsideLinksViewModel: [],
  diskCenter: { x: 0, y: 0 },
});
type TreeLevel = number;

interface AngleFromTo {
  x0: Radian;
  x1: Radian;
}

export interface TreeNode extends AngleFromTo {
  x0: Radian;
  x1: Radian;
  y0: TreeLevel;
  y1: TreeLevel;
  fill?: Color;
}

interface SectorGeomSpecY {
  y0px: Distance;
  y1px: Distance;
}

export interface RingSectorGeometry extends AngleFromTo, SectorGeomSpecY {}

export interface QuadTreeNode extends TreeNode, SectorGeomSpecY {
  yMidPx: Distance;
  depth: number;
  inRingIndex: number;
  data: { name: any; value?: any }; // todo remove optionality
  value: number;
}
