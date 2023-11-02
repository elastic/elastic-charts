"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPanelSubstrates = exports.renderGridPanels = void 0;
const title_1 = require("./title");
const colors_1 = require("../../../../../common/colors");
const canvas_1 = require("../../../../../renderers/canvas");
const common_1 = require("../../../../../utils/common");
const spec_1 = require("../../../state/utils/spec");
const axes_1 = require("../axes");
const rect_1 = require("../primitives/rect");
const debug_1 = require("../utils/debug");
function renderGridPanels(ctx, { x: chartX, y: chartY }, panels) {
    panels.forEach(({ width, height, panelAnchor: { x: panelX, y: panelY } }) => (0, canvas_1.withContext)(ctx, () => (0, rect_1.renderRect)(ctx, { x: chartX + panelX, y: chartY + panelY, width, height }, { color: colors_1.Colors.Transparent.rgba }, { color: colors_1.Colors.Black.rgba, width: 1 })));
}
exports.renderGridPanels = renderGridPanels;
function renderPanel(ctx, props, locale) {
    const { size, anchorPoint, debug, axisStyle, axisSpec, panelAnchor, secondary } = props;
    const { position } = axisSpec;
    const x = anchorPoint.x + (position === common_1.Position.Right ? -1 : 1) * panelAnchor.x;
    const y = anchorPoint.y + (position === common_1.Position.Bottom ? -1 : 1) * panelAnchor.y;
    (0, canvas_1.withContext)(ctx, () => {
        ctx.translate(x, y);
        if (debug && !secondary)
            (0, debug_1.renderDebugRect)(ctx, { x: 0, y: 0, ...size });
        (0, axes_1.renderAxis)(ctx, props);
        if (!secondary) {
            const { panelTitle, dimension } = props;
            (0, title_1.renderTitle)(ctx, true, { panelTitle, axisSpec, axisStyle, size, dimension, debug, anchorPoint: { x: 0, y: 0 } }, locale);
        }
    });
}
function renderPanelSubstrates(ctx, props, locale) {
    const { axesSpecs, perPanelAxisGeoms, axesStyles, sharedAxesStyle, debug, renderingArea } = props;
    const seenAxesTitleIds = new Set();
    perPanelAxisGeoms.forEach(({ axesGeoms, panelAnchor }) => {
        axesGeoms.forEach((geometry) => {
            var _a;
            const { axis: { panelTitle, id, position, secondary }, anchorPoint, size, dimension, visibleTicks: ticks, parentSize, } = geometry;
            const axisSpec = (0, spec_1.getSpecsById)(axesSpecs, id);
            if (!axisSpec || !dimension || !position || axisSpec.hide) {
                return;
            }
            const axisStyle = (_a = axesStyles.get(axisSpec.id)) !== null && _a !== void 0 ? _a : sharedAxesStyle;
            if (!seenAxesTitleIds.has(id)) {
                seenAxesTitleIds.add(id);
                (0, title_1.renderTitle)(ctx, false, { size: parentSize, debug, panelTitle, anchorPoint, dimension, axisStyle, axisSpec }, locale);
            }
            const layerGirth = dimension.maxLabelBboxHeight;
            renderPanel(ctx, {
                panelTitle,
                secondary,
                panelAnchor,
                axisSpec,
                anchorPoint,
                size,
                dimension,
                ticks,
                axisStyle,
                debug,
                renderingArea,
                layerGirth,
            }, locale);
        });
    });
}
exports.renderPanelSubstrates = renderPanelSubstrates;
//# sourceMappingURL=panels.js.map