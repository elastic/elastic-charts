"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightSetMapper = exports.DEFAULT_PROPS = exports.HighlighterComponent = void 0;
var react_1 = __importDefault(require("react"));
var colors_1 = require("../../../../common/colors");
var constants_1 = require("../../../../common/constants");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var EPSILON = 1e-6;
function getSectorShapeFromCanvasArc(x, y, r, a0, a1, ccw) {
    var cw = ccw ? 0 : 1;
    var diff = a1 - a0;
    var direction = ccw ? -1 : 1;
    return "A".concat(r, ",").concat(r, ",0,").concat(+(direction * diff >= Math.PI), ",").concat(cw, ",").concat(x + r * Math.cos(a1), ",").concat(y + r * Math.sin(a1));
}
function renderRectangles(geometry, key, style, _a, width) {
    var currentFocusX0 = _a.currentFocusX0, currentFocusX1 = _a.currentFocusX1;
    var x0 = geometry.x0, x1 = geometry.x1, y0px = geometry.y0px, y1px = geometry.y1px;
    var props = style.color ? { fill: style.color } : { className: style.fillClassName };
    var scale = width / (currentFocusX1 - currentFocusX0);
    var fx0 = Math.max((x0 - currentFocusX0) * scale, 0);
    var fx1 = Math.min((x1 - currentFocusX0) * scale, width);
    return react_1.default.createElement("rect", __assign({ key: key, x: fx0, y: y0px, width: Math.abs(fx1 - fx0), height: Math.abs(y1px - y0px) }, props));
}
function renderSector(geometry, key, _a) {
    var color = _a.color, fillClassName = _a.fillClassName, strokeClassName = _a.strokeClassName;
    var x0 = geometry.x0, x1 = geometry.x1, y0px = geometry.y0px, y1px = geometry.y1px;
    if ((Math.abs(x0 - x1) + constants_1.TAU) % constants_1.TAU < EPSILON) {
        var props_1 = y0px === 0
            ? __assign({ key: key, r: y1px, stroke: 'none' }, (color ? { fill: color } : { className: fillClassName })) : __assign({ key: key, r: (y0px + y1px) / 2, strokeWidth: y1px - y0px, fill: 'none' }, (color ? { stroke: color } : { className: strokeClassName }));
        return react_1.default.createElement("circle", __assign({}, props_1));
    }
    var X0 = x0 - constants_1.TAU / 4;
    var X1 = x1 - constants_1.TAU / 4;
    var path = [
        "M".concat(y0px * Math.cos(X0), ",").concat(y0px * Math.sin(X0)),
        getSectorShapeFromCanvasArc(0, 0, y0px, X0, X1, false),
        "L".concat(y1px * Math.cos(X1), ",").concat(y1px * Math.sin(X1)),
        getSectorShapeFromCanvasArc(0, 0, y1px, X1, X0, true),
        'Z',
    ].join(' ');
    var props = color ? { fill: color } : { className: fillClassName };
    return react_1.default.createElement("path", __assign({ key: key, d: path }, props));
}
function renderGeometries(geoms, partitionLayout, style, foci, width) {
    var maxDepth = geoms.reduce(function (acc, geom) { return Math.max(acc, geom.depth); }, 0);
    var highlightedGeoms = (0, viewmodel_1.isTreemap)(partitionLayout) || (0, viewmodel_1.isMosaic)(partitionLayout) ? geoms.filter(function (g) { return g.depth >= maxDepth; }) : geoms;
    var renderGeom = (0, viewmodel_1.isSunburst)(partitionLayout) ? renderSector : renderRectangles;
    return highlightedGeoms.map(function (geometry, index) {
        var _a;
        return renderGeom(geometry, "".concat(index), style, (_a = foci[0]) !== null && _a !== void 0 ? _a : {
            currentFocusX0: NaN,
            currentFocusX1: NaN,
            prevFocusX0: NaN,
            prevFocusX1: NaN,
        }, width);
    });
}
var HighlighterComponent = (function (_super) {
    __extends(HighlighterComponent, _super);
    function HighlighterComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HighlighterComponent.prototype.renderAsMask = function () {
        var _a = this.props, chartId = _a.chartId, width = _a.canvasDimension.width, highlightSets = _a.highlightSets;
        var maskId = function (ind, ind2) { return "echHighlighterMask__".concat(chartId, "__").concat(ind, "__").concat(ind2); };
        var someGeometriesHighlighted = highlightSets.some(function (_a) {
            var geometries = _a.geometries;
            return geometries.length > 0;
        });
        var renderedHighlightSet = someGeometriesHighlighted ? highlightSets : [];
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("defs", null, renderedHighlightSet
                .filter(function (_a) {
                var geometries = _a.geometries;
                return geometries.length > 0;
            })
                .map(function (_a) {
                var geometries = _a.geometries, geometriesFoci = _a.geometriesFoci, diskCenter = _a.diskCenter, index = _a.index, innerIndex = _a.innerIndex, layout = _a.layout, marginLeftPx = _a.marginLeftPx, marginTopPx = _a.marginTopPx, _b = _a.panel, innerWidth = _b.innerWidth, innerHeight = _b.innerHeight;
                return (react_1.default.createElement("mask", { key: maskId(index, innerIndex), id: maskId(index, innerIndex) },
                    react_1.default.createElement("rect", { x: marginLeftPx, y: marginTopPx, width: innerWidth, height: innerHeight, fill: "white" }),
                    react_1.default.createElement("g", { transform: "translate(".concat(diskCenter.x, ", ").concat(diskCenter.y, ")") }, renderGeometries(geometries, layout, { color: colors_1.Colors.Black.keyword }, geometriesFoci, width))));
            })),
            renderedHighlightSet.map(function (_a) {
                var diskCenter = _a.diskCenter, outerRadius = _a.outerRadius, index = _a.index, innerIndex = _a.innerIndex, layout = _a.layout, marginLeftPx = _a.marginLeftPx, marginTopPx = _a.marginTopPx, _b = _a.panel, innerWidth = _b.innerWidth, innerHeight = _b.innerHeight;
                return (0, viewmodel_1.isSunburst)(layout) ? (react_1.default.createElement("circle", { key: "".concat(index, "__").concat(innerIndex), cx: diskCenter.x, cy: diskCenter.y, r: outerRadius, mask: "url(#".concat(maskId(index, innerIndex), ")"), className: "echHighlighter__mask" })) : (react_1.default.createElement("rect", { key: "".concat(index, "__").concat(innerIndex), x: marginLeftPx, y: marginTopPx, width: innerWidth, height: innerHeight, mask: "url(#".concat(maskId(index, innerIndex), ")"), className: "echHighlighter__mask" }));
            })));
    };
    HighlighterComponent.prototype.renderAsOverlay = function () {
        var width = this.props.canvasDimension.width;
        return this.props.highlightSets
            .filter(function (_a) {
            var geometries = _a.geometries;
            return geometries.length > 0;
        })
            .map(function (_a) {
            var index = _a.index, innerIndex = _a.innerIndex, layout = _a.layout, geometries = _a.geometries, diskCenter = _a.diskCenter, geometriesFoci = _a.geometriesFoci;
            return (react_1.default.createElement("g", { key: "".concat(index, "|").concat(innerIndex), transform: "translate(".concat(diskCenter.x, ", ").concat(diskCenter.y, ")") }, renderGeometries(geometries, layout, {
                fillClassName: 'echHighlighterOverlay__fill',
                strokeClassName: 'echHighlighterOverlay__stroke',
            }, geometriesFoci, width)));
        });
    };
    HighlighterComponent.prototype.render = function () {
        return (react_1.default.createElement("svg", { className: "echHighlighter", width: "100%", height: "100%" }, this.props.renderAsOverlay ? this.renderAsOverlay() : this.renderAsMask()));
    };
    HighlighterComponent.displayName = 'Highlighter';
    return HighlighterComponent;
}(react_1.default.Component));
exports.HighlighterComponent = HighlighterComponent;
exports.DEFAULT_PROPS = {
    chartId: 'empty',
    initialized: false,
    renderAsOverlay: false,
    canvasDimension: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    highlightSets: [
        __assign(__assign({}, (0, viewmodel_types_1.nullPartitionSmallMultiplesModel)()), { geometries: [], geometriesFoci: [], diskCenter: {
                x: 0,
                y: 0,
            }, outerRadius: 10 }),
    ],
};
function highlightSetMapper(geometries, foci) {
    return function (vm) {
        var index = vm.index, innerIndex = vm.innerIndex;
        return __assign(__assign({}, vm), { geometries: geometries.filter(function (_a) {
                var i = _a.index, ii = _a.innerIndex;
                return index === i && innerIndex === ii;
            }), geometriesFoci: foci.filter(function (_a) {
                var i = _a.index, ii = _a.innerIndex;
                return index === i && innerIndex === ii;
            }) });
    };
}
exports.highlightSetMapper = highlightSetMapper;
//# sourceMappingURL=highlighter.js.map