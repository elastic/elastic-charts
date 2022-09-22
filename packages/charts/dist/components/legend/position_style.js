"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendPositionConfig = exports.LEGEND_TO_FULL_CONFIG = exports.legendPositionStyle = void 0;
var common_1 = require("../../utils/common");
var INSIDE_PADDING = 10;
function legendPositionStyle(_a, legendSize, chart, container) {
    var legendPosition = _a.legendPosition;
    var _b = getLegendPositionConfig(legendPosition), vAlign = _b.vAlign, hAlign = _b.hAlign, direction = _b.direction, floating = _b.floating;
    if (!floating) {
        return {};
    }
    var Left = common_1.Position.Left, Right = common_1.Position.Right, Top = common_1.Position.Top, Bottom = common_1.Position.Bottom;
    if (direction === common_1.LayoutDirection.Vertical) {
        return {
            position: 'absolute',
            zIndex: 1,
            right: hAlign === Right ? container.width - chart.width - chart.left + INSIDE_PADDING : undefined,
            left: hAlign === Left ? chart.left + INSIDE_PADDING : undefined,
            top: vAlign === Top ? chart.top : undefined,
            bottom: vAlign === Bottom ? container.height - chart.top - chart.height : undefined,
            height: legendSize.height >= chart.height ? chart.height : undefined,
        };
    }
    return {
        position: 'absolute',
        zIndex: 1,
        right: INSIDE_PADDING,
        left: chart.left + INSIDE_PADDING,
        top: vAlign === Top ? chart.top : undefined,
        bottom: vAlign === Bottom ? container.height - chart.top - chart.height : undefined,
        height: legendSize.height >= chart.height ? chart.height : undefined,
    };
}
exports.legendPositionStyle = legendPositionStyle;
exports.LEGEND_TO_FULL_CONFIG = (_a = {},
    _a[common_1.Position.Left] = {
        vAlign: common_1.Position.Top,
        hAlign: common_1.Position.Left,
        direction: common_1.LayoutDirection.Vertical,
        floating: false,
        floatingColumns: 1,
    },
    _a[common_1.Position.Top] = {
        vAlign: common_1.Position.Top,
        hAlign: common_1.Position.Left,
        direction: common_1.LayoutDirection.Horizontal,
        floating: false,
        floatingColumns: 1,
    },
    _a[common_1.Position.Bottom] = {
        vAlign: common_1.Position.Bottom,
        hAlign: common_1.Position.Left,
        direction: common_1.LayoutDirection.Horizontal,
        floating: false,
        floatingColumns: 1,
    },
    _a[common_1.Position.Right] = {
        vAlign: common_1.Position.Top,
        hAlign: common_1.Position.Right,
        direction: common_1.LayoutDirection.Vertical,
        floating: false,
        floatingColumns: 1,
    },
    _a);
function getLegendPositionConfig(position) {
    return typeof position === 'object' ? position : exports.LEGEND_TO_FULL_CONFIG[position];
}
exports.getLegendPositionConfig = getLegendPositionConfig;
//# sourceMappingURL=position_style.js.map