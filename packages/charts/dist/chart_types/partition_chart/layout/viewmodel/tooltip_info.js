"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfo = exports.EMPTY_TOOLTIP = void 0;
var config_1 = require("../config");
var scenegraph_1 = require("./scenegraph");
exports.EMPTY_TOOLTIP = Object.freeze({
    header: null,
    values: [],
});
function getTooltipInfo(pickedShapes, labelFormatters, valueGetter, valueFormatter, percentFormatter, id) {
    if (!valueFormatter || !labelFormatters) {
        return exports.EMPTY_TOOLTIP;
    }
    var tooltipInfo = {
        header: null,
        values: [],
    };
    var valueGetterFun = (0, scenegraph_1.valueGetterFunction)(valueGetter);
    var primaryValueGetterFun = valueGetterFun === config_1.percentValueGetter ? config_1.sumValueGetter : valueGetterFun;
    pickedShapes.forEach(function (shape) {
        var formatter = labelFormatters[shape.depth - 1];
        var value = primaryValueGetterFun(shape);
        tooltipInfo.values.push({
            label: formatter ? formatter(shape.dataName) : shape.dataName,
            color: shape.fillColor,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
                specId: id,
                key: id,
            },
            value: value,
            formattedValue: "".concat(valueFormatter(value), " (").concat(percentFormatter((0, config_1.percentValueGetter)(shape)), ")"),
            valueAccessor: shape.depth,
        });
    });
    return tooltipInfo;
}
exports.getTooltipInfo = getTooltipInfo;
//# sourceMappingURL=tooltip_info.js.map