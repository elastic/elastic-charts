"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeViewModel = exports.makeOutsideLinksViewModel = exports.makeQuadViewModel = exports.ringSectorMiddleRadius = exports.ringSectorOuterRadius = exports.ringSectorInnerRadius = exports.isSimpleLinear = exports.isLinear = exports.isWaffle = exports.isFlame = exports.isIcicle = exports.isSunburst = exports.isTreemap = exports.isMosaic = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var colors_1 = require("../../../../common/colors");
var constants_1 = require("../../../../common/constants");
var fill_text_color_1 = require("../../../../common/fill_text_color");
var geometry_1 = require("../../../../common/geometry");
var common_1 = require("../../../../utils/common");
var logger_1 = require("../../../../utils/logger");
var config_1 = require("../config");
var config_types_1 = require("../types/config_types");
var viewmodel_types_1 = require("../types/viewmodel_types");
var circline_geometry_1 = require("../utils/circline_geometry");
var group_by_rollup_1 = require("../utils/group_by_rollup");
var sunburst_1 = require("../utils/sunburst");
var treemap_1 = require("../utils/treemap");
var waffle_1 = require("../utils/waffle");
var fill_text_layout_1 = require("./fill_text_layout");
var link_text_layout_1 = require("./link_text_layout");
var isMosaic = function (p) { return p === config_types_1.PartitionLayout.mosaic; };
exports.isMosaic = isMosaic;
var isTreemap = function (p) { return p === config_types_1.PartitionLayout.treemap; };
exports.isTreemap = isTreemap;
var isSunburst = function (p) { return p === config_types_1.PartitionLayout.sunburst; };
exports.isSunburst = isSunburst;
var isIcicle = function (p) { return p === config_types_1.PartitionLayout.icicle; };
exports.isIcicle = isIcicle;
var isFlame = function (p) { return p === config_types_1.PartitionLayout.flame; };
exports.isFlame = isFlame;
var isWaffle = function (p) { return p === config_types_1.PartitionLayout.waffle; };
exports.isWaffle = isWaffle;
var isLinear = function (p) { return (0, exports.isFlame)(p) || (0, exports.isIcicle)(p); };
exports.isLinear = isLinear;
var isSimpleLinear = function (layout, fillLabel, layers) {
    return (0, exports.isLinear)(layout) && layers.every(function (l) { var _a, _b; return (_b = (_a = l.fillLabel) === null || _a === void 0 ? void 0 : _a.clipText) !== null && _b !== void 0 ? _b : fillLabel === null || fillLabel === void 0 ? void 0 : fillLabel.clipText; });
};
exports.isSimpleLinear = isSimpleLinear;
function grooveAccessor(n) {
    return (0, group_by_rollup_1.entryValue)(n).depth > 1 ? 1 : [0, 2][(0, group_by_rollup_1.entryValue)(n).depth];
}
function topGrooveAccessor(topGroovePx) {
    return function (n) { return ((0, group_by_rollup_1.entryValue)(n).depth > 0 ? topGroovePx : grooveAccessor(n)); };
}
function rectangleFillOrigins(n) {
    return [(n.x0 + n.x1) / 2, (n.y0 + n.y1) / 2];
}
var ringSectorInnerRadius = function (n) { return n.y0px; };
exports.ringSectorInnerRadius = ringSectorInnerRadius;
var ringSectorOuterRadius = function (n) { return n.y1px; };
exports.ringSectorOuterRadius = ringSectorOuterRadius;
var ringSectorMiddleRadius = function (n) { return n.yMidPx; };
exports.ringSectorMiddleRadius = ringSectorMiddleRadius;
function sectorFillOrigins(fillOutside) {
    return function (node) {
        var midAngle = (node.x0 + node.x1) / 2;
        var divider = 10;
        var innerBias = fillOutside ? 9 : 1;
        var outerBias = divider - innerBias;
        var radius = (innerBias * (0, exports.ringSectorInnerRadius)(node) + outerBias * (0, exports.ringSectorOuterRadius)(node)) / divider;
        var cx = Math.cos((0, geometry_1.trueBearingToStandardPositionAngle)(midAngle)) * radius;
        var cy = Math.sin((0, geometry_1.trueBearingToStandardPositionAngle)(midAngle)) * radius;
        return [cx, cy];
    };
}
var minRectHeightForText = 8;
function makeQuadViewModel(childNodes, layers, sectorLineWidth, sectorLineStroke, smAccessorValue, index, innerIndex, fillLabel, _a) {
    var backgroundColor = _a.color, fallbackBGColor = _a.fallbackColor;
    if ((0, color_library_wrappers_1.colorToRgba)(backgroundColor)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires an opaque background color, using fallbackColor', 'an opaque color', backgroundColor);
    }
    return childNodes.map(function (node) {
        var _a, _b;
        var layer = layers[node.depth - 1];
        var fill = (_b = (_a = layer === null || layer === void 0 ? void 0 : layer.shape) === null || _a === void 0 ? void 0 : _a.fillColor) !== null && _b !== void 0 ? _b : 'rgba(128, 0, 0, 0.5)';
        var fillColor = typeof fill === 'function' ? fill(node, node.sortIndex, node[config_1.MODEL_KEY].children) : fill;
        var strokeWidth = sectorLineWidth;
        var strokeStyle = sectorLineStroke;
        var textNegligible = node.y1px - node.y0px < minRectHeightForText;
        var textColor = textNegligible
            ? colors_1.Colors.Transparent.keyword
            : fillLabel.textColor === common_1.ColorVariant.Adaptive
                ? (0, fill_text_color_1.fillTextColor)(fallbackBGColor, fillColor, backgroundColor)
                : fillLabel.textColor;
        return __assign({ index: index, innerIndex: innerIndex, smAccessorValue: smAccessorValue, strokeWidth: strokeWidth, strokeStyle: strokeStyle, fillColor: fillColor, textColor: textColor }, node);
    });
}
exports.makeQuadViewModel = makeQuadViewModel;
function makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabelRadiusPadding) {
    return outsideFillNodes
        .map(function (node, i) {
        var rowSet = rowSets[i];
        if (!rowSet.rows.reduce(function (p, row) { return p + row.rowWords.length; }, 0))
            return { points: [] };
        var radius = (0, exports.ringSectorOuterRadius)(node);
        var midAngle = (0, geometry_1.trueBearingToStandardPositionAngle)((0, geometry_1.meanAngle)(node.x0, node.x1));
        var cos = Math.cos(midAngle);
        var sin = Math.sin(midAngle);
        var x0 = cos * radius;
        var y0 = sin * radius;
        var x = cos * (radius + linkLabelRadiusPadding);
        var y = sin * (radius + linkLabelRadiusPadding);
        return {
            points: [
                [x0, y0],
                [x, y],
            ],
        };
    })
        .filter(function (_a) {
        var points = _a.points;
        return points.length > 1;
    });
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
var rawChildNodes = function (partitionLayout, tree, topGroove, width, height, clockwiseSectors, specialFirstInnermostSector, maxDepth) {
    var totalValue = tree.reduce(function (p, n) { return p + (0, group_by_rollup_1.mapEntryValue)(n); }, 0);
    switch (partitionLayout) {
        case config_types_1.PartitionLayout.sunburst:
            var sunburstValueToAreaScale_1 = constants_1.TAU / totalValue;
            var sunburstAreaAccessor = function (e) { return sunburstValueToAreaScale_1 * (0, group_by_rollup_1.mapEntryValue)(e); };
            return (0, sunburst_1.sunburst)(tree, sunburstAreaAccessor, { x0: 0, y0: -1 }, clockwiseSectors, specialFirstInnermostSector);
        case config_types_1.PartitionLayout.treemap:
        case config_types_1.PartitionLayout.mosaic:
            var treemapInnerArea = width * height;
            var treemapValueToAreaScale_1 = treemapInnerArea / totalValue;
            var treemapAreaAccessor = function (e) { return treemapValueToAreaScale_1 * (0, group_by_rollup_1.mapEntryValue)(e); };
            return (0, treemap_1.treemap)(tree, treemapAreaAccessor, topGrooveAccessor(topGroove), grooveAccessor, {
                x0: 0,
                y0: 0,
                width: width,
                height: height,
            }, (0, exports.isMosaic)(partitionLayout) ? [treemap_1.LayerLayout.vertical, treemap_1.LayerLayout.horizontal] : []);
        case config_types_1.PartitionLayout.waffle:
            return (0, waffle_1.waffle)(tree, totalValue, {
                x0: 0,
                y0: 0,
                width: width,
                height: height,
            });
        case config_types_1.PartitionLayout.icicle:
        case config_types_1.PartitionLayout.flame:
            var icicleLayout = (0, exports.isIcicle)(partitionLayout);
            var icicleValueToAreaScale_1 = width / totalValue;
            var icicleAreaAccessor = function (e) { return icicleValueToAreaScale_1 * (0, group_by_rollup_1.mapEntryValue)(e); };
            var icicleRowHeight = height / (maxDepth - 1);
            var result = (0, sunburst_1.sunburst)(tree, icicleAreaAccessor, { x0: 0, y0: -icicleRowHeight }, true, false, icicleRowHeight);
            return icicleLayout
                ? result
                : result.map(function (_a) {
                    var y0 = _a.y0, y1 = _a.y1, rest = __rest(_a, ["y0", "y1"]);
                    return (__assign({ y0: height - y1, y1: height - y0 }, rest));
                });
        default:
            return (function (layout) { return layout !== null && layout !== void 0 ? layout : []; })(partitionLayout);
    }
};
function shapeViewModel(textMeasure, spec, style, chartDimensions, rawTextGetter, valueGetter, tree, backgroundStyle, panelModel) {
    var layout = spec.layout, layers = spec.layers, topGroove = spec.topGroove, specifiedValueFormatter = spec.valueFormatter, specifiedPercentFormatter = spec.percentFormatter, fillOutside = spec.fillOutside, clockwiseSectors = spec.clockwiseSectors, maxRowCount = spec.maxRowCount, specialFirstInnermostSector = spec.specialFirstInnermostSector, animation = spec.animation;
    var emptySizeRatio = style.emptySizeRatio, outerSizeRatio = style.outerSizeRatio, linkLabel = style.linkLabel, minFontSize = style.minFontSize, sectorLineWidth = style.sectorLineWidth, sectorLineStroke = style.sectorLineStroke, fillLabel = style.fillLabel;
    var width = chartDimensions.width, height = chartDimensions.height;
    var marginLeftPx = panelModel.marginLeftPx, marginTopPx = panelModel.marginTopPx, panel = panelModel.panel;
    var treemapLayout = (0, exports.isTreemap)(layout);
    var mosaicLayout = (0, exports.isMosaic)(layout);
    var sunburstLayout = (0, exports.isSunburst)(layout);
    var icicleLayout = (0, exports.isIcicle)(layout);
    var flameLayout = (0, exports.isFlame)(layout);
    var simpleLinear = (0, exports.isSimpleLinear)(layout, fillLabel, layers);
    var waffleLayout = (0, exports.isWaffle)(layout);
    var diskCenter = (0, exports.isSunburst)(layout)
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
    var longestPath = function (_a) {
        var _b = __read(_a, 2), _c = _b[1], children = _c.children, path = _c.path;
        return children.length > 0 ? children.reduce(function (p, n) { return Math.max(p, longestPath(n)); }, 0) : path.length;
    };
    var maxDepth = longestPath(tree[0]) - 2;
    var childNodes = rawChildNodes(layout, tree, topGroove, panel.innerWidth, panel.innerHeight, clockwiseSectors, specialFirstInnermostSector, maxDepth);
    var shownChildNodes = childNodes.filter(function (n) {
        var layerIndex = (0, group_by_rollup_1.entryValue)(n.node).depth - 1;
        var layer = layers[layerIndex];
        return !layer || !layer.showAccessor || layer.showAccessor((0, group_by_rollup_1.entryKey)(n.node));
    });
    var circleMaximumSize = Math.min(panel.innerWidth, panel.innerHeight - (panel.title.length > 0 ? panel.fontSize * 2 : 0));
    var outerRadius = Math.min(outerSizeRatio * circleMaximumSize, circleMaximumSize - sectorLineWidth) / 2;
    var innerRadius = outerRadius - (1 - emptySizeRatio) * outerRadius;
    var treeHeight = shownChildNodes.reduce(function (p, n) { return Math.max(p, (0, group_by_rollup_1.entryValue)(n.node).depth); }, 0);
    var ringThickness = (outerRadius - innerRadius) / treeHeight;
    var partToShapeFn = partToShapeTreeNode(!sunburstLayout, innerRadius, ringThickness);
    var quadViewModel = makeQuadViewModel(shownChildNodes.slice(1).map(partToShapeFn), layers, sectorLineWidth, sectorLineStroke, panelModel.smAccessorValue, panelModel.index, panelModel.innerIndex, fillLabel, backgroundStyle);
    var roomCondition = function (n) {
        var diff = n.x1 - n.x0;
        return sunburstLayout
            ? (diff < 0 ? constants_1.TAU + diff : diff) * (0, exports.ringSectorMiddleRadius)(n) > Math.max(minFontSize, linkLabel.maximumSection)
            : n.x1 - n.x0 > minFontSize && n.y1px - n.y0px > minFontSize;
    };
    var nodesWithRoom = quadViewModel.filter(roomCondition);
    var outsideFillNodes = fillOutside && sunburstLayout ? nodesWithRoom : [];
    var textFillOrigins = nodesWithRoom.map(sunburstLayout ? sectorFillOrigins(fillOutside) : rectangleFillOrigins);
    var valueFormatter = valueGetter === config_1.percentValueGetter ? specifiedPercentFormatter : specifiedValueFormatter;
    var getRowSets = sunburstLayout
        ? (0, fill_text_layout_1.fillTextLayout)((0, circline_geometry_1.ringSectorConstruction)(spec, style, innerRadius, ringThickness), fill_text_layout_1.getSectorRowGeometry, (0, fill_text_layout_1.inSectorRotation)(style.horizontalTextEnforcer, style.horizontalTextAngleThreshold))
        : simpleLinear || waffleLayout
            ? function () { return []; }
            : (0, fill_text_layout_1.fillTextLayout)(rectangleConstruction(treeHeight, treemapLayout || mosaicLayout ? topGroove : null), fill_text_layout_1.getRectangleRowGeometry, function () { return 0; });
    var rowSets = getRowSets(textMeasure, rawTextGetter, valueGetter, valueFormatter, nodesWithRoom, style, layers, textFillOrigins, maxRowCount, !sunburstLayout, !(treemapLayout || mosaicLayout));
    var outsideLinksViewModel = makeOutsideLinksViewModel(outsideFillNodes, rowSets, linkLabel.radiusPadding);
    var currentY = [-height, -height, -height, -height];
    var nodesWithoutRoom = fillOutside || treemapLayout || mosaicLayout || icicleLayout || flameLayout || waffleLayout
        ? []
        : quadViewModel.filter(function (n) {
            var id = (0, fill_text_layout_1.nodeId)(n);
            var foundInFillText = rowSets.find(function (r) { return r.id === id; });
            return !(foundInFillText && foundInFillText.rows.length > 0);
        });
    var maxLinkedLabelTextLength = style.linkLabel.maxTextLength;
    var linkLabelViewModels = (0, link_text_layout_1.linkTextLayout)(panel.innerWidth, panel.innerHeight, textMeasure, style, nodesWithoutRoom, currentY, outerRadius, rawTextGetter, valueGetter, valueFormatter, maxLinkedLabelTextLength, {
        x: width * panelModel.left + panel.innerWidth / 2,
        y: height * panelModel.top + panel.innerHeight / 2,
    }, backgroundStyle);
    var pickQuads = sunburstLayout
        ? function (x, y) {
            return quadViewModel.filter(function (_a) {
                var x0 = _a.x0, y0px = _a.y0px, x1 = _a.x1, y1px = _a.y1px;
                var angleX = (Math.atan2(y, x) + constants_1.TAU / 4 + constants_1.TAU) % constants_1.TAU;
                var yPx = Math.sqrt(x * x + y * y);
                return x0 <= angleX && angleX <= x1 && y0px <= yPx && yPx <= y1px;
            });
        }
        : function (x, y, _a) {
            var currentFocusX0 = _a.currentFocusX0, currentFocusX1 = _a.currentFocusX1;
            return quadViewModel.filter(function (_a) {
                var x0 = _a.x0, y0px = _a.y0px, x1 = _a.x1, y1px = _a.y1px;
                var scale = width / (currentFocusX1 - currentFocusX0);
                var fx0 = Math.max((x0 - currentFocusX0) * scale, 0);
                var fx1 = Math.min((x1 - currentFocusX0) * scale, width);
                return fx0 <= x && x < fx1 && y0px < y && y <= y1px;
            });
        };
    return {
        layout: layout,
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
        panel: __assign({}, panelModel.panel),
        style: style,
        layers: layers,
        diskCenter: diskCenter,
        quadViewModel: quadViewModel,
        rowSets: rowSets,
        linkLabelViewModels: linkLabelViewModels,
        outsideLinksViewModel: outsideLinksViewModel,
        pickQuads: pickQuads,
        outerRadius: outerRadius,
        chartDimensions: chartDimensions,
        animation: animation,
    };
}
exports.shapeViewModel = shapeViewModel;
function partToShapeTreeNode(treemapLayout, innerRadius, ringThickness) {
    return function (_a) {
        var _b;
        var node = _a.node, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0, y1 = _a.y1;
        return (_b = {
                dataName: (0, group_by_rollup_1.entryKey)(node),
                depth: (0, group_by_rollup_1.depthAccessor)(node),
                value: (0, group_by_rollup_1.aggregateAccessor)(node)
            },
            _b[config_1.MODEL_KEY] = (0, group_by_rollup_1.parentAccessor)(node),
            _b.sortIndex = (0, group_by_rollup_1.sortIndexAccessor)(node),
            _b.path = (0, group_by_rollup_1.pathAccessor)(node),
            _b.x0 = x0,
            _b.x1 = x1,
            _b.y0 = y0,
            _b.y1 = y1,
            _b.y0px = treemapLayout ? y0 : innerRadius + y0 * ringThickness,
            _b.y1px = treemapLayout ? y1 : innerRadius + y1 * ringThickness,
            _b.yMidPx = treemapLayout ? (y0 + y1) / 2 : innerRadius + ((y0 + y1) / 2) * ringThickness,
            _b);
    };
}
//# sourceMappingURL=viewmodel.js.map