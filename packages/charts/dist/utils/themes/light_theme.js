"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIGHT_THEME = exports.LIGHT_BASE_COLORS = void 0;
const colors_1 = require("./colors");
const theme_common_1 = require("./theme_common");
const colors_2 = require("../../common/colors");
const constants_1 = require("../../common/constants");
const default_theme_attributes_1 = require("../../common/default_theme_attributes");
const common_1 = require("../common");
exports.LIGHT_BASE_COLORS = {
    emptyShade: '#FFF',
    lightestShade: '#F1F4FA',
    lightShade: '#D3DAE6',
    mediumShade: '#98A2B3',
    darkShade: '#69707D',
    darkestShade: '#343741',
    title: '#1A1C21',
};
exports.LIGHT_THEME = {
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
            strokeWidth: 2,
            stroke: common_1.ColorVariant.Series,
            fill: exports.LIGHT_BASE_COLORS.emptyShade,
            radius: 3,
            opacity: 1,
        },
        isolatedPoint: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.White.keyword,
            radius: 2,
            opacity: 1,
        },
        fit: {
            line: {
                opacity: 1,
                visible: true,
                dash: [5, 5],
                stroke: common_1.ColorVariant.Series,
            },
        },
    },
    bubbleSeriesStyle: {
        point: {
            visible: true,
            strokeWidth: 1,
            fill: colors_2.Colors.White.keyword,
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
            fill: exports.LIGHT_BASE_COLORS.emptyShade,
            radius: 3,
            opacity: 1,
        },
        isolatedPoint: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.White.keyword,
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
            stroke: colors_2.Colors.Black.keyword,
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
            visible: true,
            fontSize: 12,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            padding: {
                inner: 10,
                outer: 0,
            },
            fill: exports.LIGHT_BASE_COLORS.darkestShade,
        },
        axisPanelTitle: {
            visible: true,
            fontSize: 10,
            fontFamily: 'sans-serif',
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#333',
        },
        axisLine: {
            visible: true,
            stroke: '#eaedf3',
            strokeWidth: 1,
        },
        tickLabel: {
            visible: true,
            fontSize: 10,
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fontStyle: 'normal',
            fill: '#646a77',
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
            stroke: '#eaedf3',
            strokeWidth: 1,
            size: 10,
            padding: 10,
        },
        gridLine: {
            horizontal: {
                visible: true,
                stroke: '#eaedf3',
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            vertical: {
                visible: true,
                stroke: '#eaedf3',
                strokeWidth: 1,
                opacity: 1,
                dash: [4, 4],
            },
            lumaSteps: [224, 184, 128, 96, 64, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0],
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
            fill: exports.LIGHT_BASE_COLORS.lightestShade,
        },
        line: {
            visible: true,
            stroke: exports.LIGHT_BASE_COLORS.darkShade,
            strokeWidth: 1,
            dash: [4, 4],
        },
        crossLine: {
            visible: true,
            stroke: exports.LIGHT_BASE_COLORS.darkShade,
            strokeWidth: 1,
            dash: [4, 4],
        },
    },
    background: {
        color: exports.LIGHT_BASE_COLORS.emptyShade,
        fallbackColor: exports.LIGHT_BASE_COLORS.emptyShade,
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
            fill: '#646a77',
        },
        majorLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: exports.LIGHT_BASE_COLORS.darkestShade,
        },
        minorLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: '#646a77',
        },
        majorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: exports.LIGHT_BASE_COLORS.darkestShade,
        },
        minorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
            fill: '#646a77',
        },
        targetLine: {
            stroke: exports.LIGHT_BASE_COLORS.darkestShade,
        },
        tickLine: {
            stroke: exports.LIGHT_BASE_COLORS.mediumShade,
        },
        progressLine: {
            stroke: exports.LIGHT_BASE_COLORS.darkestShade,
        },
    },
    partition: {
        outerSizeRatio: 1,
        emptySizeRatio: 0,
        fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
        minFontSize: 8,
        maxFontSize: 16,
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
            textColor: exports.LIGHT_BASE_COLORS.darkestShade,
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
        sectorLineStroke: exports.LIGHT_BASE_COLORS.emptyShade,
    },
    heatmap: {
        brushArea: {
            visible: true,
            stroke: exports.LIGHT_BASE_COLORS.darkShade,
            strokeWidth: 2,
        },
        brushMask: {
            visible: true,
            fill: '#73737380',
        },
        brushTool: {
            visible: false,
            fill: 'gray',
        },
        xAxisLabel: {
            visible: true,
            fontSize: 12,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            textColor: colors_2.Colors.Black.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
            rotation: 0,
        },
        yAxisLabel: {
            visible: true,
            width: 'auto',
            fontSize: 12,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            textColor: colors_2.Colors.Black.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        grid: {
            stroke: {
                width: 1,
                color: 'gray',
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
                fontFamily: 'Sans-Serif',
                fontStyle: 'normal',
                textColor: colors_2.Colors.Black.keyword,
                fontVariant: 'normal',
                fontWeight: 'normal',
                useGlobalMinFontSize: true,
            },
            border: {
                strokeWidth: 1,
                stroke: 'gray',
            },
        },
    },
    metric: {
        text: {
            lightColor: '#E0E5EE',
            darkColor: exports.LIGHT_BASE_COLORS.darkestShade,
        },
        border: '#EDF0F5',
        barBackground: '#EDF0F5',
        nonFiniteText: 'N/A',
        minHeight: 64,
    },
    tooltip: {
        maxWidth: 260,
        maxTableHeight: 120,
        defaultDotColor: colors_2.Colors.Black.keyword,
    },
    flamegraph: {
        navigation: {
            textColor: exports.LIGHT_BASE_COLORS.darkestShade,
            buttonTextColor: '#0061A6',
            buttonDisabledTextColor: '#A2ABBA',
            buttonBackgroundColor: '#CCE4F5',
            buttonDisabledBackgroundColor: '#D3DAE626',
        },
        scrollbarThumb: exports.LIGHT_BASE_COLORS.darkestShade,
        scrollbarTrack: exports.LIGHT_BASE_COLORS.lightShade,
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
//# sourceMappingURL=light_theme.js.map