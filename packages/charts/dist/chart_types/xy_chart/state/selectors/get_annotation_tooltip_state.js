"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipStateForDOMElements = exports.getAnnotationTooltipStateSelector = void 0;
const compute_annotations_1 = require("./compute_annotations");
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const compute_series_geometries_1 = require("./compute_series_geometries");
const get_specs_1 = require("./get_specs");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const tooltip_1 = require("../../annotations/tooltip");
const specs_1 = require("../../utils/specs");
const getCurrentPointerPosition = (state) => state.interactions.pointer.current.position;
const getHoveredDOMElement = (state) => state.interactions.hoveredDOMElement;
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
function getAnnotationTooltipState(cursorPosition, { chartDimensions, }, geometries, chartRotation, annotationSpecs, annotationDimensions, tooltip, hoveredDOMElement) {
    const hoveredTooltip = getTooltipStateForDOMElements(chartDimensions, annotationSpecs, annotationDimensions, hoveredDOMElement);
    if (hoveredTooltip) {
        return hoveredTooltip;
    }
    if (cursorPosition.x < 0 || cursorPosition.y < 0) {
        return null;
    }
    const { xScale, yScales } = geometries.scales;
    if (!xScale || !yScales) {
        return null;
    }
    const tooltipState = (0, tooltip_1.computeRectAnnotationTooltipState)(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions);
    const isChartTooltipDisplayed = tooltip.values.some(({ isHighlighted }) => isHighlighted);
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
    const spec = annotationSpecs.find(({ id }) => id === hoveredDOMElement.createdBySpecId);
    if (!spec || spec.hideTooltips) {
        return null;
    }
    const dimension = ((_a = annotationDimensions.get(hoveredDOMElement.createdBySpecId)) !== null && _a !== void 0 ? _a : [])
        .filter(isAnnotationLineProps)
        .find(({ id }) => id === hoveredDOMElement.id);
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
function getTooltipSettings({ placement, fallbackPlacements, boundary, offset, }) {
    return {
        placement,
        fallbackPlacements,
        boundary,
        offset,
    };
}
//# sourceMappingURL=get_annotation_tooltip_state.js.map