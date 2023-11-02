"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMostlyRTLLabels = exports.nullShapeViewModel = exports.nullPartitionSmallMultiplesModel = void 0;
const config_types_1 = require("./config_types");
const colors_1 = require("../../../../common/colors");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const config_1 = require("../config");
const defaultFont = {
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontFamily: '',
    fontWeight: 'normal',
    textColor: colors_1.Colors.Black.keyword,
};
const nullPartitionSmallMultiplesModel = (layout = config_types_1.PartitionLayout.sunburst) => ({
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
    layout,
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
exports.nullPartitionSmallMultiplesModel = nullPartitionSmallMultiplesModel;
const nullShapeViewModel = (layout = config_types_1.PartitionLayout.sunburst, style = light_theme_1.LIGHT_THEME.partition, diskCenter) => ({
    ...(0, exports.nullPartitionSmallMultiplesModel)(layout),
    style,
    layers: [],
    quadViewModel: [],
    rowSets: [],
    linkLabelViewModels: {
        linkLabels: [],
        labelFontSpec: defaultFont,
        valueFontSpec: defaultFont,
        strokeColor: '',
    },
    outsideLinksViewModel: [],
    diskCenter: diskCenter || { x: 0, y: 0 },
    pickQuads: () => [],
    outerRadius: 0,
    chartDimensions: {
        width: 0,
        height: 0,
    },
    animation: { duration: 0 },
});
exports.nullShapeViewModel = nullShapeViewModel;
const hasMostlyRTLLabels = (geoms) => geoms.reduce((surplus, { rowSets }) => surplus + rowSets.reduce((excess, { isRTL }) => excess + (isRTL ? 1 : -1), 0), 0) > 0;
exports.hasMostlyRTLLabels = hasMostlyRTLLabels;
//# sourceMappingURL=viewmodel_types.js.map