"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionDrilldownFocus = exports.partitionMultiGeometries = void 0;
const get_partition_specs_1 = require("./get_partition_specs");
const tree_1 = require("./tree");
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const scenegraph_1 = require("../../layout/viewmodel/scenegraph");
const horizontalSplit = (s) => s === null || s === void 0 ? void 0 : s.splitHorizontally;
const verticalSplit = (s) => s === null || s === void 0 ? void 0 : s.splitVertically;
function bandwidth(range, bandCount, { outer, inner }) {
    return range / (2 * outer + bandCount + bandCount * inner - inner);
}
exports.partitionMultiGeometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, get_partition_specs_1.getPartitionSpecs, get_chart_container_dimensions_1.getChartContainerDimensionsSelector, tree_1.getTrees, get_chart_theme_1.getChartThemeSelector], (specs, partitionSpecs, parentDimensions, trees, { background, axes: { axisPanelTitle }, chartMargins, chartPaddings, partition: partitionStyle }) => {
    const smallMultiplesSpecs = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, specs_1.SpecType.SmallMultiples);
    const { width, height } = parentDimensions;
    const chartWidth = width - chartMargins.left - chartMargins.right;
    const chartHeight = height - chartMargins.top - chartMargins.bottom;
    const outerSpecDirection = ['horizontal', 'vertical', 'zigzag'][0];
    const innerBreakdownDirection = horizontalSplit(smallMultiplesSpecs[0])
        ? 'horizontal'
        : verticalSplit(smallMultiplesSpecs[0])
            ? 'vertical'
            : 'zigzag';
    const outerPanelCount = partitionSpecs.length;
    const zigzagColumnCount = Math.ceil(Math.sqrt(outerPanelCount));
    const zigzagRowCount = Math.ceil(outerPanelCount / zigzagColumnCount);
    const outerWidthRatio = outerSpecDirection === 'horizontal'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
            ? 1 / zigzagColumnCount
            : 1;
    const outerHeightRatio = outerSpecDirection === 'vertical'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
            ? 1 / zigzagRowCount
            : 1;
    const result = partitionSpecs.flatMap((spec, index) => {
        const innerWidth = chartWidth - chartPaddings.left - chartPaddings.right;
        const innerHeight = chartHeight - chartPaddings.top - chartPaddings.bottom;
        return trees.map(({ name, smAccessorValue, style, tree: t }, innerIndex, a) => {
            var _a;
            const innerPanelCount = a.length;
            const outerPanelWidth = innerWidth * outerWidthRatio;
            const outerPanelHeight = innerHeight * outerHeightRatio;
            const outerPanelArea = outerPanelWidth * outerPanelHeight;
            const innerPanelTargetArea = outerPanelArea / innerPanelCount;
            const innerPanelTargetHeight = Math.sqrt(innerPanelTargetArea);
            const innerZigzagRowCountEstimate = Math.max(1, Math.floor(outerPanelHeight / innerPanelTargetHeight));
            const innerZigzagColumnCount = Math.ceil(a.length / innerZigzagRowCountEstimate);
            const innerZigzagRowCount = Math.ceil(a.length / innerZigzagColumnCount);
            const innerRowCount = innerBreakdownDirection === 'vertical'
                ? a.length
                : innerBreakdownDirection === 'zigzag'
                    ? innerZigzagRowCount
                    : 1;
            const innerColumnCount = innerBreakdownDirection === 'vertical'
                ? 1
                : innerBreakdownDirection === 'zigzag'
                    ? innerZigzagColumnCount
                    : a.length;
            const innerRowIndex = innerBreakdownDirection === 'vertical'
                ? innerIndex
                : innerBreakdownDirection === 'zigzag'
                    ? Math.floor(innerIndex / innerZigzagColumnCount)
                    : 0;
            const innerColumnIndex = innerBreakdownDirection === 'vertical'
                ? 0
                : innerBreakdownDirection === 'zigzag'
                    ? innerIndex % innerZigzagColumnCount
                    : innerIndex;
            const topOuterRatio = outerSpecDirection === 'vertical'
                ? index / outerPanelCount
                : outerSpecDirection === 'zigzag'
                    ? Math.floor(index / zigzagColumnCount) / zigzagRowCount
                    : 0;
            const topInnerRatio = outerHeightRatio *
                (innerBreakdownDirection === 'vertical'
                    ? innerIndex / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? Math.floor(innerIndex / innerZigzagColumnCount) / innerZigzagRowCount
                        : 0);
            const panelHeightRatio = outerHeightRatio *
                (innerBreakdownDirection === 'vertical'
                    ? 1 / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? 1 / innerZigzagRowCount
                        : 1);
            const leftOuterRatio = outerSpecDirection === 'horizontal'
                ? index / outerPanelCount
                : outerSpecDirection === 'zigzag'
                    ? (index % zigzagColumnCount) / zigzagColumnCount
                    : 0;
            const leftInnerRatio = outerWidthRatio *
                (innerBreakdownDirection === 'horizontal'
                    ? innerIndex / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? (innerIndex % innerZigzagColumnCount) / innerZigzagColumnCount
                        : 0);
            const panelWidthRatio = outerWidthRatio *
                (innerBreakdownDirection === 'horizontal'
                    ? 1 / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? 1 / innerZigzagColumnCount
                        : 1);
            const panelInnerWidth = bandwidth(innerWidth, innerColumnCount, style.horizontalPanelPadding);
            const panelInnerHeight = bandwidth(innerHeight, innerRowCount, style.verticalPanelPadding);
            const marginLeftPx = chartMargins.left +
                chartPaddings.left +
                panelInnerWidth * style.horizontalPanelPadding.outer +
                innerColumnIndex * (panelInnerWidth * (1 + style.horizontalPanelPadding.inner));
            const marginTopPx = chartMargins.top +
                chartPaddings.top +
                panelInnerHeight * style.verticalPanelPadding.outer +
                innerRowIndex * (panelInnerHeight * (1 + style.verticalPanelPadding.inner));
            const fontFace = {
                fontStyle: (_a = axisPanelTitle.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
                fontFamily: axisPanelTitle.fontFamily,
                fontWeight: 'normal',
                fontVariant: 'normal',
                textColor: axisPanelTitle.fill,
            };
            return (0, scenegraph_1.getShapeViewModel)(spec, parentDimensions, t, background, partitionStyle, {
                index,
                innerIndex,
                layout: spec.layout,
                smAccessorValue,
                top: topOuterRatio + topInnerRatio,
                height: panelHeightRatio,
                left: leftOuterRatio + leftInnerRatio,
                width: panelWidthRatio,
                innerRowCount,
                innerColumnCount,
                innerRowIndex,
                innerColumnIndex,
                marginLeftPx,
                marginTopPx,
                panel: {
                    title: String(name),
                    innerWidth: panelInnerWidth,
                    innerHeight: panelInnerHeight,
                    fontFace,
                    fontSize: axisPanelTitle.fontSize,
                },
            });
        });
    });
    return result.length === 0
        ? [(0, viewmodel_types_1.nullShapeViewModel)(undefined, undefined, { x: outerWidthRatio, y: outerHeightRatio })]
        : result;
});
function focusRect(quadViewModel, { left, width }, drilldown) {
    var _a;
    return drilldown.length === 0
        ? { x0: left, x1: left + width }
        : (_a = quadViewModel.find(({ path }) => path.length === drilldown.length && path.every(({ value }, i) => value === drilldown[i]))) !== null && _a !== void 0 ? _a : { x0: left, x1: left + width };
}
exports.partitionDrilldownFocus = (0, create_selector_1.createCustomCachedSelector)([
    exports.partitionMultiGeometries,
    get_chart_container_dimensions_1.getChartContainerDimensionsSelector,
    (state) => state.interactions.drilldown,
    (state) => state.interactions.prevDrilldown,
], (multiGeometries, chartDimensions, drilldown, prevDrilldown) => multiGeometries.map(({ quadViewModel, smAccessorValue, index, innerIndex }) => {
    const { x0: currentFocusX0, x1: currentFocusX1 } = focusRect(quadViewModel, chartDimensions, drilldown);
    const { x0: prevFocusX0, x1: prevFocusX1 } = focusRect(quadViewModel, chartDimensions, prevDrilldown);
    return { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1, smAccessorValue, index, innerIndex };
}));
//# sourceMappingURL=geometries.js.map