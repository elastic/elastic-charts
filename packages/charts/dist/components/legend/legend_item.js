"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLegendItem = exports.LegendListItem = exports.LEGEND_HIERARCHY_MARGIN = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importStar(require("react"));
var common_1 = require("../../utils/common");
var fast_deep_equal_1 = require("../../utils/fast_deep_equal");
var color_1 = require("./color");
var extra_1 = require("./extra");
var label_1 = require("./label");
var utils_1 = require("./utils");
exports.LEGEND_HIERARCHY_MARGIN = 10;
var LegendListItem = (function (_super) {
    __extends(LegendListItem, _super);
    function LegendListItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.shouldClearPersistedColor = false;
        _this.colorRef = (0, react_1.createRef)();
        _this.state = {
            isOpen: false,
            actionActive: false,
        };
        _this.handleColorClick = function (changeable) {
            return changeable
                ? function (event) {
                    event.stopPropagation();
                    _this.toggleIsOpen();
                }
                : undefined;
        };
        _this.toggleIsOpen = function () {
            _this.setState(function (_a) {
                var isOpen = _a.isOpen;
                return ({ isOpen: !isOpen });
            });
        };
        _this.onLegendItemMouseOver = function () {
            var _a = _this.props, onMouseOver = _a.onMouseOver, mouseOverAction = _a.mouseOverAction, item = _a.item;
            if (onMouseOver) {
                onMouseOver(item.seriesIdentifiers);
            }
            mouseOverAction(item.path);
        };
        _this.onLegendItemMouseOut = function () {
            var _a = _this.props, onMouseOut = _a.onMouseOut, mouseOutAction = _a.mouseOutAction;
            if (onMouseOut) {
                onMouseOut();
            }
            mouseOutAction();
        };
        _this.onLabelToggle = function (legendItemId) {
            var _a = _this.props, item = _a.item, onClick = _a.onClick, toggleDeselectSeriesAction = _a.toggleDeselectSeriesAction, totalItems = _a.totalItems;
            if (totalItems <= 1 || (!item.isToggleable && !onClick)) {
                return;
            }
            return function (negate) {
                if (onClick) {
                    onClick(legendItemId);
                }
                if (item.isToggleable) {
                    toggleDeselectSeriesAction(legendItemId, negate);
                }
            };
        };
        return _this;
    }
    LegendListItem.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps) || !(0, fast_deep_equal_1.deepEqual)(this.state, nextState);
    };
    LegendListItem.prototype.renderColorPicker = function () {
        var _this = this;
        var _a = this.props, ColorPicker = _a.colorPicker, item = _a.item, clearTemporaryColorsAction = _a.clearTemporaryColorsAction, setTemporaryColorAction = _a.setTemporaryColorAction, setPersistedColorAction = _a.setPersistedColorAction;
        var seriesIdentifiers = item.seriesIdentifiers, color = item.color;
        var seriesKeys = seriesIdentifiers.map(function (_a) {
            var key = _a.key;
            return key;
        });
        var handleClose = function () {
            setPersistedColorAction(seriesKeys, _this.shouldClearPersistedColor ? null : color);
            clearTemporaryColorsAction();
            requestAnimationFrame(function () { var _a, _b; return (_b = (_a = _this.colorRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.focus(); });
            _this.toggleIsOpen();
        };
        var handleChange = function (c) {
            _this.shouldClearPersistedColor = c === null;
            setTemporaryColorAction(seriesKeys, c);
        };
        if (ColorPicker && this.state.isOpen && this.colorRef.current) {
            return (react_1.default.createElement(ColorPicker, { anchor: this.colorRef.current, color: color, onClose: handleClose, onChange: handleChange, seriesIdentifiers: seriesIdentifiers }));
        }
    };
    LegendListItem.prototype.render = function () {
        var _a;
        var _b;
        var _c = this.props, extraValues = _c.extraValues, item = _c.item, showExtra = _c.showExtra, colorPicker = _c.colorPicker, totalItems = _c.totalItems, Action = _c.action, positionConfig = _c.positionConfig, labelOptions = _c.labelOptions, isMostlyRTL = _c.isMostlyRTL;
        var color = item.color, isSeriesHidden = item.isSeriesHidden, isItemHidden = item.isItemHidden, seriesIdentifiers = item.seriesIdentifiers, label = item.label, pointStyle = item.pointStyle;
        if (isItemHidden)
            return null;
        var itemClassNames = (0, classnames_1.default)('echLegendItem', {
            'echLegendItem--hidden': isSeriesHidden,
            'echLegendItem--vertical': positionConfig.direction === common_1.LayoutDirection.Vertical,
        });
        var hasColorPicker = Boolean(colorPicker);
        var extra = showExtra && (0, utils_1.getExtra)(extraValues, item, totalItems);
        var style = item.depth
            ? (_a = {},
                _a[isMostlyRTL ? 'marginRight' : 'marginLeft'] = exports.LEGEND_HIERARCHY_MARGIN * ((_b = item.depth) !== null && _b !== void 0 ? _b : 0),
                _a) : undefined;
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
    };
    LegendListItem.displayName = 'LegendItem';
    return LegendListItem;
}(react_1.Component));
exports.LegendListItem = LegendListItem;
function renderLegendItem(item, props, index) {
    return react_1.default.createElement(LegendListItem, __assign({ key: "".concat(index), item: item }, props));
}
exports.renderLegendItem = renderLegendItem;
//# sourceMappingURL=legend_item.js.map