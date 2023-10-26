"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configMetadata = exports.percentFormatter = exports.defaultPartitionValueFormatter = exports.VALUE_GETTERS = exports.ratioValueGetter = exports.percentValueGetter = exports.MODEL_KEY = exports.sumValueGetter = void 0;
const config_types_1 = require("./types/config_types");
const group_by_rollup_1 = require("./utils/group_by_rollup");
const colors_1 = require("../../../common/colors");
const config_objects_1 = require("../../../common/config_objects");
const constants_1 = require("../../../common/constants");
const text_utils_1 = require("../../../common/text_utils");
const common_1 = require("../../../utils/common");
function significantDigitCount(d) {
    let n = Math.abs(parseFloat(String(d).replace('.', '')));
    if (n === 0) {
        return 0;
    }
    while (n !== 0 && n % 10 === 0) {
        n /= 10;
    }
    return Math.floor(Math.log10(n)) + 1;
}
function sumValueGetter(node) {
    return node[group_by_rollup_1.AGGREGATE_KEY];
}
exports.sumValueGetter = sumValueGetter;
exports.MODEL_KEY = 'parent';
function percentValueGetter(node) {
    return (100 * node[group_by_rollup_1.AGGREGATE_KEY]) / node[exports.MODEL_KEY][group_by_rollup_1.STATISTICS_KEY].globalAggregate;
}
exports.percentValueGetter = percentValueGetter;
function ratioValueGetter(node) {
    return node[group_by_rollup_1.AGGREGATE_KEY] / node[exports.MODEL_KEY][group_by_rollup_1.STATISTICS_KEY].globalAggregate;
}
exports.ratioValueGetter = ratioValueGetter;
exports.VALUE_GETTERS = Object.freeze({ percent: percentValueGetter, ratio: ratioValueGetter });
function defaultPartitionValueFormatter(d) {
    return Math.abs(d) >= 10000000 || Math.abs(d) < 0.001
        ? d.toExponential(Math.min(2, Math.max(0, significantDigitCount(d) - 1)))
        : d.toLocaleString(undefined, {
            maximumSignificantDigits: 4,
            maximumFractionDigits: 3,
            useGrouping: true,
        });
}
exports.defaultPartitionValueFormatter = defaultPartitionValueFormatter;
function percentFormatter(d) {
    return `${Math.round(d)}%`;
}
exports.percentFormatter = percentFormatter;
const fontSettings = {
    fontFamily: {
        dflt: 'Sans-Serif',
        type: 'string',
    },
    fontSize: { dflt: 12, min: 4, max: 32, type: 'number' },
    fontStyle: {
        dflt: 'normal',
        type: 'string',
        values: text_utils_1.FONT_STYLES,
    },
    fontVariant: {
        dflt: 'normal',
        type: 'string',
        values: text_utils_1.FONT_VARIANTS,
    },
    fontWeight: { dflt: 400, min: 100, max: 900, type: 'number' },
};
const valueFont = {
    type: 'group',
    values: {
        fontWeight: fontSettings.fontWeight,
        fontStyle: fontSettings.fontStyle,
        fontVariant: fontSettings.fontVariant,
    },
};
exports.configMetadata = {
    width: { dflt: 300, min: 0, max: 1024, type: 'number', reconfigurable: false },
    height: { dflt: 150, min: 0, max: 1024, type: 'number', reconfigurable: false },
    margin: {
        type: 'group',
        values: {
            left: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            right: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            top: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            bottom: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
        },
    },
    outerSizeRatio: new config_objects_1.Numeric({
        dflt: 1 / constants_1.GOLDEN_RATIO,
        min: 0.25,
        max: 1,
        reconfigurable: true,
        documentation: 'The diameter of the entire circle, relative to the smaller of the usable rectangular size (smaller of width/height minus the margins)',
    }),
    emptySizeRatio: new config_objects_1.Numeric({
        dflt: 0,
        min: 0,
        max: 0.8,
        reconfigurable: true,
        documentation: 'The diameter of the inner circle, relative to `outerSizeRatio`',
    }),
    clockwiseSectors: {
        dflt: true,
        type: 'boolean',
        documentation: 'Largest to smallest sectors are positioned in a clockwise order',
    },
    specialFirstInnermostSector: {
        dflt: true,
        type: 'boolean',
        documentation: 'Starts placement with the second largest slice, for the innermost pie/ring',
    },
    fontFamily: {
        dflt: 'Sans-Serif',
        type: 'string',
    },
    minFontSize: { dflt: 8, min: 0.1, max: 8, type: 'number', reconfigurable: true },
    maxFontSize: { dflt: 64, min: 0.1, max: 64, type: 'number' },
    idealFontSizeJump: {
        dflt: 1.05,
        min: 1.05,
        max: constants_1.GOLDEN_RATIO,
        type: 'number',
        reconfigurable: false,
    },
    maximizeFontSize: {
        dflt: false,
        type: 'boolean',
    },
    partitionLayout: {
        dflt: config_types_1.PartitionLayout.sunburst,
        type: 'string',
        values: Object.keys(config_types_1.PartitionLayout),
    },
    drilldown: {
        dflt: false,
        type: 'boolean',
    },
    circlePadding: { dflt: 2, min: 0.0, max: 8, type: 'number' },
    radialPadding: { dflt: constants_1.TAU / 360, min: 0, max: 0.035, type: 'number' },
    horizontalTextAngleThreshold: { dflt: constants_1.TAU / 12, min: 0, max: constants_1.TAU, type: 'number' },
    horizontalTextEnforcer: { dflt: 1, min: 0, max: 1, type: 'number' },
    maxRowCount: { dflt: 12, min: 1, max: 16, type: 'number' },
    fillOutside: { dflt: false, type: 'boolean' },
    radiusOutside: { dflt: 128, min: 0, max: 1024, type: 'number' },
    fillRectangleWidth: { dflt: Infinity, reconfigurable: false, type: 'number' },
    fillRectangleHeight: { dflt: Infinity, reconfigurable: false, type: 'number' },
    fillLabel: {
        type: 'group',
        values: {
            textColor: { type: 'color', dflt: common_1.ColorVariant.Adaptive },
            ...fontSettings,
            valueGetter: {
                dflt: sumValueGetter,
                type: 'function',
            },
            valueFormatter: {
                dflt: defaultPartitionValueFormatter,
                type: 'function',
            },
            valueFont,
            padding: {
                type: 'group',
                values: {
                    top: {
                        dflt: 2,
                        min: 0,
                        max: 20,
                        type: 'number',
                        reconfigurable: true,
                        documentation: 'Top padding for fill text',
                    },
                    bottom: {
                        dflt: 2,
                        min: 0,
                        max: 20,
                        type: 'number',
                        reconfigurable: true,
                        documentation: 'Bottom padding for fill text',
                    },
                    left: {
                        dflt: 2,
                        min: 0,
                        max: 20,
                        type: 'number',
                        reconfigurable: true,
                        documentation: 'Left padding for fill text',
                    },
                    right: {
                        dflt: 2,
                        min: 0,
                        max: 20,
                        type: 'number',
                        reconfigurable: true,
                        documentation: 'Right padding for fill text',
                    },
                },
            },
            clipText: {
                type: 'boolean',
                dflt: false,
                documentation: "Renders, but clips, text that's longer than what would fit in a box entirely",
            },
        },
    },
    linkLabel: {
        type: 'group',
        values: {
            maximumSection: {
                dflt: 10,
                min: 0,
                max: 10000,
                type: 'number',
                reconfigurable: true,
                documentation: 'Uses linked labels below this limit of the outer sector arc length (in pixels)',
            },
            ...fontSettings,
            gap: { dflt: 10, min: 6, max: 16, type: 'number' },
            spacing: { dflt: 2, min: 0, max: 16, type: 'number' },
            horizontalStemLength: { dflt: 10, min: 6, max: 16, type: 'number' },
            radiusPadding: { dflt: 10, min: 6, max: 16, type: 'number' },
            lineWidth: { dflt: 1, min: 0.1, max: 2, type: 'number' },
            maxCount: {
                dflt: 36,
                min: 2,
                max: 64,
                type: 'number',
                documentation: 'Limits the total count of linked labels. The first N largest slices are kept.',
            },
            maxTextLength: {
                dflt: 100,
                min: 2,
                max: 200,
                documentation: 'Limits the total number of characters in linked labels.',
            },
            textColor: { dflt: common_1.ColorVariant.Adaptive, type: 'color' },
            minimumStemLength: {
                dflt: 0,
                min: 0,
                max: 16,
                type: 'number',
                reconfigurable: false,
            },
            stemAngle: {
                dflt: constants_1.TAU / 8,
                min: 0,
                max: constants_1.TAU,
                type: 'number',
                reconfigurable: false,
            },
            valueFont,
        },
    },
    backgroundColor: { dflt: colors_1.Colors.White.keyword, type: 'color' },
    sectorLineWidth: { dflt: 1, min: 0, max: 4, type: 'number' },
    sectorLineStroke: { dflt: colors_1.Colors.White.keyword, type: 'string' },
    animation: { type: 'group', values: { duration: { dflt: 0, min: 0, max: 3000, type: 'number' } } },
};
//# sourceMappingURL=config.js.map