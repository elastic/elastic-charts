import { Config } from './ConfigTypes';
import { Coordinate, Distance, PointObject, PointTuple, Radian } from './GeometryTypes';
import { Color, FontWeight } from './Types';

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

export interface SectorViewModel {
  strokeWidth: number;
  fillColor: string;
  arcPath: string;
}

export interface OutsideLinksViewModel {
  points: Array<PointTuple>;
}

export type ShapeViewModel = {
  config: Config;
  sectorViewModel: SectorViewModel[];
  rowSets: RowSet[];
  linkLabelViewModels: LinkLabelVM[];
  outsideLinksViewModel: OutsideLinksViewModel[];
  diskCenter: PointObject;
};

type TreeLevel = number;

export interface TreeNode {
  x0: Radian;
  x1: Radian;
  y0: TreeLevel;
  y1: TreeLevel;
  y0unsheared?: TreeLevel; // todo remove or mandate unsheared; other optionals here are a red herring too
  fill?: Color;
}

export interface SectorTreeNode extends TreeNode {
  y0px: Distance;
  y1px: Distance;
  yMidPx: Distance;
  depth: number;
  inRingIndex: number;
  data: { name: any; value?: any }; // todo remove optionality
  value: number;
}
