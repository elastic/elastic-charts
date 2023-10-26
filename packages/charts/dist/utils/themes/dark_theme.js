"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DARK_THEME = void 0;
const colors_1 = require("./colors");
const theme_common_1 = require("./theme_common");
const colors_2 = require("../../common/colors");
const constants_1 = require("../../common/constants");
const common_1 = require("../common");
exports.DARK_THEME = {
    chartPaddings: theme_common_1.DEFAULT_CHART_PADDING,
    chartMargins: theme_common_1.DEFAULT_CHART_MARGINS,
    lineSeriesStyle: {
        line: {
            visible: true,
            strokeWidth: 1,
            opacity: 1,
        },
        point: {
            visible: true,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.Black.keyword,
            radius: 2,
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
            strokeWidth: 1,
            opacity: 1,
        },
        point: {
            visible: false,
            stroke: common_1.ColorVariant.Series,
            strokeWidth: 1,
            fill: colors_2.Colors.Black.keyword,
            radius: 2,
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
            fontSize: 8,
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            padding: 0,
            fill: '#999',
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
            fontFamily: 'sans-serif',
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#D4D4D4',
            visible: true,
        },
        axisPanelTitle: {
            fontSize: 10,
            fontFamily: 'sans-serif',
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#D4D4D4',
            visible: true,
        },
        axisLine: {
            visible: true,
            stroke: '#444',
            strokeWidth: 1,
        },
        tickLabel: {
            visible: true,
            fontSize: 10,
            fontFamily: 'sans-serif',
            fontStyle: 'normal',
            fill: '#999',
            padding: 0,
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
            visible: true,
            stroke: '#444',
            strokeWidth: 1,
            size: 10,
            padding: 10,
        },
        gridLine: {
            horizontal: {
                visible: false,
                stroke: '#D3DAE6',
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            vertical: {
                visible: false,
                stroke: '#D3DAE6',
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            lumaSteps: [63, 103, 159, 191, 223, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        },
    },
    colors: {
        vizColors: colors_1.palettes.echPaletteColorBlind.colors,
        defaultVizColor: theme_common_1.DEFAULT_MISSING_COLOR,
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
            fill: '#2A2A2A',
            visible: true,
        },
        line: {
            stroke: '#999',
            strokeWidth: 1,
            visible: true,
        },
        crossLine: {
            stroke: '#999',
            strokeWidth: 1,
            dash: [5, 5],
            visible: true,
        },
    },
    background: {
        color: 'transparent',
        fallbackColor: colors_2.Colors.Black.keyword,
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
            fontFamily: 'sans-serif',
            fill: 'white',
        },
        majorLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: 'white',
        },
        minorLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: 'white',
        },
        majorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: 'white',
        },
        minorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: 'white',
        },
        targetLine: {
            stroke: 'white',
        },
        tickLine: {
            stroke: 'snow',
        },
        progressLine: {
            stroke: 'white',
        },
    },
    partition: {
        outerSizeRatio: 1 / constants_1.GOLDEN_RATIO,
        emptySizeRatio: 0,
        fontFamily: 'Sans-Serif',
        minFontSize: 8,
        maxFontSize: 64,
        idealFontSizeJump: 1.05,
        maximizeFontSize: false,
        circlePadding: 2,
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
                fontWeight: 400,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
            padding: 2,
            clipText: false,
        },
        linkLabel: {
            maximumSection: 10,
            fontFamily: 'Sans-Serif',
            fontSize: 12,
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 400,
            gap: 10,
            spacing: 2,
            horizontalStemLength: 10,
            radiusPadding: 10,
            lineWidth: 1,
            maxCount: 36,
            maxTextLength: 100,
            textColor: common_1.ColorVariant.Adaptive,
            minimumStemLength: 0,
            stemAngle: constants_1.TAU / 8,
            padding: 0,
            valueFont: {
                fontWeight: 400,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
        },
        sectorLineWidth: 1,
        sectorLineStroke: colors_2.Colors.Black.keyword,
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
            fontFamily: 'Sans-Serif',
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
            fontFamily: 'Sans-Serif',
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
                fontFamily: 'Sans-Serif',
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
            darkColor: '#343741',
        },
        border: '#343741',
        barBackground: '#343741',
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
            textColor: 'rgb(223, 229, 239)',
            buttonTextColor: 'rgb(54, 162, 239)',
            buttonDisabledTextColor: 'rgb(81, 87, 97)',
            buttonBackgroundColor: '#36a2ef33',
            buttonDisabledBackgroundColor: 'rgba(52, 55, 65, 0.15)',
        },
        scrollbarThumb: 'rgb(223, 229, 239)',
        scrollbarTrack: 'rgb(52, 55, 65)',
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