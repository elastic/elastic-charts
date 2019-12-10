import { ColorScale, Relation, SVGPathString, TextMeasure } from '../types/Types';
import { fillTextLayout, nodeId } from './fillTextLayout';
import { linkTextLayout } from './linkTextLayout';
import { Config } from '../types/ConfigTypes';
import { tau, trueBearingToStandardPositionAngle } from '../utils/math';
import { cyclicalHueInterpolator, getOpacity } from '../utils/calcs';
import { Distance, Pixels, Radian, Radius } from '../types/GeometryTypes';
import { lineWidthMult } from '../../renderer/canvas/canvasRenderers';
import { diffAngle, meanAngle } from '../geometry';
import { treemap as squarifiedTreemap } from '../utils/treemap';
import { sunburst } from '../utils/sunburst';
import {
  OutsideLinksViewModel,
  RowSet,
  SectorTreeNode,
  SectorViewModel,
  ShapeViewModel,
  TreeNode,
} from '../types/ViewModelTypes';
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
} from '../utils/groupByRollup';
import {
  arcMaker,
  fromRGB,
  makeColorScale,
  ringSectorInnerRadius,
  ringSectorMiddleRadius,
  ringSectorOuterRadius,
  toRGB,
} from '../utils/d3utils';
import { AccessorFn } from '../../../../utils/accessor';

export const makeSectorViewModel = (
  ringSectorPaths: SVGPathString[],
  childNodes: SectorTreeNode[],
  colorScale: ColorScale,
  sectorLineWidth: Pixels,
): Array<SectorViewModel> =>
  ringSectorPaths.map((arcPath: string, i: number) => {
    const d = childNodes[i];
    const opacityMultiplier = getOpacity(d);
    // while (d.depth > 1) d = d.parent;
    const { r, g, b, opacity } = toRGB(colorScale(d.data.name));
    const fillColor = fromRGB(r, g, b, opacity * opacityMultiplier).toString();
    const proxy = Math.abs(d.x1 - d.x0);
    const strokeWidth = Math.min(sectorLineWidth, lineWidthMult * proxy);
    return { strokeWidth, fillColor, arcPath };
  });

export const makeOutsideLinksViewModel = (
  outsideFillNodes: SectorTreeNode[],
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

const straighteningInfinityRadius = 5e4;

// todo break up this long function
export const shapeViewModel = (
  textMeasure: TextMeasure,
  config: Config,
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
    colors,
    palettes,
    fillOutside,
    linkLabel,
    rotation,
    fromAngle,
    toAngle,
    straightening,
    shear,
    collapse,
    clockwiseSectors,
    specialFirstInnermostSector,
    minFontSize,
    treemap,
  } = config;

  const innerWidth = width * (1 - Math.min(1, margin.left + margin.right));
  const innerHeight = height * (1 - Math.min(1, margin.top + margin.bottom));

  // We can precompute things invariant of how the rectangle is divvied up.
  // By introducing `scale`, we no longer need to deal with the dichotomy of
  // size as data value vs size as number of pixels in the rectangle

  const hierarchyMap = groupByRollup(groupByRollupAccessors, valueAccessor, aggregators.sum, facts);
  const hierarchy = mapsToArrays(hierarchyMap, aggregateComparator(mapEntryValue, childOrders.descending));

  const totalValue = hierarchy.reduce((p: number, n: ArrayEntry): number => p + mapEntryValue(n), 0);

  const paddingAccessor = () => 0;

  const angularRange = tau;
  const sunburstValueToAreaScale = angularRange / totalValue;
  const sunburstAreaAccessor = (e: ArrayEntry) => sunburstValueToAreaScale * mapEntryValue(e);
  const children = entryValue(hierarchy[0]).children;
  const sunburstViewModel = children
    ? sunburst(
        children,
        sunburstAreaAccessor,
        {
          x0: 0,
          y0: 0,
        },
        clockwiseSectors,
        specialFirstInnermostSector,
      )
    : [];

  const treemapInnerArea = 1; // assuming 1 x 1 unit square
  const treemapValueToAreaScale = treemapInnerArea / totalValue;
  const treemapAreaAccessor = (e: ArrayEntry) => treemapValueToAreaScale * mapEntryValue(e);
  const treemapViewModel = squarifiedTreemap(hierarchy, treemapAreaAccessor, paddingAccessor, {
    x0: 0,
    y0: 0,
    width: 1,
    height: 1,
  })
    .slice(1)
    .map((d: TreeNode) => Object.assign(d, { x0: d.x0 * tau, x1: d.x1 * tau }));

  const treeHeight = sunburstViewModel.reduce((p: number, n: any) => Math.max(p, entryValue(n.node).depth), 0); // 1: pie, 2: two-ring donut etc.

  // use the smaller of the two sizes, as a circle fits into a square
  const circleMaximumSize = Math.min(innerWidth, innerHeight);

  const unstraightenedOuterRadius: Radius = (outerSizeRatio * circleMaximumSize) / 2;
  const straighteningOffsetY = Math.pow(straightening, 5) * straighteningInfinityRadius;
  const center = {
    x: width * margin.left + innerWidth / 2,
    y: height * margin.top + innerHeight / 2 - straighteningOffsetY,
  };
  const outerRadius: Radius = unstraightenedOuterRadius + straighteningOffsetY;
  const innerRadius: Radius = outerRadius - (1 - emptySizeRatio) * unstraightenedOuterRadius;
  const ringThickness = (outerRadius - innerRadius) / treeHeight;

  // style calcs
  const colorMaker = cyclicalHueInterpolator(palettes[colors]);
  const colorScale = makeColorScale(colorMaker, sunburstViewModel.length + 1);

  const targetAngleRange = (toAngle - fromAngle) * (unstraightenedOuterRadius / outerRadius);
  const straighteningAngleDifference = (toAngle - fromAngle - targetAngleRange) / 2;
  const appliedFromAngle = fromAngle + straighteningAngleDifference;
  const appliedToAngle = toAngle - straighteningAngleDifference;
  const rawChildNodes = sunburstViewModel; // gets rid of the root node
  const treeMapChildren = treemapViewModel; // treeMap.descendants().slice(1); // gets rid of the root node
  const childNodes = rawChildNodes.map<SectorTreeNode>((n: any, index: number) => {
    // this block blends pie chart and treemap x/y values
    const nX0 = n.x0 * (1 - treemap) + treeMapChildren[index].x0 * treemap;
    const nX1 = n.x1 * (1 - treemap) + treeMapChildren[index].x1 * treemap;
    const y0 = n.y0 * (1 - treemap) + treeMapChildren[index].y0 * treemap;
    const y1 = n.y1 * (1 - treemap) + treeMapChildren[index].y1 * treemap;
    // in case of the pie - er, d3.partition -  {y0: 0, y1: 1} corresponds to the root node so we bump for compat, fixme
    const y0px = innerRadius + y0 * ringThickness + index * shear;
    const y1px = innerRadius + y1 * ringThickness + index * shear;
    const yMidPx = innerRadius + ((y0 + y1) / 2) * ringThickness + index * shear;

    const scale = (x: Radian) => appliedFromAngle + (x * (appliedToAngle - appliedFromAngle)) / tau;
    const nx0 = nX0 * (1 - collapse);
    const nx1 = nX1 - collapse * nX0;
    const xA = scale(Math.min(nx0, nx1));
    const xB = scale(Math.max(nx0, nx1));
    const x0 = xA + rotation;
    const x1 = xB + rotation;
    const node = n.node;
    return {
      data: { name: entryKey(node) },
      depth: depthAccessor(node),
      value: aggregateAccessor(node),
      x0,
      x1,
      y0,
      y1,
      y0px,
      y1px,
      yMidPx,
      inRingIndex: index,
    };
  });

  // ring sector paths
  const ringSectorPaths = childNodes.map(arcMaker);
  const sectorViewModel = makeSectorViewModel(ringSectorPaths, childNodes, colorScale, config.sectorLineWidth);

  // fill text
  const roomCondition = (n: SectorTreeNode) => {
    const diff = diffAngle(n.x1, n.x0); // todo check why it can be negative, eg. larger than tau/2 arc?
    const result =
      (diff < 0 ? tau + diff : diff) * ringSectorMiddleRadius(n) > Math.max(minFontSize, linkLabel.maximumSection);
    return result;
  };

  const nodesWithRoom = childNodes.filter(roomCondition);

  const outsideFillNodes = fillOutside ? nodesWithRoom : [];

  const textFillOrigins: [number, number][] = nodesWithRoom.map((node: SectorTreeNode) => {
    const midAngle = meanAngle(node.x0 * (1 - collapse), node.x1 - node.x0 * collapse);
    const divider = 10;
    const innerBias = fillOutside ? 9 : 1 + treemap * 8;
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
  });

  const rowSets: RowSet[] = fillTextLayout(
    textMeasure,
    rawTextGetter,
    valueFormatter,
    nodesWithRoom.map((n: SectorTreeNode) =>
      Object.assign({}, n, {
        y0: n.y0 + n.inRingIndex * shear,
        y0unsheared: n.y0,
        fill: sectorViewModel[n.inRingIndex].fillColor, // todo roll a proper join, as this current thing assumes 1:1 between sectors and sector VMs (in the future we may elide small, invisible sector VMs(
      }),
    ),
    textFillOrigins,
    innerRadius,
    ringThickness,
    config,
  );

  const outsideLinksViewModel = makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabel.radiusPadding);

  // linked text
  const currentY = [-height, -height, -height, -height];

  const nodesWithoutRoom = fillOutside
    ? [] // outsideFillNodes and linkLabels are in inherent conflict due to very likely overlaps
    : childNodes.filter((n: SectorTreeNode) => {
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
    sectorViewModel,
    rowSets,
    linkLabelViewModels,
    outsideLinksViewModel,
  };
};
