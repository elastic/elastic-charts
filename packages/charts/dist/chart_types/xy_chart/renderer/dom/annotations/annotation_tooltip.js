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
exports.AnnotationTooltip = void 0;
const react_1 = __importStar(require("react"));
const tooltip_content_1 = require("./tooltip_content");
const portal_1 = require("../../../../../components/portal");
const tooltip_1 = require("../../../../../components/tooltip");
const AnnotationTooltip = ({ state, chartRef, chartId, onScroll, zIndex }) => {
    var _a;
    const renderTooltip = (0, react_1.useCallback)(() => {
        if (!state || !state.isVisible) {
            return null;
        }
        return (react_1.default.createElement(tooltip_1.TooltipWrapper, { actions: [], actionPrompt: "", pinningPrompt: "", selectionPrompt: "", actionsLoading: "", noActionsLoaded: "", className: "echAnnotation" },
            react_1.default.createElement(tooltip_content_1.TooltipContent, { ...state })));
    }, [state]);
    const handleScroll = () => {
        if (onScroll) {
            onScroll();
        }
    };
    (0, react_1.useEffect)(() => {
        if (onScroll) {
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, []);
    const popperSettings = (0, react_1.useMemo)(() => {
        var _a;
        const settings = state === null || state === void 0 ? void 0 : state.tooltipSettings;
        if (!settings) {
            return;
        }
        const { placement, boundary, ...rest } = settings;
        return {
            ...rest,
            placement: placement !== null && placement !== void 0 ? placement : portal_1.Placement.Right,
            boundary: boundary === 'chart' ? (_a = chartRef.current) !== null && _a !== void 0 ? _a : undefined : boundary,
        };
    }, [state === null || state === void 0 ? void 0 : state.tooltipSettings, chartRef]);
    const position = (0, react_1.useMemo)(() => { var _a; return (_a = state === null || state === void 0 ? void 0 : state.anchor) !== null && _a !== void 0 ? _a : null; }, [state === null || state === void 0 ? void 0 : state.anchor]);
    if (!(state === null || state === void 0 ? void 0 : state.isVisible)) {
        return null;
    }
    return (react_1.default.createElement(portal_1.TooltipPortal, { scope: "AnnotationTooltip", chartId: chartId, zIndex: zIndex + 100, anchor: {
            position,
            appendRef: chartRef,
        }, visible: (_a = state === null || state === void 0 ? void 0 : state.isVisible) !== null && _a !== void 0 ? _a : false, settings: popperSettings }, renderTooltip()));
};
exports.AnnotationTooltip = AnnotationTooltip;
//# sourceMappingURL=annotation_tooltip.js.map