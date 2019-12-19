import { Part, Relation, TextMeasure } from '../types/types';
import { linkTextLayout } from './link_text_layout';
import { Config, PartitionLayouts } from '../types/config_types';
import { tau, trueBearingToStandardPositionAngle } from '../utils/math';
import { getOpacity } from '../utils/calcs';
import { Distance, Pixels, Radius } from '../types/geometry_types';
import { meanAngle } from '../geometry';
import { treemap } from '../utils/treemap';
import { sunburst } from '../utils/sunburst';
import { AccessorFn } from '../../../../utils/accessor';
import { fromRGB, toRGB } from '../utils/d3_utils';
import { OutsideLinksViewModel, ShapeTreeNode, QuadViewModel, RowSet, ShapeViewModel } from '../types/viewmodel_types';
import { Layer } from '../../specs/index';
import {
  fillTextLayout,
  getRectangleRowGeometry,
  getSectorRowGeometry,
  inSectorRotation,
  nodeId,
  rectangleConstruction,
  ringSectorConstruction,
} from './fill_text_layout';
import {
  aggregateAccessor,
  aggregateComparator,
  aggregators,
  ArrayEntry,
  childOrders,
  depthAccessor,
  entryKey,
  entryValue,
  groupByRollup,
  mapEntryValue,
  mapsToArrays,
} from '../utils/group_by_rollup';

const angularRange = tau;
const paddingAccessor = (n: ArrayEntry) => (entryValue(n).depth > 1 ? 1 : [0, 2][entryValue(n).depth]);
const rectangleFillOrigins = (n: ShapeTreeNode): [number, number] => [(n.x0 + n.x1) / 2, (n.y0 + n.y1) / 2];
export const ringSectorInnerRadius = (n: ShapeTreeNode): Radius => n.y0px;
export const ringSectorOuterRadius = (n: ShapeTreeNode): Radius => n.y1px;
export const ringSectorMiddleRadius = (n: ShapeTreeNode): Radius => n.yMidPx;

const sectorFillOrigins = (fillOutside: boolean) => (node: ShapeTreeNode): [number, number] => {
  const midAngle = (node.x0 + node.x1) / 2;
  const divider = 10;
  const innerBias = fillOutside ? 9 : 1;
  const outerBias = divider - innerBias;
  // prettier-ignore
  const radius =
    (  innerBias * ringSectorInnerRadius(node)
      + outerBias * ringSectorOuterRadius(node)
    )
    / divider;
  const cx = Math.cos(trueBearingToStandardPositionAngle(midAngle)) * radius;
  const cy = Math.sin(trueBearingToStandardPositionAngle(midAngle)) * radius;
  return [cx, cy];
};

export const makeQuadViewModel = (
  childNodes: ShapeTreeNode[],
  layers: Layer[],
  sectorLineWidth: Pixels,
): Array<QuadViewModel> =>
  childNodes.map((node, index, a) => {
    const opacityMultiplier = getOpacity(node);
    const layer = layers[node.depth - 1];
    const fillColorSpec = layer && layer.shape && layer.shape.fillColor;
    const fill = fillColorSpec || 'rgba(128,0,0,0.5)';
    const shapeFillColor = typeof fill === 'function' ? fill(node, index, a) : fill;
    const { r, g, b, opacity } = toRGB(shapeFillColor);
    const fillColor = fromRGB(r, g, b, opacity * opacityMultiplier).toString();
    const strokeWidth = sectorLineWidth;
    const { x0, x1, y0px, y1px } = node;
    return { strokeWidth, fillColor, x0, x1, y0px, y1px };
  });

export const makeOutsideLinksViewModel = (
  outsideFillNodes: ShapeTreeNode[],
  rowSets: RowSet[],
  linkLabelRadiusPadding: Distance,
): OutsideLinksViewModel[] =>
  outsideFillNodes
    .map<OutsideLinksViewModel>((node, i: number) => {
      const rowSet = rowSets[i];
      if (!rowSet.rows.reduce((p, row) => p + row.rowWords.length, 0)) return { points: [] };
      const radius = ringSectorOuterRadius(node);
      const midAngle = trueBearingToStandardPositionAngle(meanAngle(node.x0, node.x1));
      const cos = Math.cos(midAngle);
      const sin = Math.sin(midAngle);
      const x0 = cos * radius;
      const y0 = sin * radius;
      const x = cos * (radius + linkLabelRadiusPadding);
      const y = sin * (radius + linkLabelRadiusPadding);
      return { points: [[x0, y0], [x, y]] };
    })
    .filter(({ points }: OutsideLinksViewModel) => points.length > 1);

// todo break up this long function
export const shapeViewModel = (
  textMeasure: TextMeasure,
  config: Config,
  layers: Layer[],
  facts: Relation,
  rawTextGetter: Function, // todo improve typing
  valueAccessor: AccessorFn,
  valueFormatter: AccessorFn,
  groupByRollupAccessors: AccessorFn[],
): ShapeViewModel => {
  const {
    width,
    height,
    margin,
    emptySizeRatio,
    outerSizeRatio,
    fillOutside,
    linkLabel,
    clockwiseSectors,
    specialFirstInnermostSector,
    minFontSize,
    hierarchicalLayout,
  } = config;

  const innerWidth = width * (1 - Math.min(1, margin.left + margin.right));
  const innerHeight = height * (1 - Math.min(1, margin.top + margin.bottom));

  const center = {
    x: width * margin.left + innerWidth / 2,
    y: height * margin.top + innerHeight / 2,
  };

  const aggregator = aggregators.sum;

  // don't render anything if there are no tuples, or some are negative, or the total is not positive
  if (
    facts.length === 0 ||
    facts.some((n) => valueAccessor(n) < 0) ||
    facts.reduce((p: number, n) => aggregator.reducer(p, valueAccessor(n)), aggregator.identity()) <= 0
  ) {
    return {
      config,
      diskCenter: center,
      quadViewModel: [],
      rowSets: [],
      linkLabelViewModels: [],
      outsideLinksViewModel: [],
    };
  }

  // We can precompute things invariant of how the rectangle is divvied up.
  // By introducing `scale`, we no longer need to deal with the dichotomy of
  // size as data value vs size as number of pixels in the rectangle

  const hierarchyMap = groupByRollup(groupByRollupAccessors, valueAccessor, aggregator, facts);
  const tree = mapsToArrays(hierarchyMap, aggregateComparator(mapEntryValue, childOrders.descending));

  const totalValue = tree.reduce((p: number, n: ArrayEntry): number => p + mapEntryValue(n), 0);

  const sunburstValueToAreaScale = angularRange / totalValue;
  const sunburstAreaAccessor = (e: ArrayEntry) => sunburstValueToAreaScale * mapEntryValue(e);
  const children = entryValue(tree[0]).children || [];
  const treemapLayout = hierarchicalLayout === PartitionLayouts.treemap;
  const treemapInnerArea = treemapLayout ? width * height : 1; // assuming 1 x 1 unit square
  const treemapValueToAreaScale = treemapInnerArea / totalValue;
  const treemapAreaAccessor = (e: ArrayEntry) => treemapValueToAreaScale * mapEntryValue(e);

  const rawChildNodes: Array<Part> = treemapLayout
    ? treemap(tree, treemapAreaAccessor, paddingAccessor, { x0: -width / 2, y0: -height / 2, width, height }).slice(1)
    : sunburst(children, sunburstAreaAccessor, { x0: 0, y0: 0 }, clockwiseSectors, specialFirstInnermostSector);

  // use the smaller of the two sizes, as a circle fits into a square
  const circleMaximumSize = Math.min(innerWidth, innerHeight);
  const outerRadius: Radius = (outerSizeRatio * circleMaximumSize) / 2;
  const innerRadius: Radius = outerRadius - (1 - emptySizeRatio) * outerRadius;
  const treeHeight = rawChildNodes.reduce((p: number, n: any) => Math.max(p, entryValue(n.node).depth), 0); // 1: pie, 2: two-ring donut etc.
  const ringThickness = (outerRadius - innerRadius) / treeHeight;

  const childNodes = rawChildNodes.map((n: any, index: number) => {
    return {
      data: { name: entryKey(n.node) },
      depth: depthAccessor(n.node),
      value: aggregateAccessor(n.node),
      x0: n.x0,
      x1: n.x1,
      y0: n.y0,
      y1: n.y1,
      y0px: treemapLayout ? n.y0 : innerRadius + n.y0 * ringThickness,
      y1px: treemapLayout ? n.y1 : innerRadius + n.y1 * ringThickness,
      yMidPx: treemapLayout ? (n.y0 + n.y1) / 2 : innerRadius + ((n.y0 + n.y1) / 2) * ringThickness,
      inRingIndex: index,
    };
  });

  // ring sector paths
  const quadViewModel = makeQuadViewModel(childNodes, layers, config.sectorLineWidth);

  // fill text
  const roomCondition = (n: ShapeTreeNode) => {
    const diff = n.x1 - n.x0;
    return treemapLayout
      ? n.x1 - n.x0 > minFontSize && n.y1px - n.y0px > minFontSize
      : (diff < 0 ? tau + diff : diff) * ringSectorMiddleRadius(n) > Math.max(minFontSize, linkLabel.maximumSection);
  };

  const nodesWithRoom = childNodes.filter(roomCondition);
  const outsideFillNodes = fillOutside && !treemapLayout ? nodesWithRoom : [];

  const textFillOrigins = nodesWithRoom.map(treemapLayout ? rectangleFillOrigins : sectorFillOrigins(fillOutside));

  const rowSets: RowSet[] = fillTextLayout(
    textMeasure,
    rawTextGetter,
    valueFormatter,
    nodesWithRoom.map((n: ShapeTreeNode) =>
      Object.assign({}, n, {
        y0: n.y0,
        fill: quadViewModel[n.inRingIndex].fillColor, // todo roll a proper join, as this current thing assumes 1:1 between sectors and sector VMs (in the future we may elide small, invisible sector VMs(
      }),
    ),
    config,
    layers,
    textFillOrigins,
    treemapLayout ? rectangleConstruction : ringSectorConstruction(config, innerRadius, ringThickness),
    treemapLayout ? getRectangleRowGeometry : getSectorRowGeometry,
    treemapLayout ? () => 0 : inSectorRotation(config.horizontalTextEnforcer, config.horizontalTextAngleThreshold),
  );

  const outsideLinksViewModel = makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabel.radiusPadding);

  // linked text
  const currentY = [-height, -height, -height, -height];

  const nodesWithoutRoom =
    fillOutside || treemapLayout
      ? [] // outsideFillNodes and linkLabels are in inherent conflict due to very likely overlaps
      : childNodes.filter((n: ShapeTreeNode) => {
          const id = nodeId(n);
          const foundInFillText = rowSets.find((r: RowSet) => r.id === id);
          // successful text render if found, and has some row(s)
          return !(foundInFillText && foundInFillText.rows.length !== 0);
        });

  const linkLabelViewModels = linkTextLayout(
    textMeasure,
    config,
    nodesWithoutRoom,
    currentY,
    outerRadius,
    rawTextGetter,
  );

  // combined viewModel
  return {
    config,
    diskCenter: center,
    quadViewModel: quadViewModel,
    rowSets,
    linkLabelViewModels,
    outsideLinksViewModel,
  };
};
