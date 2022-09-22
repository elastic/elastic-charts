"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
var predicate_1 = require("../../../../common/predicate");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var geometry_1 = require("../../../../utils/geometry");
var merge_utils_1 = require("../../../../utils/themes/merge_utils");
var axis_type_utils_1 = require("../../utils/axis_type_utils");
var common_1 = require("../utils/common");
var compute_axes_geometries_1 = require("./compute_axes_geometries");
var compute_legend_1 = require("./compute_legend");
var compute_series_geometries_1 = require("./compute_series_geometries");
var get_grid_lines_1 = require("./get_grid_lines");
var get_specs_1 = require("./get_specs");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    compute_legend_1.computeLegendSelector,
    compute_axes_geometries_1.computeAxesGeometriesSelector,
    get_grid_lines_1.getGridLinesSelector,
    get_specs_1.getAxisSpecsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_specs_1.getAnnotationSpecsSelector,
], function (_a, legend, axes, gridLines, axesSpecs, _b, annotations) {
    var geometries = _a.geometries;
    var rotation = _b.rotation;
    var seriesNameMap = getSeriesNameMap(legend);
    return {
        legend: getLegendState(legend),
        axes: getAxes(axes, axesSpecs, gridLines, rotation),
        areas: geometries.areas.map(getAreaState(seriesNameMap)),
        lines: geometries.lines.map(getLineState(seriesNameMap)),
        bars: getBarsState(seriesNameMap, geometries.bars),
        annotations: getAnnotationsState(annotations),
    };
});
function getAxes(axesGeoms, axesSpecs, gridLines, rotation) {
    return axesSpecs.reduce(function (acc, _a) {
        var position = _a.position, title = _a.title, id = _a.id;
        var geom = axesGeoms.find(function (_a) {
            var axis = _a.axis;
            return axis.id === id;
        });
        if (!geom) {
            return acc;
        }
        var isXAxis = ((0, axis_type_utils_1.isHorizontalAxis)(position) && (0, common_1.isHorizontalRotation)(rotation)) ||
            ((0, axis_type_utils_1.isVerticalAxis)(position) && (0, common_1.isVerticalRotation)(rotation));
        var sortingOrder = (0, axis_type_utils_1.isHorizontalAxis)(position)
            ? rotation === 0 || rotation === 90
                ? predicate_1.Predicate.NumAsc
                : predicate_1.Predicate.NumDesc
            : rotation === 0 || rotation === -90
                ? predicate_1.Predicate.NumDesc
                : predicate_1.Predicate.NumAsc;
        var visibleTicks = geom.visibleTicks
            .filter(function (_a) {
            var label = _a.label;
            return label !== '';
        })
            .sort((0, predicate_1.getPredicateFn)(sortingOrder, 'position'));
        var labels = visibleTicks.map(function (_a) {
            var label = _a.label;
            return label;
        });
        var values = visibleTicks.map(function (_a) {
            var value = _a.value;
            return value;
        });
        var gridlines = gridLines
            .flatMap(function (_a) {
            var _b, _c;
            var lineGroups = _a.lineGroups;
            return (_c = (_b = lineGroups.find(function (_a) {
                var axisId = _a.axisId;
                return axisId === geom.axis.id;
            })) === null || _b === void 0 ? void 0 : _b.lines) !== null && _c !== void 0 ? _c : [];
        })
            .map(function (_a) {
            var x = _a.x1, y = _a.y1;
            return ({ x: x, y: y });
        });
        acc[isXAxis ? 'x' : 'y'].push({
            id: id,
            title: title,
            position: position,
            labels: labels,
            values: values,
            gridlines: gridlines,
        });
        return acc;
    }, { x: [], y: [] });
}
function getBarsState(seriesNameMap, barGeometries) {
    var buckets = new Map();
    var bars = barGeometries.reduce(function (acc, _a) {
        var value = _a.value;
        return __spreadArray(__spreadArray([], __read(acc), false), __read(value), false);
    }, []);
    bars.forEach(function (_a) {
        var _b, _c;
        var color = _a.color, key = _a.seriesIdentifier.key, _d = _a.seriesStyle, rect = _d.rect, rectBorder = _d.rectBorder, _e = _a.value, x = _e.x, y = _e.y, mark = _e.mark, displayValue = _a.displayValue;
        var label = displayValue === null || displayValue === void 0 ? void 0 : displayValue.text;
        var name = (_b = seriesNameMap.get(key)) !== null && _b !== void 0 ? _b : '';
        var bucket = (_c = buckets.get(key)) !== null && _c !== void 0 ? _c : {
            key: key,
            name: name,
            color: color,
            bars: [],
            labels: [],
            visible: hasVisibleStyle(rect) || hasVisibleStyle(rectBorder),
        };
        bucket.bars.push({ x: x, y: y, mark: mark });
        if (label) {
            bucket.labels.push(label);
        }
        buckets.set(key, bucket);
        return buckets;
    });
    return __spreadArray([], __read(buckets.values()), false);
}
function getLineState(seriesNameMap) {
    return function (_a) {
        var _b;
        var _c = _a.value, path = _c.line, points = _c.points, color = _c.color, key = _c.seriesIdentifier.key, style = _c.style;
        var name = (_b = seriesNameMap.get(key)) !== null && _b !== void 0 ? _b : '';
        return {
            path: path,
            color: color,
            key: key,
            name: name,
            visible: hasVisibleStyle(style.line),
            visiblePoints: hasVisibleStyle(style.point),
            points: points.map(function (_a) {
                var _b = _a.value, x = _b.x, y = _b.y, mark = _b.mark;
                return ({ x: x, y: y, mark: mark });
            }),
        };
    };
}
function getAreaState(seriesNameMap) {
    return function (_a) {
        var _b;
        var _c = _a.value, path = _c.area, lines = _c.lines, points = _c.points, color = _c.color, key = _c.seriesIdentifier.key, style = _c.style;
        var _d = __read(lines, 2), y1Path = _d[0], y0Path = _d[1];
        var linePoints = points.reduce(function (acc, _a) {
            var _b = _a.value, accessor = _b.accessor, value = __rest(_b, ["accessor"]);
            if (accessor === geometry_1.BandedAccessorType.Y0) {
                acc.y0.push(value);
            }
            else {
                acc.y1.push(value);
            }
            return acc;
        }, {
            y0: [],
            y1: [],
        });
        var lineVisible = hasVisibleStyle(style.line);
        var visiblePoints = hasVisibleStyle(style.point);
        var name = (_b = seriesNameMap.get(key)) !== null && _b !== void 0 ? _b : '';
        return {
            path: path,
            color: color,
            key: key,
            name: name,
            visible: hasVisibleStyle(style.area),
            lines: {
                y0: y0Path
                    ? {
                        visible: lineVisible,
                        path: y0Path,
                        points: linePoints.y0,
                        visiblePoints: visiblePoints,
                    }
                    : undefined,
                y1: {
                    visible: lineVisible,
                    path: y1Path,
                    points: linePoints.y1,
                    visiblePoints: visiblePoints,
                },
            },
        };
    };
}
function getSeriesNameMap(legendItems) {
    return legendItems.reduce(function (acc, _a) {
        var name = _a.label, seriesIdentifiers = _a.seriesIdentifiers;
        seriesIdentifiers.forEach(function (_a) {
            var key = _a.key;
            acc.set(key, name);
        });
        return acc;
    }, new Map());
}
function getLegendState(legendItems) {
    var items = legendItems
        .filter(function (_a) {
        var isSeriesHidden = _a.isSeriesHidden;
        return !isSeriesHidden;
    })
        .flatMap(function (_a) {
        var name = _a.label, color = _a.color, seriesIdentifiers = _a.seriesIdentifiers;
        return seriesIdentifiers.map(function (_a) {
            var key = _a.key;
            return ({
                key: key,
                name: name,
                color: color,
            });
        });
    });
    return { items: items };
}
function getAnnotationsState(annotationSpecs) {
    return annotationSpecs.flatMap(function (annotation) {
        return annotation.dataValues.map(function (dataValue) { return ({
            data: dataValue,
            id: annotation.id,
            style: annotation.annotationType === specs_1.AnnotationType.Line
                ? (0, merge_utils_1.mergeWithDefaultAnnotationLine)(annotation === null || annotation === void 0 ? void 0 : annotation.style)
                : (0, merge_utils_1.mergeWithDefaultAnnotationRect)(annotation === null || annotation === void 0 ? void 0 : annotation.style),
            type: annotation.annotationType,
            domainType: annotation.annotationType === specs_1.AnnotationType.Line ? annotation.domainType : undefined,
        }); });
    });
}
function hasVisibleStyle(_a) {
    var _b = _a.visible, visible = _b === void 0 ? true : _b, _c = _a.fill, fill = _c === void 0 ? '#fff' : _c, _d = _a.stroke, stroke = _d === void 0 ? '#fff' : _d, _e = _a.strokeWidth, strokeWidth = _e === void 0 ? 1 : _e, _f = _a.opacity, opacity = _f === void 0 ? 1 : _f;
    return Boolean(visible && opacity > 0 && strokeWidth > 0 && fill && stroke);
}
//# sourceMappingURL=get_debug_state.js.map