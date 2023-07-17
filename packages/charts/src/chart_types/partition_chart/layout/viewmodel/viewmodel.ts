/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  fillTextLayout,
  getRectangleRowGeometry,
  getSectorRowGeometry,
  inSectorRotation,
  nodeId,
} from './fill_text_layout';
import { linkTextLayout } from './link_text_layout';
import { colorToRgba, RGBATupleToString } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { TAU } from '../../../../common/constants';
import { fillTextColor } from '../../../../common/fill_text_color';
import {
  Distance,
  meanAngle,
  Pixels,
  PointTuple,
  Radius,
  trueBearingToStandardPositionAngle,
} from '../../../../common/geometry';
import { Part } from '../../../../common/text_utils';
import { GroupByAccessor } from '../../../../specs';
import { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { ColorVariant, StrokeStyle } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { Logger } from '../../../../utils/logger';
import { FillLabelConfig, PartitionStyle } from '../../../../utils/themes/partition';
import { BackgroundStyle } from '../../../../utils/themes/theme';
import { Layer, PartitionSpec } from '../../specs';
import { MODEL_KEY, percentValueGetter } from '../config';
import { PartitionLayout } from '../types/config_types';
import {
  nullShapeViewModel,
  OutsideLinksViewModel,
  PartitionSmallMultiplesModel,
  PickFunction,
  QuadViewModel,
  RawTextGetter,
  RowSet,
  ShapeTreeNode,
  ShapeViewModel,
  ValueGetterFunction,
} from '../types/viewmodel_types';
import { ringSectorConstruction } from '../utils/circline_geometry';
import {
  aggregateAccessor,
  ArrayEntry,
  CHILDREN_KEY,
  depthAccessor,
  entryKey,
  entryValue,
  HierarchyOfArrays,
  mapEntryValue,
  parentAccessor,
  pathAccessor,
  SORT_INDEX_KEY,
  sortIndexAccessor,
} from '../utils/group_by_rollup';
import { sunburst } from '../utils/sunburst';
import { getTopPadding, LayerLayout, treemap } from '../utils/treemap';
import { waffle } from '../utils/waffle';

/** @internal */
export const isMosaic = (p: PartitionLayout | undefined) => p === PartitionLayout.mosaic;

/** @internal */
export const isTreemap = (p: PartitionLayout | undefined) => p === PartitionLayout.treemap;

/** @internal */
export const isSunburst = (p: PartitionLayout | undefined) => p === PartitionLayout.sunburst;

/** @internal */
export const isIcicle = (p: PartitionLayout | undefined) => p === PartitionLayout.icicle;

/** @internal */
export const isFlame = (p: PartitionLayout | undefined) => p === PartitionLayout.flame;

/** @internal */
export const isWaffle = (p: PartitionLayout | undefined) => p === PartitionLayout.waffle;

/** @internal */
export const isLinear = (p: PartitionLayout | undefined) => isFlame(p) || isIcicle(p);

/** @internal */
export const isSimpleLinear = (layout: PartitionLayout, fillLabel: FillLabelConfig, layers: Layer[]) =>
  isLinear(layout) && layers.every((l) => l.fillLabel?.clipText ?? fillLabel?.clipText);

function grooveAccessor(n: ArrayEntry) {
  return entryValue(n).depth > 1 ? 1 : [0, 2][entryValue(n).depth] ?? NaN;
}

function topGrooveAccessor(topGroovePx: Pixels) {
  return (n: ArrayEntry) => (entryValue(n).depth > 0 ? topGroovePx : grooveAccessor(n));
}

function rectangleFillOrigins(n: ShapeTreeNode): PointTuple {
  return [(n.x0 + n.x1) / 2, (n.y0 + n.y1) / 2];
}

/**
 * @internal
 */
export const ringSectorInnerRadius = (n: ShapeTreeNode): Radius => n.y0px;

/**
 * @internal
 */
export const ringSectorOuterRadius = (n: ShapeTreeNode): Radius => n.y1px;

/**
 * @internal
 */
export const ringSectorMiddleRadius = (n: ShapeTreeNode): Radius => n.yMidPx;

function sectorFillOrigins(fillOutside: boolean) {
  return (node: ShapeTreeNode): [number, number] => {
    const midAngle = (node.x0 + node.x1) / 2;
    const divider = 10;
    const innerBias = fillOutside ? 9 : 1;
    const outerBias = divider - innerBias;
    const radius = (innerBias * ringSectorInnerRadius(node) + outerBias * ringSectorOuterRadius(node)) / divider;
    const cx = Math.cos(trueBearingToStandardPositionAngle(midAngle)) * radius;
    const cy = Math.sin(trueBearingToStandardPositionAngle(midAngle)) * radius;
    return [cx, cy];
  };
}

const minRectHeightForText: Pixels = 8;

/** @internal */
export function makeQuadViewModel(
  childNodes: ShapeTreeNode[],
  layers: Layer[],
  sectorLineWidth: Pixels,
  sectorLineStroke: StrokeStyle,
  smAccessorValue: ReturnType<GroupByAccessor>,
  index: number,
  innerIndex: number,
  fillLabel: FillLabelConfig,
  { color: backgroundColor, fallbackColor: fallbackBGColor }: BackgroundStyle,
): QuadViewModel[] {
  if (colorToRgba(backgroundColor)[3] < 1) {
    // Override handled in fill_text_color.ts
    Logger.expected(
      'Text contrast requires an opaque background color, using fallbackColor',
      'an opaque color',
      backgroundColor,
    );
  }
  return childNodes.map((node) => {
    const layer = layers[node.depth - 1];
    const fill = layer?.shape?.fillColor ?? RGBATupleToString(Colors.DarkOpaqueRed.rgba);
    const entry = node[MODEL_KEY][CHILDREN_KEY][node[SORT_INDEX_KEY]];
    const fillColor = !entry
      ? RGBATupleToString(Colors.DarkOpaqueRed.rgba)
      : typeof fill === 'function'
      ? fill(node.dataName, node.sortIndex, entryValue(entry), node[MODEL_KEY].children)
      : fill;
    const strokeWidth = sectorLineWidth;
    const strokeStyle = sectorLineStroke;
    const textNegligible = node.y1px - node.y0px < minRectHeightForText;
    const textColor = textNegligible
      ? Colors.Transparent.keyword
      : fillLabel.textColor === ColorVariant.Adaptive
      ? fillTextColor(fallbackBGColor, fillColor, backgroundColor)
      : fillLabel.textColor;

    return { index, innerIndex, smAccessorValue, strokeWidth, strokeStyle, fillColor, textColor, ...node };
  });
}

/** @internal */
export function makeOutsideLinksViewModel(
  outsideFillNodes: ShapeTreeNode[],
  rowSets: RowSet[],
  linkLabelRadiusPadding: Distance,
): OutsideLinksViewModel[] {
  return outsideFillNodes
    .map<OutsideLinksViewModel>((node, i: number) => {
      const rowSet = rowSets[i];
      if (!rowSet?.rows.reduce((p, row) => p + row.rowWords.length, 0)) return { points: [] };
      const radius = ringSectorOuterRadius(node);
      const midAngle = trueBearingToStandardPositionAngle(meanAngle(node.x0, node.x1));
      const cos = Math.cos(midAngle);
      const sin = Math.sin(midAngle);
      const x0 = cos * radius;
      const y0 = sin * radius;
      const x = cos * (radius + linkLabelRadiusPadding);
      const y = sin * (radius + linkLabelRadiusPadding);
      return {
        points: [
          [x0, y0],
          [x, y],
        ],
      };
    })
    .filter(({ points }: OutsideLinksViewModel) => points.length > 1);
}

/** @internal */
export interface RectangleConstruction {
  x0: Pixels;
  x1: Pixels;
  y0: Pixels;
  y1: Pixels;
}

function rectangleConstruction(treeHeight: number, topGroove: number | null) {
  return function rectangleConstructionClosure(node: ShapeTreeNode): RectangleConstruction {
    return node.depth < treeHeight && topGroove !== null
      ? {
          x0: node.x0,
          y0: node.y0px,
          x1: node.x1,
          y1: node.y0px + getTopPadding(topGroove, node.y1px - node.y0px),
        }
      : {
          x0: node.x0,
          y0: node.y0px,
          x1: node.x1,
          y1: node.y1px,
        };
  };
}

const rawChildNodes = (
  partitionLayout: PartitionLayout,
  tree: HierarchyOfArrays,
  topGroove: number,
  width: number,
  height: number,
  clockwiseSectors: boolean,
  specialFirstInnermostSector: boolean,
  maxDepth: number,
): Array<Part> => {
  const totalValue = tree.reduce((p: number, n: ArrayEntry): number => p + mapEntryValue(n), 0);
  switch (partitionLayout) {
    case PartitionLayout.sunburst:
      const sunburstValueToAreaScale = TAU / totalValue;
      const sunburstAreaAccessor = (e: ArrayEntry) => sunburstValueToAreaScale * mapEntryValue(e);
      return sunburst(tree, sunburstAreaAccessor, { x0: 0, y0: -1 }, clockwiseSectors, specialFirstInnermostSector);

    case PartitionLayout.treemap:
    case PartitionLayout.mosaic:
      const treemapInnerArea = width * height; // assuming 1 x 1 unit square
      const treemapValueToAreaScale = treemapInnerArea / totalValue;
      const treemapAreaAccessor = (e: ArrayEntry) => treemapValueToAreaScale * mapEntryValue(e);
      return treemap(
        tree,
        treemapAreaAccessor,
        topGrooveAccessor(topGroove),
        grooveAccessor,
        {
          x0: 0,
          y0: 0,
          width,
          height,
        },
        isMosaic(partitionLayout) ? [LayerLayout.vertical, LayerLayout.horizontal] : [],
      );

    case PartitionLayout.waffle:
      return waffle(tree, totalValue, {
        x0: 0,
        y0: 0,
        width,
        height,
      });

    case PartitionLayout.icicle:
    case PartitionLayout.flame:
      const icicleLayout = isIcicle(partitionLayout);
      const icicleValueToAreaScale = width / totalValue;
      const icicleAreaAccessor = (e: ArrayEntry) => icicleValueToAreaScale * mapEntryValue(e);
      const icicleRowHeight = height / (maxDepth - 1);
      const result = sunburst(tree, icicleAreaAccessor, { x0: 0, y0: -icicleRowHeight }, true, false, icicleRowHeight);
      return icicleLayout
        ? result
        : result.map(({ y0, y1, ...rest }) => ({ y0: height - y1, y1: height - y0, ...rest }));

    default:
      // Let's ensure TS complains if we add a new PartitionLayout type in the future without creating a `case` for it
      // Hopefully, a future TS version will do away with the need for this boilerplate `default`. Now TS even needs a `default` even if all possible cases are covered.
      // Even in runtime it does something sensible (returns the empty set); explicit throwing is avoided as it can deopt the function
      return ((layout: never) => layout ?? [])(partitionLayout);
  }
};

/** @internal */
export function shapeViewModel(
  textMeasure: TextMeasure,
  spec: PartitionSpec,
  style: PartitionStyle,
  chartDimensions: Size,
  rawTextGetter: RawTextGetter,
  valueGetter: ValueGetterFunction,
  tree: HierarchyOfArrays,
  backgroundStyle: BackgroundStyle,
  panelModel: PartitionSmallMultiplesModel,
): ShapeViewModel {
  const {
    layout,
    layers,
    topGroove,
    valueFormatter: specifiedValueFormatter,
    percentFormatter: specifiedPercentFormatter,
    fillOutside,
    clockwiseSectors,
    maxRowCount,
    specialFirstInnermostSector,
    animation,
  } = spec;
  const { emptySizeRatio, outerSizeRatio, linkLabel, minFontSize, sectorLineWidth, sectorLineStroke, fillLabel } =
    style;
  const { width, height } = chartDimensions;
  const { marginLeftPx, marginTopPx, panel } = panelModel;

  const treemapLayout = isTreemap(layout);
  const mosaicLayout = isMosaic(layout);
  const sunburstLayout = isSunburst(layout);
  const icicleLayout = isIcicle(layout);
  const flameLayout = isFlame(layout);
  const simpleLinear = isSimpleLinear(layout, fillLabel, layers);
  const waffleLayout = isWaffle(layout);

  const diskCenter = isSunburst(layout)
    ? {
        x: marginLeftPx + panel.innerWidth / 2,
        y: marginTopPx + panel.innerHeight / 2,
      }
    : {
        x: marginLeftPx,
        y: marginTopPx,
      };

  // don't render anything if the total, the width or height is not positive
  if (!(width > 0) || !(height > 0) || tree.length === 0) {
    return nullShapeViewModel(layout, style, diskCenter);
  }

  const longestPath = (entry?: ArrayEntry): number => {
    const [, node] = entry ?? [];
    if (!node) return NaN; // should never happen
    const { children, path } = node;
    return children.length > 0 ? children.reduce((p, n) => Math.max(p, longestPath(n)), 0) : path.length;
  };

  const maxDepth = longestPath(tree[0]) - 2; // don't include the root node
  const childNodes = rawChildNodes(
    layout,
    tree,
    topGroove,
    panel.innerWidth,
    panel.innerHeight,
    clockwiseSectors,
    specialFirstInnermostSector,
    maxDepth,
  );

  const shownChildNodes = childNodes.filter((n: Part) => {
    const layerIndex = entryValue(n.node).depth - 1;
    const layer = layers[layerIndex];
    return !layer || !layer.showAccessor || layer.showAccessor(entryKey(n.node));
  });

  // use the smaller of the two sizes, as a circle fits into a square
  const circleMaximumSize = Math.min(
    panel.innerWidth,
    panel.innerHeight - (panel.title.length > 0 ? panel.fontSize * 2 : 0),
  );
  const outerRadius: Radius = Math.min(outerSizeRatio * circleMaximumSize, circleMaximumSize - sectorLineWidth) / 2;
  const innerRadius: Radius = outerRadius - (1 - emptySizeRatio) * outerRadius;
  const treeHeight = shownChildNodes.reduce((p: number, n: Part) => Math.max(p, entryValue(n.node).depth), 0); // 1: pie, 2: two-ring donut etc.
  const ringThickness = (outerRadius - innerRadius) / treeHeight;
  const partToShapeFn = partToShapeTreeNode(!sunburstLayout, innerRadius, ringThickness);
  const quadViewModel = makeQuadViewModel(
    shownChildNodes.slice(1).map(partToShapeFn),
    layers,
    sectorLineWidth,
    sectorLineStroke,
    panelModel.smAccessorValue,
    panelModel.index,
    panelModel.innerIndex,
    fillLabel,
    backgroundStyle,
  );

  // fill text
  const roomCondition = (n: ShapeTreeNode) => {
    const diff = n.x1 - n.x0;
    return sunburstLayout
      ? (diff < 0 ? TAU + diff : diff) * ringSectorMiddleRadius(n) > Math.max(minFontSize, linkLabel.maximumSection)
      : n.x1 - n.x0 > minFontSize && n.y1px - n.y0px > minFontSize;
  };

  const nodesWithRoom = quadViewModel.filter(roomCondition);
  const outsideFillNodes = fillOutside && sunburstLayout ? nodesWithRoom : [];

  const textFillOrigins = nodesWithRoom.map(sunburstLayout ? sectorFillOrigins(fillOutside) : rectangleFillOrigins);

  const valueFormatter = valueGetter === percentValueGetter ? specifiedPercentFormatter : specifiedValueFormatter;

  const getRowSets = sunburstLayout
    ? fillTextLayout(
        ringSectorConstruction(spec, style, innerRadius, ringThickness),
        getSectorRowGeometry,
        inSectorRotation(style.horizontalTextEnforcer, style.horizontalTextAngleThreshold),
      )
    : simpleLinear || waffleLayout
    ? () => [] // no multirow layout needed for simpleLinear partitions; no text at all for waffles
    : fillTextLayout(
        rectangleConstruction(treeHeight, treemapLayout || mosaicLayout ? topGroove : null),
        getRectangleRowGeometry,
        () => 0,
      );

  const rowSets: RowSet[] = getRowSets(
    textMeasure,
    rawTextGetter,
    valueGetter,
    valueFormatter,
    nodesWithRoom,
    style,
    layers,
    textFillOrigins,
    maxRowCount,
    !sunburstLayout,
    !(treemapLayout || mosaicLayout),
  );

  // whiskers (ie. just lines, no text) for fill text outside the outer radius
  const outsideLinksViewModel = makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabel.radiusPadding);

  // linked text
  const currentY = [-height, -height, -height, -height];

  const nodesWithoutRoom =
    fillOutside || treemapLayout || mosaicLayout || icicleLayout || flameLayout || waffleLayout
      ? [] // outsideFillNodes and linkLabels are in inherent conflict due to very likely overlaps
      : quadViewModel.filter((n: ShapeTreeNode) => {
          const id = nodeId(n);
          const foundInFillText = rowSets.find((r: RowSet) => r.id === id);
          // successful text render if found, and has some row(s)
          return !(foundInFillText && foundInFillText.rows.length > 0);
        });
  const maxLinkedLabelTextLength = style.linkLabel.maxTextLength;
  const linkLabelViewModels = linkTextLayout(
    panel.innerWidth,
    panel.innerHeight,
    textMeasure,
    style,
    nodesWithoutRoom,
    currentY,
    outerRadius,
    rawTextGetter,
    valueGetter,
    valueFormatter,
    maxLinkedLabelTextLength,
    {
      x: width * panelModel.left + panel.innerWidth / 2,
      y: height * panelModel.top + panel.innerHeight / 2,
    },
    backgroundStyle,
  );

  const pickQuads: PickFunction = sunburstLayout
    ? (x, y) => {
        return quadViewModel.filter(({ x0, y0px, x1, y1px }) => {
          const angleX = (Math.atan2(y, x) + TAU / 4 + TAU) % TAU;
          const yPx = Math.hypot(x, y);
          return x0 <= angleX && angleX <= x1 && y0px <= yPx && yPx <= y1px;
        });
      }
    : (x, y, { currentFocusX0, currentFocusX1 }) => {
        return quadViewModel.filter(({ x0, y0px, x1, y1px }) => {
          const scale = width / (currentFocusX1 - currentFocusX0);
          const fx0 = Math.max((x0 - currentFocusX0) * scale, 0);
          const fx1 = Math.min((x1 - currentFocusX0) * scale, width);
          return fx0 <= x && x < fx1 && y0px < y && y <= y1px;
        });
      };

  // combined viewModel
  return {
    layout,
    smAccessorValue: panelModel.smAccessorValue,
    index: panelModel.index,
    innerIndex: panelModel.innerIndex,
    width: panelModel.width,
    height: panelModel.height,
    top: panelModel.top,
    left: panelModel.left,
    innerRowCount: panelModel.innerRowCount,
    innerColumnCount: panelModel.innerColumnCount,
    innerRowIndex: panelModel.innerRowIndex,
    innerColumnIndex: panelModel.innerColumnIndex,
    marginLeftPx: panelModel.marginLeftPx,
    marginTopPx: panelModel.marginTopPx,
    panel: {
      ...panelModel.panel,
    },
    style,
    layers,
    diskCenter,
    quadViewModel,
    rowSets,
    linkLabelViewModels,
    outsideLinksViewModel,
    pickQuads,
    outerRadius,
    chartDimensions,
    animation,
  };
}

function partToShapeTreeNode(treemapLayout: boolean, innerRadius: Radius, ringThickness: number) {
  return ({ node, x0, x1, y0, y1 }: Part): ShapeTreeNode => ({
    dataName: entryKey(node),
    depth: depthAccessor(node),
    value: aggregateAccessor(node),
    [MODEL_KEY]: parentAccessor(node),
    sortIndex: sortIndexAccessor(node),
    path: pathAccessor(node),
    x0,
    x1,
    y0,
    y1,
    y0px: treemapLayout ? y0 : innerRadius + y0 * ringThickness,
    y1px: treemapLayout ? y1 : innerRadius + y1 * ringThickness,
    yMidPx: treemapLayout ? (y0 + y1) / 2 : innerRadius + ((y0 + y1) / 2) * ringThickness,
  });
}
