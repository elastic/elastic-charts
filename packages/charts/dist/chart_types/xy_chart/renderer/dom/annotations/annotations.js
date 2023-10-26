"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Annotations = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const annotation_tooltip_1 = require("./annotation_tooltip");
const line_marker_1 = require("./line_marker");
const dom_element_1 = require("../../../../../state/actions/dom_element");
const mouse_1 = require("../../../../../state/actions/mouse");
const get_chart_theme_1 = require("../../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../../state/selectors/get_settings_spec");
const light_theme_1 = require("../../../../../utils/themes/light_theme");
const compute_annotations_1 = require("../../../state/selectors/compute_annotations");
const compute_chart_dimensions_1 = require("../../../state/selectors/compute_chart_dimensions");
const get_annotation_tooltip_state_1 = require("../../../state/selectors/get_annotation_tooltip_state");
const get_highlighted_annotation_ids_selector_1 = require("../../../state/selectors/get_highlighted_annotation_ids_selector");
const get_specs_1 = require("../../../state/selectors/get_specs");
const is_chart_empty_1 = require("../../../state/selectors/is_chart_empty");
const spec_1 = require("../../../state/utils/spec");
const specs_1 = require("../../../utils/specs");
const utils_1 = require("../../common/utils");
function renderAnnotationLineMarkers(chartAreaRef, chartDimensions, annotationLines, onDOMElementEnter, onDOMElementLeave, hoveredIds, sharedStyle, clickable, animations) {
    const getHoverParams = (0, utils_1.getAnnotationHoverParamsFn)(hoveredIds, sharedStyle, animations);
    return annotationLines.reduce((acc, { markers, ...props }) => {
        if (!markers[0])
            return acc;
        acc.push(react_1.default.createElement(line_marker_1.LineMarker, { ...props, marker: markers[0], key: `annotation-${props.id}`, chartAreaRef: chartAreaRef, chartDimensions: chartDimensions, onDOMElementEnter: onDOMElementEnter, onDOMElementLeave: onDOMElementLeave, onDOMElementClick: dom_element_1.onDOMElementClick, clickable: clickable, getHoverParams: getHoverParams }));
        return acc;
    }, []);
}
const AnnotationsComponent = ({ tooltipState, isChartEmpty, chartDimensions, annotationSpecs, annotationDimensions, getChartContainerRef, chartAreaRef, chartId, zIndex, onPointerMove, onDOMElementEnter, onDOMElementLeave, clickable, hoveredAnnotationIds, sharedStyle, }) => {
    const renderAnnotationMarkers = (0, react_1.useCallback)(() => {
        const markers = [];
        annotationDimensions.forEach((dimensions, id) => {
            const annotationSpec = (0, spec_1.getSpecsById)(annotationSpecs, id);
            if (!annotationSpec) {
                return;
            }
            if ((0, specs_1.isLineAnnotation)(annotationSpec)) {
                const annotationLines = dimensions;
                const lineMarkers = renderAnnotationLineMarkers(chartAreaRef, chartDimensions, annotationLines, onDOMElementEnter, onDOMElementLeave, hoveredAnnotationIds, sharedStyle, clickable, annotationSpec.animations);
                lineMarkers.forEach((m) => markers.push(m));
            }
        });
        return markers;
    }, [
        annotationDimensions,
        annotationSpecs,
        chartAreaRef,
        chartDimensions,
        onDOMElementEnter,
        onDOMElementLeave,
        hoveredAnnotationIds,
        sharedStyle,
        clickable,
    ]);
    const onScroll = (0, react_1.useCallback)(() => {
        onPointerMove({ x: -1, y: -1 }, Date.now());
    }, []);
    if (isChartEmpty) {
        return null;
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        renderAnnotationMarkers(),
        react_1.default.createElement(annotation_tooltip_1.AnnotationTooltip, { chartId: chartId, zIndex: zIndex, state: tooltipState, chartRef: getChartContainerRef(), onScroll: onScroll })));
};
AnnotationsComponent.displayName = 'Annotations';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onPointerMove: mouse_1.onPointerMove,
    onDOMElementLeave: dom_element_1.onDOMElementLeave,
    onDOMElementEnter: dom_element_1.onDOMElementEnter,
    onDOMElementClick: dom_element_1.onDOMElementClick,
}, dispatch);
const mapStateToProps = (state) => {
    const { zIndex, chartId } = state;
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            isChartEmpty: true,
            chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
            sharedStyle: light_theme_1.LIGHT_THEME.sharedStyle,
            annotationDimensions: new Map(),
            annotationSpecs: [],
            tooltipState: null,
            chartId,
            zIndex,
            hoveredAnnotationIds: [],
            clickable: false,
        };
    }
    return {
        isChartEmpty: (0, is_chart_empty_1.isChartEmptySelector)(state),
        chartDimensions: (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions,
        sharedStyle: (0, get_chart_theme_1.getChartThemeSelector)(state).sharedStyle,
        annotationDimensions: (0, compute_annotations_1.computeAnnotationDimensionsSelector)(state),
        annotationSpecs: (0, get_specs_1.getAnnotationSpecsSelector)(state),
        tooltipState: (0, get_annotation_tooltip_state_1.getAnnotationTooltipStateSelector)(state),
        chartId,
        zIndex,
        hoveredAnnotationIds: (0, get_highlighted_annotation_ids_selector_1.getHighlightedAnnotationIdsSelector)(state),
        clickable: Boolean((0, get_settings_spec_1.getSettingsSpecSelector)(state).onAnnotationClick),
    };
};
exports.Annotations = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(AnnotationsComponent);
//# sourceMappingURL=annotations.js.map