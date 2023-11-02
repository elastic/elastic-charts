"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeViewModel = exports.makeOutsideLinksViewModel = exports.makeQuadViewModel = exports.ringSectorMiddleRadius = exports.ringSectorOuterRadius = exports.ringSectorInnerRadius = exports.isSimpleLinear = exports.isLinear = exports.isWaffle = exports.isFlame = exports.isIcicle = exports.isSunburst = exports.isTreemap = exports.isMosaic = void 0;
const fill_text_layout_1 = require("./fill_text_layout");
const link_text_layout_1 = require("./link_text_layout");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const colors_1 = require("../../../../common/colors");
const constants_1 = require("../../../../common/constants");
const fill_text_color_1 = require("../../../../common/fill_text_color");
const geometry_1 = require("../../../../common/geometry");
const common_1 = require("../../../../utils/common");
const logger_1 = require("../../../../utils/logger");
const config_1 = require("../config");
const config_types_1 = require("../types/config_types");
const viewmodel_types_1 = require("../types/viewmodel_types");
const circline_geometry_1 = require("../utils/circline_geometry");
const group_by_rollup_1 = require("../utils/group_by_rollup");
const sunburst_1 = require("../utils/sunburst");
const treemap_1 = require("../utils/treemap");
const waffle_1 = require("../utils/waffle");
const isMosaic = (p) => p === config_types_1.PartitionLayout.mosaic;
exports.isMosaic = isMosaic;
const isTreemap = (p) => p === config_types_1.PartitionLayout.treemap;
exports.isTreemap = isTreemap;
const isSunburst = (p) => p === config_types_1.PartitionLayout.sunburst;
exports.isSunburst = isSunburst;
const isIcicle = (p) => p === config_types_1.PartitionLayout.icicle;
exports.isIcicle = isIcicle;
const isFlame = (p) => p === config_types_1.PartitionLayout.flame;
exports.isFlame = isFlame;
const isWaffle = (p) => p === config_types_1.PartitionLayout.waffle;
exports.isWaffle = isWaffle;
const isLinear = (p) => (0, exports.isFlame)(p) || (0, exports.isIcicle)(p);
exports.isLinear = isLinear;
const isSimpleLinear = (layout, fillLabel, layers) => (0, exports.isLinear)(layout) && layers.every((l) => { var _a, _b; return (_b = (_a = l.fillLabel) === null || _a === void 0 ? void 0 : _a.clipText) !== null && _b !== void 0 ? _b : fillLabel === null || fillLabel === void 0 ? void 0 : fillLabel.clipText; });
exports.isSimpleLinear = isSimpleLinear;
function grooveAccessor(n) {
    var _a;
    return (0, group_by_rollup_1.entryValue)(n).depth > 1 ? 1 : (_a = [0, 2][(0, group_by_rollup_1.entryValue)(n).depth]) !== null && _a !== void 0 ? _a : NaN;
}
function topGrooveAccessor(topGroovePx) {
    return (n) => ((0, group_by_rollup_1.entryValue)(n).depth > 0 ? topGroovePx : grooveAccessor(n));
}
function rectangleFillOrigins(n) {
    return [(n.x0 + n.x1) / 2, (n.y0 + n.y1) / 2];
}
const ringSectorInnerRadius = (n) => n.y0px;
exports.ringSectorInnerRadius = ringSectorInnerRadius;
const ringSectorOuterRadius = (n) => n.y1px;
exports.ringSectorOuterRadius = ringSectorOuterRadius;
const ringSectorMiddleRadius = (n) => n.yMidPx;
exports.ringSectorMiddleRadius = ringSectorMiddleRadius;
function sectorFillOrigins(fillOutside) {
    return (node) => {
        const midAngle = (node.x0 + node.x1) / 2;
        const divider = 10;
        const innerBias = fillOutside ? 9 : 1;
        const outerBias = divider - innerBias;
        const radius = (innerBias * (0, exports.ringSectorInnerRadius)(node) + outerBias * (0, exports.ringSectorOuterRadius)(node)) / divider;
        const cx = Math.cos((0, geometry_1.trueBearingToStandardPositionAngle)(midAngle)) * radius;
        const cy = Math.sin((0, geometry_1.trueBearingToStandardPositionAngle)(midAngle)) * radius;
        return [cx, cy];
    };
}
const minRectHeightForText = 8;
function makeQuadViewModel(childNodes, layers, sectorLineWidth, sectorLineStroke, smAccessorValue, index, innerIndex, fillLabel, { color: backgroundColor, fallbackColor: fallbackBGColor }) {
    if ((0, color_library_wrappers_1.colorToRgba)(backgroundColor)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires an opaque background color, using fallbackColor', 'an opaque color', backgroundColor);
    }
    return childNodes.map((node) => {
        var _a, _b;
        const layer = layers[node.depth - 1];
        const fill = (_b = (_a = layer === null || layer === void 0 ? void 0 : layer.shape) === null || _a === void 0 ? void 0 : _a.fillColor) !== null && _b !== void 0 ? _b : (0, color_library_wrappers_1.RGBATupleToString)(colors_1.Colors.DarkOpaqueRed.rgba);
        const entry = node[config_1.MODEL_KEY][group_by_rollup_1.CHILDREN_KEY][node[group_by_rollup_1.SORT_INDEX_KEY]];
        const fillColor = !entry
            ? (0, color_library_wrappers_1.RGBATupleToString)(colors_1.Colors.DarkOpaqueRed.rgba)
            : typeof fill === 'function'
                ? fill(node.dataName, node.sortIndex, (0, group_by_rollup_1.entryValue)(entry), node[config_1.MODEL_KEY].children)
                : fill;
        const strokeWidth = sectorLineWidth;
        const strokeStyle = sectorLineStroke;
        const textNegligible = node.y1px - node.y0px < minRectHeightForText;
        const textColor = textNegligible
            ? colors_1.Colors.Transparent.keyword
            : fillLabel.textColor === common_1.ColorVariant.Adaptive
                ? (0, fill_text_color_1.fillTextColor)(fallbackBGColor, fillColor, backgroundColor).color.keyword
                : fillLabel.textColor;
        return { index, innerIndex, smAccessorValue, strokeWidth, strokeStyle, fillColor, textColor, ...node };
    });
}
exports.makeQuadViewModel = makeQuadViewModel;
function makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabelRadiusPadding) {
    return outsideFillNodes
        .map((node, i) => {
        const rowSet = rowSets[i];
        if (!(rowSet === null || rowSet === void 0 ? void 0 : rowSet.rows.reduce((p, row) => p + row.rowWords.length, 0)))
            return { points: [] };
        const radius = (0, exports.ringSectorOuterRadius)(node);
        const midAngle = (0, geometry_1.trueBearingToStandardPositionAngle)((0, geometry_1.meanAngle)(node.x0, node.x1));
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
        .filter(({ points }) => points.length > 1);
}
exports.makeOutsideLinksViewModel = makeOutsideLinksViewModel;
function rectangleConstruction(treeHeight, topGroove) {
    return function rectangleConstructionClosure(node) {
        return node.depth < treeHeight && topGroove !== null
            ? {
                x0: node.x0,
                y0: node.y0px,
                x1: node.x1,
                y1: node.y0px + (0, treemap_1.getTopPadding)(topGroove, node.y1px - node.y0px),
            }
            : {
                x0: node.x0,
                y0: node.y0px,
                x1: node.x1,
                y1: node.y1px,
            };
    };
}
const rawChildNodes = (partitionLayout, tree, topGroove, width, height, clockwiseSectors, specialFirstInnermostSector, maxDepth) => {
    const totalValue = tree.reduce((p, n) => p + (0, group_by_rollup_1.mapEntryValue)(n), 0);
    switch (partitionLayout) {
        case config_types_1.PartitionLayout.sunburst:
            const sunburstValueToAreaScale = constants_1.TAU / totalValue;
            const sunburstAreaAccessor = (e) => sunburstValueToAreaScale * (0, group_by_rollup_1.mapEntryValue)(e);
            return (0, sunburst_1.sunburst)(tree, sunburstAreaAccessor, { x0: 0, y0: -1 }, clockwiseSectors, specialFirstInnermostSector);
        case config_types_1.PartitionLayout.treemap:
        case config_types_1.PartitionLayout.mosaic:
            const treemapInnerArea = width * height;
            const treemapValueToAreaScale = treemapInnerArea / totalValue;
            const treemapAreaAccessor = (e) => treemapValueToAreaScale * (0, group_by_rollup_1.mapEntryValue)(e);
            return (0, treemap_1.treemap)(tree, treemapAreaAccessor, topGrooveAccessor(topGroove), grooveAccessor, {
                x0: 0,
                y0: 0,
                width,
                height,
            }, (0, exports.isMosaic)(partitionLayout) ? [treemap_1.LayerLayout.vertical, treemap_1.LayerLayout.horizontal] : []);
        case config_types_1.PartitionLayout.waffle:
            return (0, waffle_1.waffle)(tree, totalValue, {
                x0: 0,
                y0: 0,
                width,
                height,
            });
        case config_types_1.PartitionLayout.icicle:
        case config_types_1.PartitionLayout.flame:
            const icicleLayout = (0, exports.isIcicle)(partitionLayout);
            const icicleValueToAreaScale = width / totalValue;
            const icicleAreaAccessor = (e) => icicleValueToAreaScale * (0, group_by_rollup_1.mapEntryValue)(e);
            const icicleRowHeight = height / (maxDepth - 1);
            const result = (0, sunburst_1.sunburst)(tree, icicleAreaAccessor, { x0: 0, y0: -icicleRowHeight }, true, false, icicleRowHeight);
            return icicleLayout
                ? result
                : result.map(({ y0, y1, ...rest }) => ({ y0: height - y1, y1: height - y0, ...rest }));
        default:
            return ((layout) => layout !== null && layout !== void 0 ? layout : [])(partitionLayout);
    }
};
function shapeViewModel(textMeasure, spec, style, chartDimensions, rawTextGetter, valueGetter, tree, backgroundStyle, panelModel) {
    const { layout, layers, topGroove, valueFormatter: specifiedValueFormatter, percentFormatter: specifiedPercentFormatter, fillOutside, clockwiseSectors, maxRowCount, specialFirstInnermostSector, animation, } = spec;
    const { emptySizeRatio, outerSizeRatio, linkLabel, minFontSize, sectorLineWidth, sectorLineStroke, fillLabel } = style;
    const { width, height } = chartDimensions;
    const { marginLeftPx, marginTopPx, panel } = panelModel;
    const treemapLayout = (0, exports.isTreemap)(layout);
    const mosaicLayout = (0, exports.isMosaic)(layout);
    const sunburstLayout = (0, exports.isSunburst)(layout);
    const icicleLayout = (0, exports.isIcicle)(layout);
    const flameLayout = (0, exports.isFlame)(layout);
    const simpleLinear = (0, exports.isSimpleLinear)(layout, fillLabel, layers);
    const waffleLayout = (0, exports.isWaffle)(layout);
    const diskCenter = (0, exports.isSunburst)(layout)
        ? {
            x: marginLeftPx + panel.innerWidth / 2,
            y: marginTopPx + panel.innerHeight / 2,
        }
        : {
            x: marginLeftPx,
            y: marginTopPx,
        };
    if (!(width > 0) || !(height > 0) || tree.length === 0) {
        return (0, viewmodel_types_1.nullShapeViewModel)(layout, style, diskCenter);
    }
    const longestPath = (entry) => {
        const [, node] = entry !== null && entry !== void 0 ? entry : [];
        if (!node)
            return NaN;
        const { children, path } = node;
        return children.length > 0 ? children.reduce((p, n) => Math.max(p, longestPath(n)), 0) : path.length;
    };
    const maxDepth = longestPath(tree[0]) - 2;
    const childNodes = rawChildNodes(layout, tree, topGroove, panel.innerWidth, panel.innerHeight, clockwiseSectors, specialFirstInnermostSector, maxDepth);
    const shownChildNodes = childNodes.filter((n) => {
        const layerIndex = (0, group_by_rollup_1.entryValue)(n.node).depth - 1;
        const layer = layers[layerIndex];
        return !layer || !layer.showAccessor || layer.showAccessor((0, group_by_rollup_1.entryKey)(n.node));
    });
    const circleMaximumSize = Math.min(panel.innerWidth, panel.innerHeight - (panel.title.length > 0 ? panel.fontSize * 2 : 0));
    const outerRadius = Math.min(outerSizeRatio * circleMaximumSize, circleMaximumSize - sectorLineWidth) / 2;
    const innerRadius = outerRadius - (1 - emptySizeRatio) * outerRadius;
    const treeHeight = shownChildNodes.reduce((p, n) => Math.max(p, (0, group_by_rollup_1.entryValue)(n.node).depth), 0);
    const ringThickness = (outerRadius - innerRadius) / treeHeight;
    const partToShapeFn = partToShapeTreeNode(!sunburstLayout, innerRadius, ringThickness);
    const quadViewModel = makeQuadViewModel(shownChildNodes.slice(1).map(partToShapeFn), layers, sectorLineWidth, sectorLineStroke, panelModel.smAccessorValue, panelModel.index, panelModel.innerIndex, fillLabel, backgroundStyle);
    const roomCondition = (n) => {
        const diff = n.x1 - n.x0;
        return sunburstLayout
            ? (diff < 0 ? constants_1.TAU + diff : diff) * (0, exports.ringSectorMiddleRadius)(n) > Math.max(minFontSize, linkLabel.maximumSection)
            : n.x1 - n.x0 > minFontSize && n.y1px - n.y0px > minFontSize;
    };
    const nodesWithRoom = quadViewModel.filter(roomCondition);
    const outsideFillNodes = fillOutside && sunburstLayout ? nodesWithRoom : [];
    const textFillOrigins = nodesWithRoom.map(sunburstLayout ? sectorFillOrigins(fillOutside) : rectangleFillOrigins);
    const valueFormatter = valueGetter === config_1.percentValueGetter ? specifiedPercentFormatter : specifiedValueFormatter;
    const getRowSets = sunburstLayout
        ? (0, fill_text_layout_1.fillTextLayout)((0, circline_geometry_1.ringSectorConstruction)(spec, style, innerRadius, ringThickness), fill_text_layout_1.getSectorRowGeometry, (0, fill_text_layout_1.inSectorRotation)(style.horizontalTextEnforcer, style.horizontalTextAngleThreshold))
        : simpleLinear || waffleLayout
            ? () => []
            : (0, fill_text_layout_1.fillTextLayout)(rectangleConstruction(treeHeight, treemapLayout || mosaicLayout ? topGroove : null), fill_text_layout_1.getRectangleRowGeometry, () => 0);
    const rowSets = getRowSets(textMeasure, rawTextGetter, valueGetter, valueFormatter, nodesWithRoom, style, layers, textFillOrigins, maxRowCount, !sunburstLayout, !(treemapLayout || mosaicLayout));
    const outsideLinksViewModel = makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabel.radiusPadding);
    const currentY = [-height, -height, -height, -height];
    const nodesWithoutRoom = fillOutside || treemapLayout || mosaicLayout || icicleLayout || flameLayout || waffleLayout
        ? []
        : quadViewModel.filter((n) => {
            const id = (0, fill_text_layout_1.nodeId)(n);
            const foundInFillText = rowSets.find((r) => r.id === id);
            return !(foundInFillText && foundInFillText.rows.length > 0);
        });
    const maxLinkedLabelTextLength = style.linkLabel.maxTextLength;
    const linkLabelViewModels = (0, link_text_layout_1.linkTextLayout)(panel.innerWidth, panel.innerHeight, textMeasure, style, nodesWithoutRoom, currentY, outerRadius, rawTextGetter, valueGetter, valueFormatter, maxLinkedLabelTextLength, {
        x: width * panelModel.left + panel.innerWidth / 2,
        y: height * panelModel.top + panel.innerHeight / 2,
    }, backgroundStyle);
    const pickQuads = sunburstLayout
        ? (x, y) => {
            return quadViewModel.filter(({ x0, y0px, x1, y1px }) => {
                const angleX = (Math.atan2(y, x) + constants_1.TAU / 4 + constants_1.TAU) % constants_1.TAU;
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
exports.shapeViewModel = shapeViewModel;
function partToShapeTreeNode(treemapLayout, innerRadius, ringThickness) {
    return ({ node, x0, x1, y0, y1 }) => ({
        dataName: (0, group_by_rollup_1.entryKey)(node),
        depth: (0, group_by_rollup_1.depthAccessor)(node),
        value: (0, group_by_rollup_1.aggregateAccessor)(node),
        [config_1.MODEL_KEY]: (0, group_by_rollup_1.parentAccessor)(node),
        sortIndex: (0, group_by_rollup_1.sortIndexAccessor)(node),
        path: (0, group_by_rollup_1.pathAccessor)(node),
        x0,
        x1,
        y0,
        y1,
        y0px: treemapLayout ? y0 : innerRadius + y0 * ringThickness,
        y1px: treemapLayout ? y1 : innerRadius + y1 * ringThickness,
        yMidPx: treemapLayout ? (y0 + y1) / 2 : innerRadius + ((y0 + y1) / 2) * ringThickness,
    });
}
//# sourceMappingURL=viewmodel.js.map