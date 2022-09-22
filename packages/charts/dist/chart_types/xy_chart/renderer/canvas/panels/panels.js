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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPanelSubstrates = exports.renderGridPanels = void 0;
var colors_1 = require("../../../../../common/colors");
var canvas_1 = require("../../../../../renderers/canvas");
var common_1 = require("../../../../../utils/common");
var spec_1 = require("../../../state/utils/spec");
var axes_1 = require("../axes");
var rect_1 = require("../primitives/rect");
var debug_1 = require("../utils/debug");
var title_1 = require("./title");
function renderGridPanels(ctx, _a, panels) {
    var chartX = _a.x, chartY = _a.y;
    panels.forEach(function (_a) {
        var width = _a.width, height = _a.height, _b = _a.panelAnchor, panelX = _b.x, panelY = _b.y;
        return (0, canvas_1.withContext)(ctx, function () {
            return (0, rect_1.renderRect)(ctx, { x: chartX + panelX, y: chartY + panelY, width: width, height: height }, { color: colors_1.Colors.Transparent.rgba }, { color: colors_1.Colors.Black.rgba, width: 1 });
        });
    });
}
exports.renderGridPanels = renderGridPanels;
function renderPanel(ctx, props) {
    var size = props.size, anchorPoint = props.anchorPoint, debug = props.debug, axisStyle = props.axisStyle, axisSpec = props.axisSpec, panelAnchor = props.panelAnchor, secondary = props.secondary;
    var position = axisSpec.position;
    var x = anchorPoint.x + (position === common_1.Position.Right ? -1 : 1) * panelAnchor.x;
    var y = anchorPoint.y + (position === common_1.Position.Bottom ? -1 : 1) * panelAnchor.y;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.translate(x, y);
        if (debug && !secondary)
            (0, debug_1.renderDebugRect)(ctx, __assign({ x: 0, y: 0 }, size));
        (0, axes_1.renderAxis)(ctx, props);
        if (!secondary) {
            var panelTitle = props.panelTitle, dimension = props.dimension;
            (0, title_1.renderTitle)(ctx, true, { panelTitle: panelTitle, axisSpec: axisSpec, axisStyle: axisStyle, size: size, dimension: dimension, debug: debug, anchorPoint: { x: 0, y: 0 } });
        }
    });
}
function renderPanelSubstrates(ctx, props) {
    var axesSpecs = props.axesSpecs, perPanelAxisGeoms = props.perPanelAxisGeoms, axesStyles = props.axesStyles, sharedAxesStyle = props.sharedAxesStyle, debug = props.debug, renderingArea = props.renderingArea;
    var seenAxesTitleIds = new Set();
    perPanelAxisGeoms.forEach(function (_a) {
        var axesGeoms = _a.axesGeoms, panelAnchor = _a.panelAnchor;
        axesGeoms.forEach(function (geometry) {
            var _a;
            var _b = geometry.axis, panelTitle = _b.panelTitle, id = _b.id, position = _b.position, secondary = _b.secondary, anchorPoint = geometry.anchorPoint, size = geometry.size, dimension = geometry.dimension, ticks = geometry.visibleTicks, parentSize = geometry.parentSize;
            var axisSpec = (0, spec_1.getSpecsById)(axesSpecs, id);
            if (!axisSpec || !dimension || !position || axisSpec.hide) {
                return;
            }
            var axisStyle = (_a = axesStyles.get(axisSpec.id)) !== null && _a !== void 0 ? _a : sharedAxesStyle;
            if (!seenAxesTitleIds.has(id)) {
                seenAxesTitleIds.add(id);
                (0, title_1.renderTitle)(ctx, false, { size: parentSize, debug: debug, panelTitle: panelTitle, anchorPoint: anchorPoint, dimension: dimension, axisStyle: axisStyle, axisSpec: axisSpec });
            }
            var layerGirth = dimension.maxLabelBboxHeight;
            renderPanel(ctx, {
                panelTitle: panelTitle,
                secondary: secondary,
                panelAnchor: panelAnchor,
                axisSpec: axisSpec,
                anchorPoint: anchorPoint,
                size: size,
                dimension: dimension,
                ticks: ticks,
                axisStyle: axisStyle,
                debug: debug,
                renderingArea: renderingArea,
                layerGirth: layerGirth,
            });
        });
    });
}
exports.renderPanelSubstrates = renderPanelSubstrates;
//# sourceMappingURL=panels.js.map