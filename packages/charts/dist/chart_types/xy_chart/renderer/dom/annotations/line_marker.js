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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineMarker = void 0;
var core_1 = require("@popperjs/core");
var react_1 = __importStar(require("react"));
var constants_1 = require("../../../../../common/constants");
var dom_element_1 = require("../../../../../state/actions/dom_element");
var common_1 = require("../../../../../utils/common");
var MARKER_TRANSFORMS = (_a = {},
    _a[common_1.Position.Right] = 'translate(0%, -50%)',
    _a[common_1.Position.Left] = 'translate(-100%, -50%)',
    _a[common_1.Position.Top] = 'translate(-50%, -100%)',
    _a[common_1.Position.Bottom] = 'translate(-50%, 0%)',
    _a);
function getMarkerCentredTransform(alignment, hasMarkerDimensions) {
    return hasMarkerDimensions ? undefined : MARKER_TRANSFORMS[alignment];
}
function LineMarker(_a) {
    var _b, _c;
    var id = _a.id, specId = _a.specId, datum = _a.datum, panel = _a.panel, _d = __read(_a.markers, 1), _e = _d[0], icon = _e.icon, body = _e.body, color = _e.color, position = _e.position, alignment = _e.alignment, dimension = _e.dimension, chartAreaRef = _a.chartAreaRef, chartDimensions = _a.chartDimensions, onDOMElementEnter = _a.onDOMElementEnter, onDOMElementLeave = _a.onDOMElementLeave, onDOMElementClick = _a.onDOMElementClick, clickable = _a.clickable, getHoverParams = _a.getHoverParams;
    var _f = getHoverParams(id), style = _f.style, options = _f.options;
    var iconRef = (0, react_1.useRef)(null);
    var testRef = (0, react_1.useRef)(null);
    var popper = (0, react_1.useRef)(null);
    var markerStyle = __assign(__assign(__assign({}, style), getAnimatedStyles(options, style)), { color: color, top: chartDimensions.top + position.top + panel.top, left: chartDimensions.left + position.left + panel.left, cursor: clickable ? 'pointer' : constants_1.DEFAULT_CSS_CURSOR });
    var transform = { transform: getMarkerCentredTransform(alignment, Boolean(dimension)) };
    var setPopper = (0, react_1.useCallback)(function () {
        if (!iconRef.current || !testRef.current)
            return;
        popper.current = (0, core_1.createPopper)(iconRef.current, testRef.current, {
            strategy: 'absolute',
            placement: alignment,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 0],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: chartAreaRef.current,
                    },
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: [],
                    },
                },
            ],
        });
    }, [chartAreaRef, alignment]);
    (0, react_1.useEffect)(function () {
        if (!popper.current && body) {
            setPopper();
        }
        return function () {
            var _a, _b;
            (_b = (_a = popper === null || popper === void 0 ? void 0 : popper.current) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a);
            popper.current = null;
        };
    }, [setPopper, body]);
    void ((_c = (_b = popper === null || popper === void 0 ? void 0 : popper.current) === null || _b === void 0 ? void 0 : _b.update) === null || _c === void 0 ? void 0 : _c.call(_b));
    return onDOMElementClick ? (react_1.default.createElement("button", { className: "echAnnotation__marker", onMouseEnter: function () {
            onDOMElementEnter({
                createdBySpecId: specId,
                id: id,
                type: dom_element_1.DOMElementType.LineAnnotationMarker,
                datum: datum,
            });
        }, onMouseLeave: onDOMElementLeave, onClick: onDOMElementClick, style: __assign(__assign({}, markerStyle), transform), type: "button" },
        react_1.default.createElement("div", { ref: iconRef, className: "echAnnotation__icon" }, (0, common_1.renderWithProps)(icon, datum)),
        body && (react_1.default.createElement("div", { ref: testRef, className: "echAnnotation__body" }, (0, common_1.renderWithProps)(body, datum))))) : (react_1.default.createElement("div", { className: "echAnnotation__marker", onMouseEnter: function () {
            onDOMElementEnter({
                createdBySpecId: specId,
                id: id,
                type: dom_element_1.DOMElementType.LineAnnotationMarker,
                datum: datum,
            });
        }, onMouseLeave: onDOMElementLeave, style: __assign(__assign({}, markerStyle), transform) },
        react_1.default.createElement("div", { ref: iconRef, className: "echAnnotation__icon" }, (0, common_1.renderWithProps)(icon, datum)),
        body && (react_1.default.createElement("div", { ref: testRef, className: "echAnnotation__body" }, (0, common_1.renderWithProps)(body, datum)))));
}
exports.LineMarker = LineMarker;
function getAnimatedStyles(_a, _b) {
    var duration = _a.duration, delay = _a.delay, timeFunction = _a.timeFunction, _c = _a.snapValues, snapValues = _c === void 0 ? [] : _c, enabled = _a.enabled;
    var opacity = _b.opacity;
    if (!enabled || (typeof opacity === 'number' && snapValues.includes(opacity)))
        return {};
    return {
        transitionDuration: "".concat(duration, "ms"),
        transitionDelay: "".concat(delay, "ms"),
        transitionProperty: 'opacity',
        transitionTimingFunction: timeFunction,
    };
}
//# sourceMappingURL=line_marker.js.map