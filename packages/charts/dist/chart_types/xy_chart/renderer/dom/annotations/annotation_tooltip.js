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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationTooltip = void 0;
var react_1 = __importStar(require("react"));
var portal_1 = require("../../../../../components/portal");
var tooltip_1 = require("../../../../../components/tooltip");
var tooltip_content_1 = require("./tooltip_content");
var AnnotationTooltip = function (_a) {
    var _b;
    var state = _a.state, chartRef = _a.chartRef, chartId = _a.chartId, onScroll = _a.onScroll, zIndex = _a.zIndex;
    var renderTooltip = (0, react_1.useCallback)(function () {
        if (!state || !state.isVisible) {
            return null;
        }
        return (react_1.default.createElement(tooltip_1.TooltipWrapper, { className: "echAnnotation" },
            react_1.default.createElement(tooltip_content_1.TooltipContent, __assign({}, state))));
    }, [state]);
    var handleScroll = function () {
        if (onScroll) {
            onScroll();
        }
    };
    (0, react_1.useEffect)(function () {
        if (onScroll) {
            window.addEventListener('scroll', handleScroll, true);
            return function () { return window.removeEventListener('scroll', handleScroll, true); };
        }
    }, []);
    var popperSettings = (0, react_1.useMemo)(function () {
        var _a;
        var settings = state === null || state === void 0 ? void 0 : state.tooltipSettings;
        if (!settings) {
            return;
        }
        var placement = settings.placement, boundary = settings.boundary, rest = __rest(settings, ["placement", "boundary"]);
        return __assign(__assign({}, rest), { placement: placement !== null && placement !== void 0 ? placement : portal_1.Placement.Right, boundary: boundary === 'chart' ? (_a = chartRef.current) !== null && _a !== void 0 ? _a : undefined : boundary });
    }, [state === null || state === void 0 ? void 0 : state.tooltipSettings, chartRef]);
    var position = (0, react_1.useMemo)(function () { var _a; return (_a = state === null || state === void 0 ? void 0 : state.anchor) !== null && _a !== void 0 ? _a : null; }, [state === null || state === void 0 ? void 0 : state.anchor]);
    if (!(state === null || state === void 0 ? void 0 : state.isVisible)) {
        return null;
    }
    return (react_1.default.createElement(portal_1.TooltipPortal, { scope: "AnnotationTooltip", chartId: chartId, zIndex: zIndex + 100, anchor: {
            position: position,
            appendRef: chartRef,
        }, visible: (_b = state === null || state === void 0 ? void 0 : state.isVisible) !== null && _b !== void 0 ? _b : false, settings: popperSettings }, renderTooltip()));
};
exports.AnnotationTooltip = AnnotationTooltip;
//# sourceMappingURL=annotation_tooltip.js.map