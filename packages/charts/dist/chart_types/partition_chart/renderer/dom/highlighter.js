"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightSetMapper = exports.DEFAULT_PROPS = exports.HighlighterComponent = void 0;
const react_1 = __importDefault(require("react"));
const colors_1 = require("../../../../common/colors");
const constants_1 = require("../../../../common/constants");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
const EPSILON = 1e-6;
function getSectorShapeFromCanvasArc(x, y, r, a0, a1, ccw) {
    const cw = ccw ? 0 : 1;
    const diff = a1 - a0;
    const direction = ccw ? -1 : 1;
    return `A${r},${r},0,${+(direction * diff >= Math.PI)},${cw},${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`;
}
function renderRectangles(geometry, key, style, { currentFocusX0, currentFocusX1 }, width) {
    const { x0, x1, y0px, y1px } = geometry;
    const props = style.color ? { fill: style.color } : { className: style.fillClassName };
    const scale = width / (currentFocusX1 - currentFocusX0);
    const fx0 = Math.max((x0 - currentFocusX0) * scale, 0);
    const fx1 = Math.min((x1 - currentFocusX0) * scale, width);
    return react_1.default.createElement("rect", { key: key, x: fx0, y: y0px, width: Math.abs(fx1 - fx0), height: Math.abs(y1px - y0px), ...props });
}
function renderSector(geometry, key, { color, fillClassName, strokeClassName }) {
    const { x0, x1, y0px, y1px } = geometry;
    if ((Math.abs(x0 - x1) + constants_1.TAU) % constants_1.TAU < EPSILON) {
        const props = y0px === 0
            ? {
                key,
                r: y1px,
                stroke: 'none',
                ...(color ? { fill: color } : { className: fillClassName }),
            }
            : {
                key,
                r: (y0px + y1px) / 2,
                strokeWidth: y1px - y0px,
                fill: 'none',
                ...(color ? { stroke: color } : { className: strokeClassName }),
            };
        return react_1.default.createElement("circle", { ...props });
    }
    const X0 = x0 - constants_1.TAU / 4;
    const X1 = x1 - constants_1.TAU / 4;
    const path = [
        `M${y0px * Math.cos(X0)},${y0px * Math.sin(X0)}`,
        getSectorShapeFromCanvasArc(0, 0, y0px, X0, X1, false),
        `L${y1px * Math.cos(X1)},${y1px * Math.sin(X1)}`,
        getSectorShapeFromCanvasArc(0, 0, y1px, X1, X0, true),
        'Z',
    ].join(' ');
    const props = color ? { fill: color } : { className: fillClassName };
    return react_1.default.createElement("path", { key: key, d: path, ...props });
}
function renderGeometries(geoms, partitionLayout, style, foci, width) {
    const maxDepth = geoms.reduce((acc, geom) => Math.max(acc, geom.depth), 0);
    const highlightedGeoms = (0, viewmodel_1.isTreemap)(partitionLayout) || (0, viewmodel_1.isMosaic)(partitionLayout) ? geoms.filter((g) => g.depth >= maxDepth) : geoms;
    const renderGeom = (0, viewmodel_1.isSunburst)(partitionLayout) ? renderSector : renderRectangles;
    return highlightedGeoms.map((geometry, index) => {
        var _a;
        return renderGeom(geometry, `${index}`, style, (_a = foci[0]) !== null && _a !== void 0 ? _a : {
            currentFocusX0: NaN,
            currentFocusX1: NaN,
            prevFocusX0: NaN,
            prevFocusX1: NaN,
        }, width);
    });
}
class HighlighterComponent extends react_1.default.Component {
    renderAsMask() {
        const { chartId, canvasDimension: { width }, highlightSets, } = this.props;
        const maskId = (ind, ind2) => `echHighlighterMask__${chartId}__${ind}__${ind2}`;
        const someGeometriesHighlighted = highlightSets.some(({ geometries }) => geometries.length > 0);
        const renderedHighlightSet = someGeometriesHighlighted ? highlightSets : [];
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("defs", null, renderedHighlightSet
                .filter(({ geometries }) => geometries.length > 0)
                .map(({ geometries, geometriesFoci, diskCenter, index, innerIndex, layout, marginLeftPx, marginTopPx, panel: { innerWidth, innerHeight }, }) => (react_1.default.createElement("mask", { key: maskId(index, innerIndex), id: maskId(index, innerIndex) },
                react_1.default.createElement("rect", { x: marginLeftPx, y: marginTopPx, width: innerWidth, height: innerHeight, fill: "white" }),
                react_1.default.createElement("g", { transform: `translate(${diskCenter.x}, ${diskCenter.y})` }, renderGeometries(geometries, layout, { color: colors_1.Colors.Black.keyword }, geometriesFoci, width)))))),
            renderedHighlightSet.map(({ diskCenter, outerRadius, index, innerIndex, layout, marginLeftPx, marginTopPx, panel: { innerWidth, innerHeight }, }) => (0, viewmodel_1.isSunburst)(layout) ? (react_1.default.createElement("circle", { key: `${index}__${innerIndex}`, cx: diskCenter.x, cy: diskCenter.y, r: outerRadius, mask: `url(#${maskId(index, innerIndex)})`, className: "echHighlighter__mask" })) : (react_1.default.createElement("rect", { key: `${index}__${innerIndex}`, x: marginLeftPx, y: marginTopPx, width: innerWidth, height: innerHeight, mask: `url(#${maskId(index, innerIndex)})`, className: "echHighlighter__mask" })))));
    }
    renderAsOverlay() {
        const { canvasDimension: { width }, } = this.props;
        return this.props.highlightSets
            .filter(({ geometries }) => geometries.length > 0)
            .map(({ index, innerIndex, layout, geometries, diskCenter, geometriesFoci }) => (react_1.default.createElement("g", { key: `${index}|${innerIndex}`, transform: `translate(${diskCenter.x}, ${diskCenter.y})` }, renderGeometries(geometries, layout, {
            fillClassName: 'echHighlighterOverlay__fill',
            strokeClassName: 'echHighlighterOverlay__stroke',
        }, geometriesFoci, width))));
    }
    render() {
        return (react_1.default.createElement("svg", { className: "echHighlighter", width: "100%", height: "100%" }, this.props.renderAsOverlay ? this.renderAsOverlay() : this.renderAsMask()));
    }
}
exports.HighlighterComponent = HighlighterComponent;
HighlighterComponent.displayName = 'Highlighter';
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
        {
            ...(0, viewmodel_types_1.nullPartitionSmallMultiplesModel)(),
            geometries: [],
            geometriesFoci: [],
            diskCenter: {
                x: 0,
                y: 0,
            },
            outerRadius: 10,
        },
    ],
};
function highlightSetMapper(geometries, foci) {
    return (vm) => {
        const { index, innerIndex } = vm;
        return {
            ...vm,
            geometries: geometries.filter(({ index: i, innerIndex: ii }) => index === i && innerIndex === ii),
            geometriesFoci: foci.filter(({ index: i, innerIndex: ii }) => index === i && innerIndex === ii),
        };
    };
}
exports.highlightSetMapper = highlightSetMapper;
//# sourceMappingURL=highlighter.js.map