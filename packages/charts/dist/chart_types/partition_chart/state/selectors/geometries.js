"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionDrilldownFocus = exports.partitionMultiGeometries = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var scenegraph_1 = require("../../layout/viewmodel/scenegraph");
var get_partition_specs_1 = require("./get_partition_specs");
var tree_1 = require("./tree");
var horizontalSplit = function (s) { return s === null || s === void 0 ? void 0 : s.splitHorizontally; };
var verticalSplit = function (s) { return s === null || s === void 0 ? void 0 : s.splitVertically; };
function bandwidth(range, bandCount, _a) {
    var outer = _a.outer, inner = _a.inner;
    return range / (2 * outer + bandCount + bandCount * inner - inner);
}
exports.partitionMultiGeometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, get_partition_specs_1.getPartitionSpecs, get_chart_container_dimensions_1.getChartContainerDimensionsSelector, tree_1.getTrees, get_chart_theme_1.getChartThemeSelector], function (specs, partitionSpecs, parentDimensions, trees, _a) {
    var background = _a.background, axisPanelTitle = _a.axes.axisPanelTitle, chartMargins = _a.chartMargins, chartPaddings = _a.chartPaddings, partitionStyle = _a.partition;
    var smallMultiplesSpecs = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, specs_1.SpecType.SmallMultiples);
    var width = parentDimensions.width, height = parentDimensions.height;
    var chartWidth = width - chartMargins.left - chartMargins.right;
    var chartHeight = height - chartMargins.top - chartMargins.bottom;
    var outerSpecDirection = ['horizontal', 'vertical', 'zigzag'][0];
    var innerBreakdownDirection = horizontalSplit(smallMultiplesSpecs[0])
        ? 'horizontal'
        : verticalSplit(smallMultiplesSpecs[0])
            ? 'vertical'
            : 'zigzag';
    var outerPanelCount = partitionSpecs.length;
    var zigzagColumnCount = Math.ceil(Math.sqrt(outerPanelCount));
    var zigzagRowCount = Math.ceil(outerPanelCount / zigzagColumnCount);
    var outerWidthRatio = outerSpecDirection === 'horizontal'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
            ? 1 / zigzagColumnCount
            : 1;
    var outerHeightRatio = outerSpecDirection === 'vertical'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
            ? 1 / zigzagRowCount
            : 1;
    var result = partitionSpecs.flatMap(function (spec, index) {
        var innerWidth = chartWidth - chartPaddings.left - chartPaddings.right;
        var innerHeight = chartHeight - chartPaddings.top - chartPaddings.bottom;
        return trees.map(function (_a, innerIndex, a) {
            var _b;
            var name = _a.name, smAccessorValue = _a.smAccessorValue, style = _a.style, t = _a.tree;
            var innerPanelCount = a.length;
            var outerPanelWidth = innerWidth * outerWidthRatio;
            var outerPanelHeight = innerHeight * outerHeightRatio;
            var outerPanelArea = outerPanelWidth * outerPanelHeight;
            var innerPanelTargetArea = outerPanelArea / innerPanelCount;
            var innerPanelTargetHeight = Math.sqrt(innerPanelTargetArea);
            var innerZigzagRowCountEstimate = Math.max(1, Math.floor(outerPanelHeight / innerPanelTargetHeight));
            var innerZigzagColumnCount = Math.ceil(a.length / innerZigzagRowCountEstimate);
            var innerZigzagRowCount = Math.ceil(a.length / innerZigzagColumnCount);
            var innerRowCount = innerBreakdownDirection === 'vertical'
                ? a.length
                : innerBreakdownDirection === 'zigzag'
                    ? innerZigzagRowCount
                    : 1;
            var innerColumnCount = innerBreakdownDirection === 'vertical'
                ? 1
                : innerBreakdownDirection === 'zigzag'
                    ? innerZigzagColumnCount
                    : a.length;
            var innerRowIndex = innerBreakdownDirection === 'vertical'
                ? innerIndex
                : innerBreakdownDirection === 'zigzag'
                    ? Math.floor(innerIndex / innerZigzagColumnCount)
                    : 0;
            var innerColumnIndex = innerBreakdownDirection === 'vertical'
                ? 0
                : innerBreakdownDirection === 'zigzag'
                    ? innerIndex % innerZigzagColumnCount
                    : innerIndex;
            var topOuterRatio = outerSpecDirection === 'vertical'
                ? index / outerPanelCount
                : outerSpecDirection === 'zigzag'
                    ? Math.floor(index / zigzagColumnCount) / zigzagRowCount
                    : 0;
            var topInnerRatio = outerHeightRatio *
                (innerBreakdownDirection === 'vertical'
                    ? innerIndex / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? Math.floor(innerIndex / innerZigzagColumnCount) / innerZigzagRowCount
                        : 0);
            var panelHeightRatio = outerHeightRatio *
                (innerBreakdownDirection === 'vertical'
                    ? 1 / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? 1 / innerZigzagRowCount
                        : 1);
            var leftOuterRatio = outerSpecDirection === 'horizontal'
                ? index / outerPanelCount
                : outerSpecDirection === 'zigzag'
                    ? (index % zigzagColumnCount) / zigzagColumnCount
                    : 0;
            var leftInnerRatio = outerWidthRatio *
                (innerBreakdownDirection === 'horizontal'
                    ? innerIndex / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? (innerIndex % innerZigzagColumnCount) / innerZigzagColumnCount
                        : 0);
            var panelWidthRatio = outerWidthRatio *
                (innerBreakdownDirection === 'horizontal'
                    ? 1 / a.length
                    : innerBreakdownDirection === 'zigzag'
                        ? 1 / innerZigzagColumnCount
                        : 1);
            var panelInnerWidth = bandwidth(innerWidth, innerColumnCount, style.horizontalPanelPadding);
            var panelInnerHeight = bandwidth(innerHeight, innerRowCount, style.verticalPanelPadding);
            var marginLeftPx = chartMargins.left +
                chartPaddings.left +
                panelInnerWidth * style.horizontalPanelPadding.outer +
                innerColumnIndex * (panelInnerWidth * (1 + style.horizontalPanelPadding.inner));
            var marginTopPx = chartMargins.top +
                chartPaddings.top +
                panelInnerHeight * style.verticalPanelPadding.outer +
                innerRowIndex * (panelInnerHeight * (1 + style.verticalPanelPadding.inner));
            var fontFace = {
                fontStyle: (_b = axisPanelTitle.fontStyle) !== null && _b !== void 0 ? _b : 'normal',
                fontFamily: axisPanelTitle.fontFamily,
                fontWeight: 'normal',
                fontVariant: 'normal',
                textColor: axisPanelTitle.fill,
            };
            return (0, scenegraph_1.getShapeViewModel)(spec, parentDimensions, t, background, partitionStyle, {
                index: index,
                innerIndex: innerIndex,
                layout: spec.layout,
                smAccessorValue: smAccessorValue,
                top: topOuterRatio + topInnerRatio,
                height: panelHeightRatio,
                left: leftOuterRatio + leftInnerRatio,
                width: panelWidthRatio,
                innerRowCount: innerRowCount,
                innerColumnCount: innerColumnCount,
                innerRowIndex: innerRowIndex,
                innerColumnIndex: innerColumnIndex,
                marginLeftPx: marginLeftPx,
                marginTopPx: marginTopPx,
                panel: {
                    title: String(name),
                    innerWidth: panelInnerWidth,
                    innerHeight: panelInnerHeight,
                    fontFace: fontFace,
                    fontSize: axisPanelTitle.fontSize,
                },
            });
        });
    });
    return result.length === 0
        ? [(0, viewmodel_types_1.nullShapeViewModel)(undefined, undefined, { x: outerWidthRatio, y: outerHeightRatio })]
        : result;
});
function focusRect(quadViewModel, _a, drilldown) {
    var _b;
    var left = _a.left, width = _a.width;
    return drilldown.length === 0
        ? { x0: left, x1: left + width }
        : (_b = quadViewModel.find(function (_a) {
            var path = _a.path;
            return path.length === drilldown.length && path.every(function (_a, i) {
                var value = _a.value;
                return value === drilldown[i];
            });
        })) !== null && _b !== void 0 ? _b : { x0: left, x1: left + width };
}
exports.partitionDrilldownFocus = (0, create_selector_1.createCustomCachedSelector)([
    exports.partitionMultiGeometries,
    get_chart_container_dimensions_1.getChartContainerDimensionsSelector,
    function (state) { return state.interactions.drilldown; },
    function (state) { return state.interactions.prevDrilldown; },
], function (multiGeometries, chartDimensions, drilldown, prevDrilldown) {
    return multiGeometries.map(function (_a) {
        var quadViewModel = _a.quadViewModel, smAccessorValue = _a.smAccessorValue, index = _a.index, innerIndex = _a.innerIndex;
        var _b = focusRect(quadViewModel, chartDimensions, drilldown), currentFocusX0 = _b.x0, currentFocusX1 = _b.x1;
        var _c = focusRect(quadViewModel, chartDimensions, prevDrilldown), prevFocusX0 = _c.x0, prevFocusX1 = _c.x1;
        return { currentFocusX0: currentFocusX0, currentFocusX1: currentFocusX1, prevFocusX0: prevFocusX0, prevFocusX1: prevFocusX1, smAccessorValue: smAccessorValue, index: index, innerIndex: innerIndex };
    });
});
//# sourceMappingURL=geometries.js.map