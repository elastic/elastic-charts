"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS_SPEC = exports.settingsBuildProps = exports.DEFAULT_LEGEND_CONFIG = exports.TooltipStickTo = exports.PointerUpdateTrigger = exports.BrushAxis = exports.TooltipType = exports.PointerEventType = exports.Direction = exports.BinAgg = exports.SpecType = void 0;
const chart_types_1 = require("../chart_types");
const constants_1 = require("../common/constants");
const spec_factory_1 = require("../state/spec_factory");
const common_1 = require("../utils/common");
const light_theme_1 = require("../utils/themes/light_theme");
exports.SpecType = Object.freeze({
    Series: 'series',
    Axis: 'axis',
    Annotation: 'annotation',
    Settings: 'settings',
    Tooltip: 'tooltip',
    IndexOrder: 'index_order',
    SmallMultiples: 'small_multiples',
});
exports.BinAgg = Object.freeze({
    Sum: 'sum',
    None: 'none',
});
exports.Direction = Object.freeze({
    Ascending: 'ascending',
    Descending: 'descending',
});
exports.PointerEventType = Object.freeze({
    Over: 'Over',
    Out: 'Out',
});
exports.TooltipType = Object.freeze({
    VerticalCursor: 'vertical',
    Crosshairs: 'cross',
    Follow: 'follow',
    None: 'none',
});
exports.BrushAxis = Object.freeze({
    X: 'x',
    Y: 'y',
    Both: 'both',
});
exports.PointerUpdateTrigger = Object.freeze({
    X: 'x',
    Y: 'y',
    Both: 'both',
});
exports.TooltipStickTo = Object.freeze({
    Top: constants_1.TOP,
    Bottom: constants_1.BOTTOM,
    Middle: constants_1.MIDDLE,
    Left: constants_1.LEFT,
    Right: constants_1.RIGHT,
    Center: constants_1.CENTER,
    MousePosition: 'MousePosition',
});
exports.DEFAULT_LEGEND_CONFIG = {
    showLegend: false,
    legendSize: NaN,
    showLegendExtra: false,
    legendMaxDepth: Infinity,
    legendPosition: common_1.Position.Right,
    flatLegend: false,
};
exports.settingsBuildProps = (0, spec_factory_1.buildSFProps)()({
    id: '__global__settings___',
    chartType: chart_types_1.ChartType.Global,
    specType: exports.SpecType.Settings,
}, {
    rendering: 'canvas',
    rotation: 0,
    animateData: true,
    resizeDebounce: 10,
    debug: false,
    pointerUpdateTrigger: exports.PointerUpdateTrigger.X,
    externalPointerEvents: {
        tooltip: {
            visible: false,
        },
    },
    baseTheme: light_theme_1.LIGHT_THEME,
    brushAxis: exports.BrushAxis.X,
    minBrushDelta: 2,
    ariaUseDefaultSummary: true,
    ariaLabelHeadingLevel: 'p',
    allowBrushingLastHistogramBin: true,
    pointBuffer: 10,
    ...exports.DEFAULT_LEGEND_CONFIG,
    locale: 'en-US',
});
exports.DEFAULT_SETTINGS_SPEC = {
    ...exports.settingsBuildProps.defaults,
    ...exports.settingsBuildProps.overrides,
};
//# sourceMappingURL=constants.js.map