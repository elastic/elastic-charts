"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DARK_THEME = exports.DARK_BASE_COLORS = void 0;
const colors_1 = require("./colors");
const theme_common_1 = require("./theme_common");
const colors_2 = require("../../common/colors");
const constants_1 = require("../../common/constants");
const default_theme_attributes_1 = require("../../common/default_theme_attributes");
const common_1 = require("../common");
exports.DARK_BASE_COLORS = {
    emptyShade: '#1D1E24',
    lightestShade: '#25262E',
    lightShade: '#343741',
    mediumShade: '#535966',
    darkShade: '#98A2B3',
    darkestShade: '#D4DAE5',
    title: '#DFE5EF',
};
exports.DARK_THEME = {
    chartPaddings: theme_common_1.DEFAULT_CHART_PADDING,
    chartMargins: theme_common_1.DEFAULT_CHART_MARGINS,
    lineSeriesStyle: {
        line: {
            visible: true,
            strokeWidth: 2,
            opacity: 1,
        },
        point: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 2,
            fill: exports.DARK_BASE_COLORS.emptyShade,
            radius: 3,
            opacity: 1,
        },
        isolatedPoint: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.Black.keyword,
            radius: 2,
            opacity: 1,
        },
        fit: {
            line: {
                visible: true,
                dash: [5, 5],
                stroke: common_1.ColorVariant.Series,
                opacity: 1,
            },
        },
    },
    bubbleSeriesStyle: {
        point: {
            visible: true,
            strokeWidth: 1,
            fill: colors_2.Colors.Black.keyword,
            radius: 2,
            opacity: 1,
        },
    },
    areaSeriesStyle: {
        area: {
            visible: true,
            opacity: 0.3,
        },
        line: {
            visible: true,
            strokeWidth: 2,
            opacity: 1,
        },
        point: {
            visible: false,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 2,
            fill: exports.DARK_BASE_COLORS.emptyShade,
            radius: 3,
            opacity: 1,
        },
        isolatedPoint: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.Black.keyword,
            radius: 2,
            opacity: 1,
        },
        fit: {
            line: {
                visible: true,
                dash: [5, 5],
                stroke: common_1.ColorVariant.Series,
                opacity: 1,
            },
            area: {
                visible: true,
                opacity: 0.15,
                fill: common_1.ColorVariant.Series,
            },
        },
    },
    barSeriesStyle: {
        rect: {
            opacity: 1,
        },
        rectBorder: {
            visible: false,
            strokeWidth: 1,
        },
        displayValue: {
            fontSize: 10,
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            alignment: { horizontal: 'center', vertical: 'middle' },
            padding: 0,
            fill: { textBorder: 0 },
            offsetX: 0,
            offsetY: 0,
        },
    },
    arcSeriesStyle: {
        arc: {
            visible: true,
            stroke: 'white',
            strokeWidth: 1,
            opacity: 1,
        },
    },
    sharedStyle: theme_common_1.DEFAULT_GEOMETRY_STYLES,
    scales: {
        barsPadding: 0.25,
        histogramPadding: 0.05,
    },
    axes: {
        axisTitle: {
            fontSize: 12,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            padding: {
                inner: 10,
                outer: 0,
            },
            fill: exports.DARK_BASE_COLORS.title,
            visible: true,
        },
        axisPanelTitle: {
            fontSize: 10,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#D4D4D4',
            visible: true,
        },
        axisLine: {
            visible: true,
            stroke: exports.DARK_BASE_COLORS.lightShade,
            strokeWidth: 1,
        },
        tickLabel: {
            visible: true,
            fontSize: 10,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fontStyle: 'normal',
            fill: '#81858f',
            padding: { outer: 8, inner: 10 },
            rotation: 0,
            offset: {
                x: 0,
                y: 0,
                reference: 'local',
            },
            alignment: {
                vertical: 'near',
                horizontal: 'near',
            },
        },
        tickLine: {
            visible: false,
            stroke: exports.DARK_BASE_COLORS.lightShade,
            strokeWidth: 1,
            size: 10,
            padding: 10,
        },
        gridLine: {
            horizontal: {
                visible: true,
                stroke: exports.DARK_BASE_COLORS.lightShade,
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            vertical: {
                visible: true,
                stroke: exports.DARK_BASE_COLORS.lightShade,
                strokeWidth: 1,
                opacity: 1,
                dash: [4, 4],
            },
            lumaSteps: [63, 103, 159, 191, 223, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        },
    },
    colors: {
        vizColors: colors_1.palettes.echPaletteColorBlind.colors,
        defaultVizColor: '#6092C0',
    },
    legend: {
        verticalWidth: 200,
        horizontalHeight: 64,
        spacingBuffer: 10,
        margin: 0,
        labelOptions: {
            maxLines: 1,
        },
    },
    crosshair: {
        band: {
            visible: true,
            fill: '#2a2b33',
        },
        line: {
            visible: true,
            stroke: exports.DARK_BASE_COLORS.darkShade,
            strokeWidth: 1,
            dash: [4, 4],
        },
        crossLine: {
            visible: true,
            stroke: exports.DARK_BASE_COLORS.darkShade,
            strokeWidth: 1,
            dash: [4, 4],
        },
    },
    background: {
        color: exports.DARK_BASE_COLORS.emptyShade,
        fallbackColor: exports.DARK_BASE_COLORS.emptyShade,
    },
    goal: {
        minFontSize: 8,
        maxFontSize: 64,
        maxCircularSize: 360,
        maxBulletSize: 500,
        barThicknessMinSizeRatio: 1 / 10,
        baselineArcThickness: 32,
        baselineBarThickness: 32,
        marginRatio: 0.05,
        maxTickFontSize: 24,
        maxLabelFontSize: 32,
        maxCentralFontSize: 38,
        arcBoxSamplePitch: (5 / 360) * constants_1.TAU,
        capturePad: 16,
        tickLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: '#81858f',
        },
        majorLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: exports.DARK_BASE_COLORS.title,
        },
        minorLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: '#81858f',
        },
        majorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: exports.DARK_BASE_COLORS.title,
        },
        minorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: '#81858f',
        },
        targetLine: {
            stroke: '#D4DAE5',
        },
        tickLine: {
            stroke: exports.DARK_BASE_COLORS.mediumShade,
        },
        progressLine: {
            stroke: '#D4DAE5',
        },
    },
    partition: {
        outerSizeRatio: 1,
        emptySizeRatio: 0,
        fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
        minFontSize: 8,
        maxFontSize: 64,
        idealFontSizeJump: 1.05,
        maximizeFontSize: false,
        circlePadding: 4,
        radialPadding: constants_1.TAU / 360,
        horizontalTextAngleThreshold: constants_1.TAU / 12,
        horizontalTextEnforcer: 1,
        fillLabel: {
            textColor: common_1.ColorVariant.Adaptive,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 400,
            valueFont: {
                fontWeight: 700,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
            padding: 2,
            clipText: false,
        },
        linkLabel: {
            maximumSection: 10,
            fontFamily: 'Sans-Serif',
            fontSize: 11,
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 400,
            gap: 10,
            spacing: 2,
            horizontalStemLength: 10,
            radiusPadding: 10,
            lineWidth: 1,
            maxCount: 5,
            maxTextLength: 100,
            textColor: exports.DARK_BASE_COLORS.title,
            minimumStemLength: 0,
            stemAngle: constants_1.TAU / 8,
            padding: 0,
            valueFont: {
                fontWeight: 400,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
        },
        sectorLineWidth: 1.5,
        sectorLineStroke: exports.DARK_BASE_COLORS.emptyShade,
    },
    heatmap: {
        brushArea: {
            visible: true,
            stroke: '#D3DAE6',
            strokeWidth: 2,
        },
        brushMask: {
            visible: true,
            fill: '#8c8c8c80',
        },
        brushTool: {
            visible: false,
            fill: 'snow',
        },
        xAxisLabel: {
            visible: true,
            fontSize: 12,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fontStyle: 'normal',
            textColor: colors_2.Colors.White.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
            rotation: 0,
        },
        yAxisLabel: {
            visible: true,
            width: 'auto',
            fontSize: 12,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fontStyle: 'normal',
            textColor: colors_2.Colors.White.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        grid: {
            stroke: {
                width: 1,
                color: 'snow',
            },
        },
        cell: {
            maxWidth: 'fill',
            maxHeight: 'fill',
            align: 'center',
            label: {
                visible: true,
                maxWidth: 'fill',
                minFontSize: 8,
                maxFontSize: 12,
                fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
                fontStyle: 'normal',
                textColor: colors_2.Colors.White.keyword,
                fontVariant: 'normal',
                fontWeight: 'normal',
                useGlobalMinFontSize: true,
            },
            border: {
                strokeWidth: 1,
                stroke: 'snow',
            },
        },
    },
    metric: {
        text: {
            lightColor: '#E0E5EE',
            darkColor: exports.DARK_BASE_COLORS.lightShade,
        },
        border: exports.DARK_BASE_COLORS.lightShade,
        barBackground: exports.DARK_BASE_COLORS.lightShade,
        nonFiniteText: 'N/A',
        minHeight: 64,
    },
    tooltip: {
        maxWidth: 260,
        maxTableHeight: 120,
        defaultDotColor: colors_2.Colors.White.keyword,
    },
    flamegraph: {
        navigation: {
            textColor: exports.DARK_BASE_COLORS.title,
            buttonTextColor: '#36A2EF',
            buttonDisabledTextColor: '#515761',
            buttonBackgroundColor: '#36A2EF33',
            buttonDisabledBackgroundColor: '#34374126',
        },
        scrollbarThumb: exports.DARK_BASE_COLORS.title,
        scrollbarTrack: exports.DARK_BASE_COLORS.lightShade,
    },
    highlighter: {
        point: {
            opacity: 1,
            fill: common_1.ColorVariant.None,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 4,
            radius: 10,
        },
    },
};
//# sourceMappingURL=dark_theme.js.map