"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitFunction = exports.parseConfig = exports.getValue = void 0;
const specs_1 = require("./specs");
const stacked_series_utils_1 = require("./stacked_series_utils");
const constants_1 = require("../../../scales/constants");
const common_1 = require("../../../utils/common");
const getXYValues = ({ x, y1, fittingIndex }) => [
    typeof x === 'string' ? fittingIndex : x,
    y1,
];
const getValue = (current, currentIndex, previous, next, type, endValue) => {
    if (previous !== null && type === specs_1.Fit.Carry) {
        const { y1 } = previous;
        return {
            ...current,
            y1,
            filled: {
                ...current.filled,
                y1,
            },
        };
    }
    if (next !== null && type === specs_1.Fit.Lookahead) {
        const { y1 } = next;
        return {
            ...current,
            y1,
            filled: {
                ...current.filled,
                y1,
            },
        };
    }
    if (previous !== null && next !== null) {
        if (type === specs_1.Fit.Average) {
            const y1 = (previous.y1 + next.y1) / 2;
            return {
                ...current,
                y1,
                filled: {
                    ...current.filled,
                    y1,
                },
            };
        }
        if (current.x !== null && previous.x !== null && next.x !== null) {
            const [x1, y1] = getXYValues(previous);
            const [x2, y2] = getXYValues(next);
            const currentX = typeof current.x === 'string' ? currentIndex : current.x;
            if (type === specs_1.Fit.Nearest) {
                const x1Delta = Math.abs(currentX - x1);
                const x2Delta = Math.abs(currentX - x2);
                const y1Delta = x1Delta > x2Delta ? y2 : y1;
                return {
                    ...current,
                    y1: y1Delta,
                    filled: {
                        ...current.filled,
                        y1: y1Delta,
                    },
                };
            }
            if (type === specs_1.Fit.Linear) {
                const linearInterpolatedY1 = previous.y1 + (currentX - x1) * ((y2 - y1) / (x2 - x1));
                return {
                    ...current,
                    y1: linearInterpolatedY1,
                    filled: {
                        ...current.filled,
                        y1: linearInterpolatedY1,
                    },
                };
            }
        }
    }
    else if ((previous !== null || next !== null) && (type === specs_1.Fit.Nearest || endValue === 'nearest')) {
        const nearestY1 = previous !== null ? previous.y1 : next.y1;
        return {
            ...current,
            y1: nearestY1,
            filled: {
                ...current.filled,
                y1: nearestY1,
            },
        };
    }
    if (endValue === undefined || typeof endValue === 'string') {
        return current;
    }
    return {
        ...current,
        y1: endValue,
        filled: {
            ...current.filled,
            y1: endValue,
        },
    };
};
exports.getValue = getValue;
const parseConfig = (config) => {
    if (!config) {
        return {
            type: specs_1.Fit.None,
        };
    }
    if (typeof config === 'string') {
        return {
            type: config,
        };
    }
    if (config.type === specs_1.Fit.Explicit && config.value === undefined) {
        return {
            type: specs_1.Fit.None,
        };
    }
    return {
        type: config.type,
        value: config.type === specs_1.Fit.Explicit ? config.value : undefined,
        endValue: config.endValue,
    };
};
exports.parseConfig = parseConfig;
const fitFunction = (data, fitConfig, xScaleType, sorted = false) => {
    const { type, value, endValue } = (0, exports.parseConfig)(fitConfig);
    if (type === specs_1.Fit.None) {
        return data;
    }
    if (type === specs_1.Fit.Zero) {
        return data.map((datum) => ({
            ...datum,
            y1: datum.y1 === null ? 0 : datum.y1,
            filled: {
                ...datum.filled,
                y1: datum.y1 === null ? 0 : undefined,
            },
        }));
    }
    if (type === specs_1.Fit.Explicit) {
        if (value === undefined) {
            return data;
        }
        return data.map((datum) => ({
            ...datum,
            y1: datum.y1 === null ? value : datum.y1,
            filled: {
                ...datum.filled,
                y1: datum.y1 === null ? value : undefined,
            },
        }));
    }
    const sortedData = sorted || xScaleType === constants_1.ScaleType.Ordinal ? data : data.slice().sort((0, stacked_series_utils_1.datumXSortPredicate)(xScaleType));
    const newData = [];
    let previousNonNullDatum = null;
    let nextNonNullDatum = null;
    sortedData.forEach((currentValue, i) => {
        let j = i;
        if (currentValue.y1 === null &&
            nextNonNullDatum === null &&
            (type === specs_1.Fit.Lookahead ||
                type === specs_1.Fit.Nearest ||
                type === specs_1.Fit.Average ||
                type === specs_1.Fit.Linear ||
                endValue === 'nearest')) {
            for (j = i + 1; j < sortedData.length; j++) {
                const nextValue = sortedData[j];
                if ((0, common_1.isNil)(nextValue))
                    continue;
                if (nextValue.y1 !== null && nextValue.x !== null) {
                    nextNonNullDatum = {
                        ...nextValue,
                        fittingIndex: j,
                    };
                    break;
                }
            }
        }
        const newValue = currentValue.y1 === null
            ? (0, exports.getValue)(currentValue, i, previousNonNullDatum, nextNonNullDatum, type, endValue)
            : currentValue;
        newData[i] = newValue;
        if (currentValue.y1 !== null && currentValue.x !== null) {
            previousNonNullDatum = {
                ...currentValue,
                fittingIndex: i,
            };
        }
        if (nextNonNullDatum !== null && nextNonNullDatum.x <= currentValue.x) {
            nextNonNullDatum = null;
        }
    });
    return newData;
};
exports.fitFunction = fitFunction;
//# sourceMappingURL=fit_function.js.map