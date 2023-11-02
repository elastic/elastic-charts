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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendListItem = exports.LEGEND_HIERARCHY_MARGIN = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const color_1 = require("./color");
const extra_1 = require("./extra");
const label_1 = require("./label");
const utils_1 = require("./utils");
const common_1 = require("../../utils/common");
const fast_deep_equal_1 = require("../../utils/fast_deep_equal");
exports.LEGEND_HIERARCHY_MARGIN = 10;
class LegendListItem extends react_1.Component {
    constructor() {
        super(...arguments);
        this.shouldClearPersistedColor = false;
        this.colorRef = (0, react_1.createRef)();
        this.state = {
            isOpen: false,
            actionActive: false,
        };
        this.handleColorClick = (changeable) => changeable
            ? (event) => {
                event.stopPropagation();
                this.toggleIsOpen();
            }
            : undefined;
        this.toggleIsOpen = () => {
            this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
        };
        this.onLegendItemMouseOver = () => {
            const { onMouseOver, mouseOverAction, item } = this.props;
            if (onMouseOver) {
                onMouseOver(item.seriesIdentifiers);
            }
            mouseOverAction(item.path);
        };
        this.onLegendItemMouseOut = () => {
            const { onMouseOut, mouseOutAction } = this.props;
            if (onMouseOut) {
                onMouseOut();
            }
            mouseOutAction();
        };
        this.onLabelToggle = (legendItemId) => {
            const { item, onClick, toggleDeselectSeriesAction, totalItems } = this.props;
            if (totalItems <= 1 || (!item.isToggleable && !onClick)) {
                return;
            }
            return (negate) => {
                if (onClick) {
                    onClick(legendItemId);
                }
                if (item.isToggleable) {
                    toggleDeselectSeriesAction(legendItemId, negate);
                }
            };
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps) || !(0, fast_deep_equal_1.deepEqual)(this.state, nextState);
    }
    renderColorPicker() {
        const { colorPicker: ColorPicker, item, clearTemporaryColorsAction, setTemporaryColorAction, setPersistedColorAction, } = this.props;
        const { seriesIdentifiers, color } = item;
        const seriesKeys = seriesIdentifiers.map(({ key }) => key);
        const handleClose = () => {
            setPersistedColorAction(seriesKeys, this.shouldClearPersistedColor ? null : color);
            clearTemporaryColorsAction();
            requestAnimationFrame(() => { var _a, _b; return (_b = (_a = this.colorRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.focus(); });
            this.toggleIsOpen();
        };
        const handleChange = (c) => {
            this.shouldClearPersistedColor = c === null;
            setTemporaryColorAction(seriesKeys, c);
        };
        if (ColorPicker && this.state.isOpen && this.colorRef.current) {
            return (react_1.default.createElement(ColorPicker, { anchor: this.colorRef.current, color: color, onClose: handleClose, onChange: handleChange, seriesIdentifiers: seriesIdentifiers }));
        }
    }
    render() {
        var _a;
        const { extraValues, item, showExtra, colorPicker, totalItems, action: Action, positionConfig, labelOptions, isMostlyRTL, flatLegend, } = this.props;
        const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, pointStyle } = item;
        if (isItemHidden)
            return null;
        const itemClassNames = (0, classnames_1.default)('echLegendItem', {
            'echLegendItem--hidden': isSeriesHidden,
            'echLegendItem--vertical': positionConfig.direction === common_1.LayoutDirection.Vertical,
        });
        const hasColorPicker = Boolean(colorPicker);
        const extra = showExtra && (0, utils_1.getExtra)(extraValues, item, totalItems);
        const style = flatLegend
            ? {}
            : {
                [isMostlyRTL ? 'marginRight' : 'marginLeft']: exports.LEGEND_HIERARCHY_MARGIN * ((_a = item.depth) !== null && _a !== void 0 ? _a : 0),
            };
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("li", { className: itemClassNames, onMouseEnter: this.onLegendItemMouseOver, onMouseLeave: this.onLegendItemMouseOut, style: style, dir: isMostlyRTL ? 'rtl' : 'ltr', "data-ech-series-name": label },
                react_1.default.createElement("div", { className: "background" }),
                react_1.default.createElement("div", { className: "colorWrapper" },
                    react_1.default.createElement(color_1.Color, { ref: this.colorRef, color: color, seriesName: label, isSeriesHidden: isSeriesHidden, hasColorPicker: hasColorPicker, onClick: this.handleColorClick(hasColorPicker), pointStyle: pointStyle })),
                react_1.default.createElement(label_1.Label, { label: label, options: labelOptions, isToggleable: totalItems > 1 && item.isToggleable, onToggle: this.onLabelToggle(seriesIdentifiers), isSeriesHidden: isSeriesHidden }),
                extra && !isSeriesHidden && (0, extra_1.renderExtra)(extra),
                Action && (react_1.default.createElement("div", { className: "echLegendItem__action" },
                    react_1.default.createElement(Action, { series: seriesIdentifiers, color: color, label: label })))),
            this.renderColorPicker()));
    }
}
exports.LegendListItem = LegendListItem;
LegendListItem.displayName = 'LegendItem';
//# sourceMappingURL=legend_item.js.map