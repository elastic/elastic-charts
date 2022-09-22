"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipPortal = void 0;
var core_1 = require("@popperjs/core");
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var common_1 = require("../../utils/common");
var utils_1 = require("./utils");
function addToPadding(padding, extra) {
    if (padding === void 0) { padding = 0; }
    if (extra === void 0) { extra = 0; }
    if (typeof padding === 'number')
        return padding + extra;
    var _a = padding.top, top = _a === void 0 ? 0 : _a, _b = padding.right, right = _b === void 0 ? 0 : _b, _c = padding.bottom, bottom = _c === void 0 ? 0 : _c, _d = padding.left, left = _d === void 0 ? 0 : _d;
    return {
        top: top + extra,
        right: right + extra,
        bottom: bottom + extra,
        left: left + extra,
    };
}
var TooltipPortalComponent = function (_a) {
    var _b, _c;
    var anchor = _a.anchor, scope = _a.scope, settings = _a.settings, children = _a.children, visible = _a.visible, chartId = _a.chartId, zIndex = _a.zIndex;
    var skipPositioning = (0, utils_1.isHTMLElement)(anchor.current);
    var position = anchor.position;
    var anchorNode = (0, react_1.useMemo)(function () {
        var _a, _b;
        return ((_a = anchor === null || anchor === void 0 ? void 0 : anchor.current) !== null && _a !== void 0 ? _a : (0, utils_1.getOrCreateNode)("echAnchor".concat(scope, "__").concat(chartId), undefined, (_b = anchor === null || anchor === void 0 ? void 0 : anchor.appendRef) === null || _b === void 0 ? void 0 : _b.current));
    }, [(_b = anchor === null || anchor === void 0 ? void 0 : anchor.current) !== null && _b !== void 0 ? _b : (_c = anchor === null || anchor === void 0 ? void 0 : anchor.appendRef) === null || _c === void 0 ? void 0 : _c.current]);
    var portalNodeElement = (0, utils_1.getOrCreateNode)("echTooltipPortal".concat(scope, "__").concat(chartId), 'echTooltipPortal__invisible', undefined, zIndex);
    var portalNode = (0, react_1.useRef)(portalNodeElement);
    var popper = (0, react_1.useRef)(null);
    var popperSettings = (0, react_1.useMemo)(function () { return (0, common_1.mergePartial)(utils_1.DEFAULT_POPPER_SETTINGS, settings); }, [settings]);
    var destroyPopper = (0, react_1.useCallback)(function () {
        if (popper.current) {
            popper.current.destroy();
            popper.current = null;
        }
    }, []);
    var setPopper = (0, react_1.useCallback)(function () {
        if (!visible)
            return;
        var fallbackPlacements = popperSettings.fallbackPlacements, placement = popperSettings.placement, boundary = popperSettings.boundary, offset = popperSettings.offset, boundaryPadding = popperSettings.boundaryPadding;
        popper.current = (0, core_1.createPopper)(anchorNode, portalNode.current, {
            strategy: 'absolute',
            placement: placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, offset],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: boundary,
                        padding: boundaryPadding,
                    },
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: fallbackPlacements.filter(function (p) { return p !== placement; }),
                        boundary: boundary,
                        altAxis: false,
                        padding: addToPadding(boundaryPadding, offset),
                    },
                },
            ],
        });
    }, [
        visible,
        popperSettings.fallbackPlacements,
        popperSettings.placement,
        popperSettings.boundary,
        popperSettings.offset,
    ]);
    (0, react_1.useEffect)(function () {
        setPopper();
        var nodeCopy = portalNode.current;
        return function () {
            if (nodeCopy.parentNode) {
                nodeCopy.parentNode.removeChild(nodeCopy);
            }
            destroyPopper();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        destroyPopper();
        setPopper();
    }, [destroyPopper, setPopper, popperSettings]);
    (0, react_1.useEffect)(function () {
        if (!visible) {
            destroyPopper();
        }
        else if (!popper.current) {
            setPopper();
        }
    }, [destroyPopper, setPopper, visible]);
    var updateAnchorDimensions = (0, react_1.useCallback)(function () {
        if (!position || !visible || skipPositioning) {
            return;
        }
        var x = position.x, y = position.y, width = position.width, height = position.height;
        anchorNode.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
        if ((0, common_1.isDefined)(width)) {
            anchorNode.style.width = "".concat(width, "px");
        }
        if ((0, common_1.isDefined)(height)) {
            anchorNode.style.height = "".concat(height, "px");
        }
    }, [visible, anchorNode, position === null || position === void 0 ? void 0 : position.x, position === null || position === void 0 ? void 0 : position.y, position === null || position === void 0 ? void 0 : position.width, position === null || position === void 0 ? void 0 : position.height]);
    (0, react_1.useEffect)(function () {
        if (!position && !skipPositioning) {
            portalNode.current.classList.add('echTooltipPortal__invisible');
            return;
        }
        portalNode.current.classList.remove('echTooltipPortal__invisible');
    }, [position, skipPositioning]);
    (0, react_1.useEffect)(function () {
        if (popper.current) {
            updateAnchorDimensions();
            void popper.current.update();
        }
    }, [updateAnchorDimensions, popper]);
    return (0, react_dom_1.createPortal)(children, portalNode.current);
};
TooltipPortalComponent.displayName = 'TooltipPortal';
exports.TooltipPortal = TooltipPortalComponent;
//# sourceMappingURL=tooltip_portal.js.map