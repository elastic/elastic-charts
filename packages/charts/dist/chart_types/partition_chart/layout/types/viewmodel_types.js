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
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMostlyRTLLabels = exports.nullShapeViewModel = exports.nullPartitionSmallMultiplesModel = void 0;
var colors_1 = require("../../../../common/colors");
var light_theme_1 = require("../../../../utils/themes/light_theme");
var config_1 = require("../config");
var config_types_1 = require("./config_types");
var defaultFont = {
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontFamily: '',
    fontWeight: 'normal',
    textColor: colors_1.Colors.Black.keyword,
};
var nullPartitionSmallMultiplesModel = function (layout) {
    if (layout === void 0) { layout = config_types_1.PartitionLayout.sunburst; }
    return ({
        index: 0,
        innerIndex: 0,
        smAccessorValue: '',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        innerRowCount: 0,
        innerColumnCount: 0,
        innerRowIndex: 0,
        innerColumnIndex: 0,
        marginLeftPx: 0,
        marginTopPx: 0,
        layout: layout,
        panel: {
            title: '',
            innerWidth: 0,
            innerHeight: 0,
            fontSize: 10,
            fontFace: {
                fontVariant: 'normal',
                fontWeight: 'normal',
                fontFamily: 'sans-serif',
                fontStyle: 'normal',
                textColor: colors_1.Colors.Black.keyword,
            },
        },
    });
};
exports.nullPartitionSmallMultiplesModel = nullPartitionSmallMultiplesModel;
var nullShapeViewModel = function (layout, style, diskCenter) {
    if (layout === void 0) { layout = config_types_1.PartitionLayout.sunburst; }
    if (style === void 0) { style = light_theme_1.LIGHT_THEME.partition; }
    return (__assign(__assign({}, (0, exports.nullPartitionSmallMultiplesModel)(layout)), { style: style, layers: [], quadViewModel: [], rowSets: [], linkLabelViewModels: {
            linkLabels: [],
            labelFontSpec: defaultFont,
            valueFontSpec: defaultFont,
            strokeColor: '',
        }, outsideLinksViewModel: [], diskCenter: diskCenter || { x: 0, y: 0 }, pickQuads: function () { return []; }, outerRadius: 0, chartDimensions: {
            width: 0,
            height: 0,
        }, animation: { duration: 0 } }));
};
exports.nullShapeViewModel = nullShapeViewModel;
var hasMostlyRTLLabels = function (geoms) {
    return geoms.reduce(function (surplus, _a) {
        var rowSets = _a.rowSets;
        return surplus + rowSets.reduce(function (excess, _a) {
            var isRTL = _a.isRTL;
            return excess + (isRTL ? 1 : -1);
        }, 0);
    }, 0) > 0;
};
exports.hasMostlyRTLLabels = hasMostlyRTLLabels;
//# sourceMappingURL=viewmodel_types.js.map