"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipStateForDOMElements = exports.getAnnotationTooltipStateSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var tooltip_1 = require("../../annotations/tooltip");
var specs_1 = require("../../utils/specs");
var compute_annotations_1 = require("./compute_annotations");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_series_geometries_1 = require("./compute_series_geometries");
var get_specs_1 = require("./get_specs");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var getCurrentPointerPosition = function (state) { return state.interactions.pointer.current.position; };
var getHoveredDOMElement = function (state) { return state.interactions.hoveredDOMElement; };
exports.getAnnotationTooltipStateSelector = (0, create_selector_1.createCustomCachedSelector)([
    getCurrentPointerPosition,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    get_chart_rotation_1.getChartRotationSelector,
    get_specs_1.getAnnotationSpecsSelector,
    compute_annotations_1.computeAnnotationDimensionsSelector,
    get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector,
    getHoveredDOMElement,
], getAnnotationTooltipState);
function getAnnotationTooltipState(cursorPosition, _a, geometries, chartRotation, annotationSpecs, annotationDimensions, tooltip, hoveredDOMElement) {
    var chartDimensions = _a.chartDimensions;
    var hoveredTooltip = getTooltipStateForDOMElements(chartDimensions, annotationSpecs, annotationDimensions, hoveredDOMElement);
    if (hoveredTooltip) {
        return hoveredTooltip;
    }
    if (cursorPosition.x < 0 || cursorPosition.y < 0) {
        return null;
    }
    var _b = geometries.scales, xScale = _b.xScale, yScales = _b.yScales;
    if (!xScale || !yScales) {
        return null;
    }
    var tooltipState = (0, tooltip_1.computeRectAnnotationTooltipState)(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions);
    var isChartTooltipDisplayed = tooltip.values.some(function (_a) {
        var isHighlighted = _a.isHighlighted;
        return isHighlighted;
    });
    if (tooltipState &&
        tooltipState.isVisible &&
        tooltipState.annotationType === specs_1.AnnotationType.Rectangle &&
        isChartTooltipDisplayed) {
        return null;
    }
    return tooltipState;
}
function getTooltipStateForDOMElements(chartDimensions, annotationSpecs, annotationDimensions, hoveredDOMElement) {
    var _a, _b, _c, _d, _e;
    if (!hoveredDOMElement) {
        return null;
    }
    var spec = annotationSpecs.find(function (_a) {
        var id = _a.id;
        return id === hoveredDOMElement.createdBySpecId;
    });
    if (!spec || spec.hideTooltips) {
        return null;
    }
    var dimension = ((_a = annotationDimensions.get(hoveredDOMElement.createdBySpecId)) !== null && _a !== void 0 ? _a : [])
        .filter(isAnnotationLineProps)
        .find(function (_a) {
        var id = _a.id;
        return id === hoveredDOMElement.id;
    });
    if (!dimension) {
        return null;
    }
    return {
        id: dimension.id,
        specId: spec.id,
        isVisible: true,
        annotationType: specs_1.AnnotationType.Line,
        datum: dimension.datum,
        anchor: {
            y: ((_c = (_b = dimension.markers[0]) === null || _b === void 0 ? void 0 : _b.position.top) !== null && _c !== void 0 ? _c : 0) + dimension.panel.top + chartDimensions.top,
            x: ((_e = (_d = dimension.markers[0]) === null || _d === void 0 ? void 0 : _d.position.left) !== null && _e !== void 0 ? _e : 0) + dimension.panel.left + chartDimensions.left,
            width: 0,
            height: 0,
        },
        customTooltipDetails: spec.customTooltipDetails,
        customTooltip: spec.customTooltip,
        tooltipSettings: getTooltipSettings(spec),
    };
}
exports.getTooltipStateForDOMElements = getTooltipStateForDOMElements;
function isAnnotationLineProps(prop) {
    return 'linePathPoints' in prop;
}
function getTooltipSettings(_a) {
    var placement = _a.placement, fallbackPlacements = _a.fallbackPlacements, boundary = _a.boundary, offset = _a.offset;
    return {
        placement: placement,
        fallbackPlacements: fallbackPlacements,
        boundary: boundary,
        offset: offset,
    };
}
//# sourceMappingURL=get_annotation_tooltip_state.js.map