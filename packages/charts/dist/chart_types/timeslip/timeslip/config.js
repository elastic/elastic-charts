"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyPanVelocityDivisor = exports.keyZoomVelocityDivisor = exports.wheelZoomVelocity = exports.wheelPanVelocity = exports.backgroundFillStyle = exports.chartTopFontSize = exports.fadeOutPixelWidth = exports.defaultMinorTickLabelFormat = exports.defaultLabelFormat = exports.localeOptions = exports.verticalCartesianAreaPad = exports.horizontalCartesianAreaPad = exports.ZERO_Y_BASE = exports.config = exports.rasterConfig = exports.timeZone = exports.drawCartesianBox = exports.HORIZONTAL_AXIS = void 0;
const time_zone_1 = require("../../../utils/time_zone");
const cached_chrono_1 = require("../../xy_chart/axes/timeslip/chrono/cached_chrono");
const multilayer_ticks_1 = require("../../xy_chart/axes/timeslip/multilayer_ticks");
exports.HORIZONTAL_AXIS = 'continuousTime';
const initialDarkMode = false;
exports.drawCartesianBox = false;
const lineThicknessSteps = [0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
const lumaSteps = [192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const smallFontSize = 12;
exports.timeZone = (0, time_zone_1.getValidatedTimeZone)((0, time_zone_1.getZoneFromSpecs)([]));
const themeLight = {
    defaultFontColor: 'black',
    subduedFontColor: '#393939',
    offHourFontColor: 'black',
    weekendFontColor: 'darkred',
    backgroundColor: { r: 255, g: 255, b: 255 },
    lumaSteps,
};
const themeDark = {
    defaultFontColor: 'white',
    subduedFontColor: 'darkgrey',
    offHourFontColor: 'white',
    weekendFontColor: 'indianred',
    backgroundColor: { r: 0, g: 0, b: 0 },
    lumaSteps: lumaSteps.map((l) => 255 - l),
};
exports.rasterConfig = {
    minimumTickPixelDistance: multilayer_ticks_1.MINIMUM_TICK_PIXEL_DISTANCE,
    locale: 'en-US',
};
exports.config = {
    darkMode: initialDarkMode,
    ...(initialDarkMode ? themeDark : themeLight),
    ...exports.rasterConfig,
    sparse: false,
    implicit: false,
    maxLabelRowCount: 2,
    a11y: {
        contrast: 'medium',
    },
    numUnit: 'short',
    barChroma: { r: 96, g: 146, b: 192 },
    barFillAlpha: 0.3,
    lineThicknessSteps,
    domainFrom: (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: exports.timeZone, year: 2002, month: 1, day: 1 })[cached_chrono_1.TimeProp.EpochSeconds],
    domainTo: (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: exports.timeZone, year: 2022, month: 1, day: 1 })[cached_chrono_1.TimeProp.EpochSeconds],
    smallFontSize,
    cssFontShorthand: `normal normal 100 ${smallFontSize}px Inter, Helvetica, Arial, sans-serif`,
    monospacedFontShorthand: `normal normal 100 ${smallFontSize}px "Roboto Mono", Consolas, Menlo, Courier, monospace`,
    rowPixelPitch: 16,
    horizontalPixelOffset: 4,
    verticalPixelOffset: 6,
    clipLeft: true,
    clipRight: true,
    yTickOverhang: 8,
    yTickGap: 8,
};
exports.ZERO_Y_BASE = true;
exports.horizontalCartesianAreaPad = [0.04, 0.04];
exports.verticalCartesianAreaPad = [0.3, 0.12];
exports.localeOptions = {
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};
const defaultLabelFormatter = new Intl.DateTimeFormat(exports.config.locale, {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: exports.timeZone,
});
const defaultLabelFormat = (value) => defaultLabelFormatter.format(value);
exports.defaultLabelFormat = defaultLabelFormat;
const defaultMinorTickLabelFormatter = new Intl.DateTimeFormat(exports.config.locale, {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: exports.timeZone,
});
const defaultMinorTickLabelFormat = (value) => defaultMinorTickLabelFormatter.format(value);
exports.defaultMinorTickLabelFormat = defaultMinorTickLabelFormat;
exports.fadeOutPixelWidth = 12;
exports.chartTopFontSize = exports.config.smallFontSize + 2;
const background = exports.config.backgroundColor;
exports.backgroundFillStyle = `rgba(${background.r},${background.g},${background.b},1)`;
exports.wheelPanVelocity = 1;
exports.wheelZoomVelocity = 2;
exports.keyZoomVelocityDivisor = 2;
exports.keyPanVelocityDivisor = 10;
//# sourceMappingURL=config.js.map