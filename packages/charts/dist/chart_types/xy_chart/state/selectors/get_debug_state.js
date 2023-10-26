"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
const compute_axes_geometries_1 = require("./compute_axes_geometries");
const compute_legend_1 = require("./compute_legend");
const compute_series_geometries_1 = require("./compute_series_geometries");
const get_grid_lines_1 = require("./get_grid_lines");
const get_specs_1 = require("./get_specs");
const predicate_1 = require("../../../../common/predicate");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const geometry_1 = require("../../../../utils/geometry");
const merge_utils_1 = require("../../../../utils/themes/merge_utils");
const axis_type_utils_1 = require("../../utils/axis_type_utils");
const common_1 = require("../utils/common");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    compute_legend_1.computeLegendSelector,
    compute_axes_geometries_1.computeAxesGeometriesSelector,
    get_grid_lines_1.getGridLinesSelector,
    get_specs_1.getAxisSpecsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_specs_1.getAnnotationSpecsSelector,
], ({ geometries }, legend, axes, gridLines, axesSpecs, { rotation, locale }, annotations) => {
    const seriesNameMap = getSeriesNameMap(legend);
    return {
        legend: getLegendState(legend),
        axes: getAxes(axes, axesSpecs, gridLines, rotation, locale),
        areas: geometries.areas.map(getAreaState(seriesNameMap)),
        lines: geometries.lines.map(getLineState(seriesNameMap)),
        bars: getBarsState(seriesNameMap, geometries.bars),
        annotations: getAnnotationsState(annotations),
    };
});
function getAxes(axesGeoms, axesSpecs, gridLines, rotation, locale) {
    return axesSpecs.reduce((acc, { position, title, id }) => {
        const geom = axesGeoms.find(({ axis }) => axis.id === id);
        if (!geom) {
            return acc;
        }
        const isXAxis = ((0, axis_type_utils_1.isHorizontalAxis)(position) && (0, common_1.isHorizontalRotation)(rotation)) ||
            ((0, axis_type_utils_1.isVerticalAxis)(position) && (0, common_1.isVerticalRotation)(rotation));
        const sortingOrder = (0, axis_type_utils_1.isHorizontalAxis)(position)
            ? rotation === 0 || rotation === 90
                ? predicate_1.Predicate.NumAsc
                : predicate_1.Predicate.NumDesc
            : rotation === 0 || rotation === -90
                ? predicate_1.Predicate.NumDesc
                : predicate_1.Predicate.NumAsc;
        const visibleTicks = geom.visibleTicks
            .filter(({ label }) => label !== '')
            .sort((0, predicate_1.getPredicateFn)(sortingOrder, locale, 'position'));
        const labels = visibleTicks.map(({ label }) => label);
        const values = visibleTicks.map(({ value }) => value);
        const gridlines = gridLines
            .flatMap(({ lineGroups }) => { var _a, _b; return (_b = (_a = lineGroups.find(({ axisId }) => axisId === geom.axis.id)) === null || _a === void 0 ? void 0 : _a.lines) !== null && _b !== void 0 ? _b : []; })
            .map(({ x1: x, y1: y }) => ({ x, y }));
        acc[isXAxis ? 'x' : 'y'].push({
            id,
            title,
            position,
            labels,
            values,
            gridlines,
        });
        return acc;
    }, { x: [], y: [] });
}
function getBarsState(seriesNameMap, barGeometries) {
    const buckets = new Map();
    const bars = barGeometries.reduce((acc, { value }) => {
        return [...acc, ...value];
    }, []);
    bars.forEach(({ color, seriesIdentifier: { key }, seriesStyle: { rect, rectBorder }, value: { x, y, mark }, displayValue, }) => {
        var _a, _b;
        const label = displayValue === null || displayValue === void 0 ? void 0 : displayValue.text;
        const name = (_a = seriesNameMap.get(key)) !== null && _a !== void 0 ? _a : '';
        const bucket = (_b = buckets.get(key)) !== null && _b !== void 0 ? _b : {
            key,
            name,
            color,
            bars: [],
            labels: [],
            visible: hasVisibleStyle(rect) || hasVisibleStyle(rectBorder),
        };
        bucket.bars.push({ x, y, mark });
        if (label) {
            bucket.labels.push(label);
        }
        buckets.set(key, bucket);
        return buckets;
    });
    return [...buckets.values()];
}
function getLineState(seriesNameMap) {
    return ({ value: { line: path, points, color, seriesIdentifier: { key }, style, }, }) => {
        var _a;
        const name = (_a = seriesNameMap.get(key)) !== null && _a !== void 0 ? _a : '';
        return {
            path,
            color,
            key,
            name,
            visible: hasVisibleStyle(style.line),
            visiblePoints: hasVisibleStyle(style.point),
            points: points.map(({ value: { x, y, mark } }) => ({ x, y, mark })),
        };
    };
}
function getAreaState(seriesNameMap) {
    return ({ value: { area: path, lines, points, color, seriesIdentifier: { key }, style, }, }) => {
        var _a;
        const [y1Path = '', y0Path] = lines;
        const linePoints = points.reduce((acc, { value: { accessor, ...value } }) => {
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
        const lineVisible = hasVisibleStyle(style.line);
        const visiblePoints = hasVisibleStyle(style.point);
        const name = (_a = seriesNameMap.get(key)) !== null && _a !== void 0 ? _a : '';
        return {
            path,
            color,
            key,
            name,
            visible: hasVisibleStyle(style.area),
            lines: {
                y0: y0Path
                    ? {
                        visible: lineVisible,
                        path: y0Path,
                        points: linePoints.y0,
                        visiblePoints,
                    }
                    : undefined,
                y1: {
                    visible: lineVisible,
                    path: y1Path,
                    points: linePoints.y1,
                    visiblePoints,
                },
            },
        };
    };
}
function getSeriesNameMap(legendItems) {
    return legendItems.reduce((acc, { label: name, seriesIdentifiers }) => {
        seriesIdentifiers.forEach(({ key }) => {
            acc.set(key, name);
        });
        return acc;
    }, new Map());
}
function getLegendState(legendItems) {
    const items = legendItems
        .filter(({ isSeriesHidden }) => !isSeriesHidden)
        .flatMap(({ label: name, color, seriesIdentifiers }) => {
        return seriesIdentifiers.map(({ key }) => ({
            key,
            name,
            color,
        }));
    });
    return { items };
}
function getAnnotationsState(annotationSpecs) {
    return annotationSpecs.flatMap((annotation) => {
        return annotation.dataValues.map((dataValue) => ({
            data: dataValue,
            id: annotation.id,
            style: annotation.annotationType === specs_1.AnnotationType.Line
                ? (0, merge_utils_1.mergeWithDefaultAnnotationLine)(annotation === null || annotation === void 0 ? void 0 : annotation.style)
                : (0, merge_utils_1.mergeWithDefaultAnnotationRect)(annotation === null || annotation === void 0 ? void 0 : annotation.style),
            type: annotation.annotationType,
            domainType: annotation.annotationType === specs_1.AnnotationType.Line ? annotation.domainType : undefined,
        }));
    });
}
function hasVisibleStyle({ visible = true, fill = '#fff', stroke = '#fff', strokeWidth = 1, opacity = 1, }) {
    return Boolean(visible && opacity > 0 && strokeWidth > 0 && fill && stroke);
}
//# sourceMappingURL=get_debug_state.js.map