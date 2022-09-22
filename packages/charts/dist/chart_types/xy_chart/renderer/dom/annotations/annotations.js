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
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var dom_element_1 = require("../../../../../state/actions/dom_element");
var mouse_1 = require("../../../../../state/actions/mouse");
var get_chart_theme_1 = require("../../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../../state/selectors/get_settings_spec");
var light_theme_1 = require("../../../../../utils/themes/light_theme");
var compute_annotations_1 = require("../../../state/selectors/compute_annotations");
var compute_chart_dimensions_1 = require("../../../state/selectors/compute_chart_dimensions");
var get_annotation_tooltip_state_1 = require("../../../state/selectors/get_annotation_tooltip_state");
var get_highlighted_annotation_ids_selector_1 = require("../../../state/selectors/get_highlighted_annotation_ids_selector");
var get_specs_1 = require("../../../state/selectors/get_specs");
var is_chart_empty_1 = require("../../../state/selectors/is_chart_empty");
var spec_1 = require("../../../state/utils/spec");
var specs_1 = require("../../../utils/specs");
var utils_1 = require("../../common/utils");
var annotation_tooltip_1 = require("./annotation_tooltip");
var line_marker_1 = require("./line_marker");
function renderAnnotationLineMarkers(chartAreaRef, chartDimensions, annotationLines, onDOMElementEnter, onDOMElementLeave, hoveredIds, sharedStyle, clickable, animations) {
    var getHoverParams = (0, utils_1.getAnnotationHoverParamsFn)(hoveredIds, sharedStyle, animations);
    return annotationLines.reduce(function (acc, props) {
        if (props.markers.length === 0) {
            return acc;
        }
        acc.push(react_1.default.createElement(line_marker_1.LineMarker, __assign({}, props, { key: "annotation-".concat(props.id), chartAreaRef: chartAreaRef, chartDimensions: chartDimensions, onDOMElementEnter: onDOMElementEnter, onDOMElementLeave: onDOMElementLeave, onDOMElementClick: dom_element_1.onDOMElementClick, clickable: clickable, getHoverParams: getHoverParams })));
        return acc;
    }, []);
}
var AnnotationsComponent = function (_a) {
    var tooltipState = _a.tooltipState, isChartEmpty = _a.isChartEmpty, chartDimensions = _a.chartDimensions, annotationSpecs = _a.annotationSpecs, annotationDimensions = _a.annotationDimensions, getChartContainerRef = _a.getChartContainerRef, chartAreaRef = _a.chartAreaRef, chartId = _a.chartId, zIndex = _a.zIndex, onPointerMove = _a.onPointerMove, onDOMElementEnter = _a.onDOMElementEnter, onDOMElementLeave = _a.onDOMElementLeave, clickable = _a.clickable, hoveredAnnotationIds = _a.hoveredAnnotationIds, sharedStyle = _a.sharedStyle;
    var renderAnnotationMarkers = (0, react_1.useCallback)(function () {
        var markers = [];
        annotationDimensions.forEach(function (dimensions, id) {
            var annotationSpec = (0, spec_1.getSpecsById)(annotationSpecs, id);
            if (!annotationSpec) {
                return;
            }
            if ((0, specs_1.isLineAnnotation)(annotationSpec)) {
                var annotationLines = dimensions;
                var lineMarkers = renderAnnotationLineMarkers(chartAreaRef, chartDimensions, annotationLines, onDOMElementEnter, onDOMElementLeave, hoveredAnnotationIds, sharedStyle, clickable, annotationSpec.animations);
                lineMarkers.forEach(function (m) { return markers.push(m); });
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
    var onScroll = (0, react_1.useCallback)(function () {
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
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onPointerMove: mouse_1.onPointerMove,
        onDOMElementLeave: dom_element_1.onDOMElementLeave,
        onDOMElementEnter: dom_element_1.onDOMElementEnter,
        onDOMElementClick: dom_element_1.onDOMElementClick,
    }, dispatch);
};
var mapStateToProps = function (state) {
    var zIndex = state.zIndex, chartId = state.chartId;
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            isChartEmpty: true,
            chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
            sharedStyle: light_theme_1.LIGHT_THEME.sharedStyle,
            annotationDimensions: new Map(),
            annotationSpecs: [],
            tooltipState: null,
            chartId: chartId,
            zIndex: zIndex,
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
        chartId: chartId,
        zIndex: zIndex,
        hoveredAnnotationIds: (0, get_highlighted_annotation_ids_selector_1.getHighlightedAnnotationIdsSelector)(state),
        clickable: Boolean((0, get_settings_spec_1.getSettingsSpecSelector)(state).onAnnotationClick),
    };
};
exports.Annotations = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(AnnotationsComponent);
//# sourceMappingURL=annotations.js.map