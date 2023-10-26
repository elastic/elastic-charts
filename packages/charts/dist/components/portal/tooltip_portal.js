"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipPortal = void 0;
const core_1 = require("@popperjs/core");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const utils_1 = require("./utils");
const common_1 = require("../../utils/common");
function addToPadding(padding = 0, extra = 0) {
    if (typeof padding === 'number')
        return padding + extra;
    const { top = 0, right = 0, bottom = 0, left = 0 } = padding;
    return {
        top: top + extra,
        right: right + extra,
        bottom: bottom + extra,
        left: left + extra,
    };
}
const TooltipPortalComponent = ({ anchor, scope, settings, children, visible, chartId, zIndex, onPlacementChange, }) => {
    var _a, _b;
    const finalPlacement = (0, react_1.useRef)('auto');
    const skipPositioning = (0, utils_1.isHTMLElement)(anchor.current);
    const { position } = anchor;
    const anchorNode = (0, react_1.useMemo)(() => {
        var _a, _b;
        return ((_a = anchor === null || anchor === void 0 ? void 0 : anchor.current) !== null && _a !== void 0 ? _a : (0, utils_1.getOrCreateNode)(`echAnchor${scope}__${chartId}`, undefined, (_b = anchor === null || anchor === void 0 ? void 0 : anchor.appendRef) === null || _b === void 0 ? void 0 : _b.current));
    }, [(_a = anchor === null || anchor === void 0 ? void 0 : anchor.current) !== null && _a !== void 0 ? _a : (_b = anchor === null || anchor === void 0 ? void 0 : anchor.appendRef) === null || _b === void 0 ? void 0 : _b.current]);
    const portalNode = (0, react_1.useMemo)(() => {
        return (0, utils_1.getOrCreateNode)(`echTooltipPortal${scope}__${chartId}`, 'echTooltipPortal__invisible', undefined, zIndex);
    }, [chartId, scope, zIndex]);
    (0, react_1.useEffect)(() => {
        document.body.appendChild(portalNode);
    });
    const popper = (0, react_1.useRef)(null);
    const popperSettings = (0, react_1.useMemo)(() => (0, common_1.mergePartial)(utils_1.DEFAULT_POPPER_SETTINGS, settings), [settings]);
    const destroyPopper = (0, react_1.useCallback)(() => {
        if (popper.current) {
            popper.current.destroy();
            popper.current = null;
        }
    }, []);
    const setPopper = (0, react_1.useCallback)(() => {
        if (!visible)
            return;
        const { fallbackPlacements, placement, boundary, offset, boundaryPadding } = popperSettings;
        popper.current = (0, core_1.createPopper)(anchorNode, portalNode, {
            strategy: 'absolute',
            placement,
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
                        boundary,
                        padding: boundaryPadding,
                    },
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: fallbackPlacements.filter((p) => p !== placement),
                        boundary,
                        altAxis: false,
                        padding: addToPadding(boundaryPadding, offset),
                    },
                },
                {
                    name: 'reportPlacement',
                    phase: 'afterWrite',
                    enabled: Boolean(onPlacementChange),
                    fn: ({ state }) => {
                        if (finalPlacement.current !== state.placement) {
                            finalPlacement.current = state.placement;
                            onPlacementChange === null || onPlacementChange === void 0 ? void 0 : onPlacementChange(state.placement);
                        }
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
    (0, react_1.useEffect)(() => {
        setPopper();
        const nodeCopy = portalNode;
        return () => {
            if (nodeCopy.parentNode) {
                nodeCopy.parentNode.removeChild(nodeCopy);
            }
            destroyPopper();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        destroyPopper();
        setPopper();
    }, [destroyPopper, setPopper, popperSettings]);
    (0, react_1.useEffect)(() => {
        if (!visible) {
            destroyPopper();
        }
        else if (!popper.current) {
            setPopper();
        }
    }, [destroyPopper, setPopper, visible]);
    const updateAnchorDimensions = (0, react_1.useCallback)(() => {
        if (!position || !visible || skipPositioning) {
            return;
        }
        const { x, y, width, height } = position;
        anchorNode.style.transform = `translate(${x}px, ${y}px)`;
        if ((0, common_1.isDefined)(width)) {
            anchorNode.style.width = `${width}px`;
        }
        if ((0, common_1.isDefined)(height)) {
            anchorNode.style.height = `${height}px`;
        }
    }, [visible, anchorNode, position === null || position === void 0 ? void 0 : position.x, position === null || position === void 0 ? void 0 : position.y, position === null || position === void 0 ? void 0 : position.width, position === null || position === void 0 ? void 0 : position.height]);
    (0, react_1.useEffect)(() => {
        if (!position && !skipPositioning) {
            portalNode.classList.add('echTooltipPortal__invisible');
            return;
        }
        portalNode.classList.remove('echTooltipPortal__invisible');
    }, [portalNode.classList, position, skipPositioning]);
    (0, react_1.useEffect)(() => {
        if (popper.current) {
            updateAnchorDimensions();
            void popper.current.update();
        }
    }, [updateAnchorDimensions]);
    return (0, react_dom_1.createPortal)(children, portalNode, 'ech-tooltip-portal');
};
TooltipPortalComponent.displayName = 'TooltipPortal';
exports.TooltipPortal = TooltipPortalComponent;
//# sourceMappingURL=tooltip_portal.js.map