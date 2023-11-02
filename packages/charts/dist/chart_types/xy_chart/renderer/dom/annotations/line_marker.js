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
exports.LineMarker = void 0;
const core_1 = require("@popperjs/core");
const react_1 = __importStar(require("react"));
const constants_1 = require("../../../../../common/constants");
const dom_element_1 = require("../../../../../state/actions/dom_element");
const common_1 = require("../../../../../utils/common");
const MARKER_TRANSFORMS = {
    [common_1.Position.Right]: 'translate(0%, -50%)',
    [common_1.Position.Left]: 'translate(-100%, -50%)',
    [common_1.Position.Top]: 'translate(-50%, -100%)',
    [common_1.Position.Bottom]: 'translate(-50%, 0%)',
};
function getMarkerCentredTransform(alignment, hasMarkerDimensions) {
    return hasMarkerDimensions ? undefined : MARKER_TRANSFORMS[alignment];
}
function LineMarker({ id, specId, datum, panel, marker: { icon, body, color, position, alignment, dimension }, chartAreaRef, chartDimensions, onDOMElementEnter, onDOMElementLeave, onDOMElementClick, clickable, getHoverParams, }) {
    var _a, _b;
    const { style, options } = getHoverParams(id);
    const iconRef = (0, react_1.useRef)(null);
    const testRef = (0, react_1.useRef)(null);
    const popper = (0, react_1.useRef)(null);
    const markerStyle = {
        ...style,
        ...getAnimatedStyles(options, style),
        color,
        top: chartDimensions.top + position.top + panel.top,
        left: chartDimensions.left + position.left + panel.left,
        cursor: clickable ? 'pointer' : constants_1.DEFAULT_CSS_CURSOR,
    };
    const transform = { transform: getMarkerCentredTransform(alignment, Boolean(dimension)) };
    const setPopper = (0, react_1.useCallback)(() => {
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
    (0, react_1.useEffect)(() => {
        if (!popper.current && body) {
            setPopper();
        }
        return () => {
            var _a, _b;
            (_b = (_a = popper === null || popper === void 0 ? void 0 : popper.current) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a);
            popper.current = null;
        };
    }, [setPopper, body]);
    void ((_b = (_a = popper === null || popper === void 0 ? void 0 : popper.current) === null || _a === void 0 ? void 0 : _a.update) === null || _b === void 0 ? void 0 : _b.call(_a));
    return clickable ? (react_1.default.createElement("button", { className: "echAnnotation__marker", onMouseEnter: () => {
            onDOMElementEnter({
                createdBySpecId: specId,
                id,
                type: dom_element_1.DOMElementType.LineAnnotationMarker,
                datum,
            });
        }, onMouseLeave: onDOMElementLeave, onClick: onDOMElementClick, style: { ...markerStyle, ...transform }, type: "button" },
        react_1.default.createElement("div", { ref: iconRef, className: "echAnnotation__icon" }, (0, common_1.renderWithProps)(icon, datum)),
        body && (react_1.default.createElement("div", { ref: testRef, className: "echAnnotation__body" }, (0, common_1.renderWithProps)(body, datum))))) : (react_1.default.createElement("div", { className: "echAnnotation__marker", onMouseEnter: () => {
            onDOMElementEnter({
                createdBySpecId: specId,
                id,
                type: dom_element_1.DOMElementType.LineAnnotationMarker,
                datum,
            });
        }, onMouseLeave: onDOMElementLeave, style: { ...markerStyle, ...transform } },
        react_1.default.createElement("div", { ref: iconRef, className: "echAnnotation__icon" }, (0, common_1.renderWithProps)(icon, datum)),
        body && (react_1.default.createElement("div", { ref: testRef, className: "echAnnotation__body" }, (0, common_1.renderWithProps)(body, datum)))));
}
exports.LineMarker = LineMarker;
function getAnimatedStyles({ duration, delay, timeFunction, snapValues = [], enabled }, { opacity }) {
    if (!enabled || (typeof opacity === 'number' && snapValues.includes(opacity)))
        return {};
    return {
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionProperty: 'opacity',
        transitionTimingFunction: timeFunction,
    };
}
//# sourceMappingURL=line_marker.js.map