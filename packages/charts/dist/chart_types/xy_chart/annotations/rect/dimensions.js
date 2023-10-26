"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationRectPropsId = exports.computeRectAnnotationDimensions = exports.isWithinRectBounds = void 0;
const panel_utils_1 = require("../../../../common/panel_utils");
const types_1 = require("../../../../scales/types");
const common_1 = require("../../../../utils/common");
const common_2 = require("../../state/utils/common");
const spec_1 = require("../../state/utils/spec");
function isWithinRectBounds({ x, y }, { startX, endX, startY, endY }) {
    const withinXBounds = x >= startX && x <= endX;
    const withinYBounds = y >= startY && y <= endY;
    return withinXBounds && withinYBounds;
}
exports.isWithinRectBounds = isWithinRectBounds;
function computeRectAnnotationDimensions(annotationSpec, yScales, xScale, axesSpecs, smallMultiplesScales, chartRotation, getAxisStyle, isHistogram = false) {
    const { dataValues, groupId, outside, id: annotationSpecId } = annotationSpec;
    const { xAxis, yAxis } = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, groupId);
    const yScale = yScales.get(groupId);
    const rectsProps = [];
    const panelSize = (0, panel_utils_1.getPanelSize)(smallMultiplesScales);
    dataValues.forEach((datum) => {
        var _a, _b, _c, _d;
        const { x0: initialX0, x1: initialX1, y0: initialY0, y1: initialY1 } = datum.coordinates;
        if (initialX0 === null && initialX1 === null && initialY0 === null && initialY1 === null) {
            return;
        }
        let height;
        const [x0, x1] = limitValueToDomainRange(xScale, initialX0, initialX1, isHistogram);
        if (x0 === null || x1 === null) {
            return;
        }
        let xAndWidth = null;
        if ((0, types_1.isBandScale)(xScale)) {
            xAndWidth = scaleXonBandScale(xScale, x0, x1);
        }
        else if ((0, types_1.isContinuousScale)(xScale)) {
            xAndWidth = scaleXonContinuousScale(xScale, x0, x1, isHistogram);
        }
        if (!xAndWidth) {
            return;
        }
        if (!yScale) {
            if (!(0, common_1.isDefined)(initialY0) && !(0, common_1.isDefined)(initialY1)) {
                const isLeftSide = (chartRotation === 0 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Bottom) ||
                    (chartRotation === 180 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Top) ||
                    (chartRotation === -90 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Right) ||
                    (chartRotation === 90 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Left);
                const orthoDimension = (0, common_2.isHorizontalRotation)(chartRotation) ? panelSize.height : panelSize.width;
                const outsideDim = (_a = annotationSpec.outsideDimension) !== null && _a !== void 0 ? _a : getOutsideDimension(getAxisStyle((_b = xAxis === null || xAxis === void 0 ? void 0 : xAxis.id) !== null && _b !== void 0 ? _b : yAxis === null || yAxis === void 0 ? void 0 : yAxis.id));
                const rectDimensions = {
                    ...xAndWidth,
                    ...(outside
                        ? {
                            y: isLeftSide ? orthoDimension : -outsideDim,
                            height: outsideDim,
                        }
                        : {
                            y: 0,
                            height: orthoDimension,
                        }),
                };
                rectsProps.push({
                    specId: annotationSpecId,
                    rect: rectDimensions,
                    datum,
                });
            }
            return;
        }
        const [y0, y1] = limitValueToDomainRange(yScale, initialY0, initialY1);
        if (!Number.isFinite(y0) || !Number.isFinite(y1))
            return;
        let scaledY1 = yScale.pureScale(y1);
        const scaledY0 = yScale.pureScale(y0);
        if (Number.isNaN(scaledY1) || Number.isNaN(scaledY0))
            return;
        height = Math.abs(scaledY0 - scaledY1);
        if (height === 0 && yScale.domain.length === 2 && yScale.domain[0] === yScale.domain[1]) {
            height = panelSize.height;
            scaledY1 = 0;
        }
        const orthoDimension = (0, common_2.isVerticalRotation)(chartRotation) ? panelSize.height : panelSize.width;
        const isLeftSide = (chartRotation === 0 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Left) ||
            (chartRotation === 180 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Right) ||
            (chartRotation === -90 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Bottom) ||
            (chartRotation === 90 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Top);
        const outsideDim = (_c = annotationSpec.outsideDimension) !== null && _c !== void 0 ? _c : getOutsideDimension(getAxisStyle((_d = xAxis === null || xAxis === void 0 ? void 0 : xAxis.id) !== null && _d !== void 0 ? _d : yAxis === null || yAxis === void 0 ? void 0 : yAxis.id));
        const rectDimensions = {
            ...(!(0, common_1.isDefined)(initialX0) && !(0, common_1.isDefined)(initialX1) && outside
                ? {
                    x: isLeftSide ? -outsideDim : orthoDimension,
                    width: outsideDim,
                }
                : xAndWidth),
            y: scaledY1,
            height,
        };
        rectsProps.push({
            specId: annotationSpecId,
            rect: rectDimensions,
            datum,
        });
    });
    return rectsProps.reduce((acc, props, i) => {
        const duplicated = [];
        smallMultiplesScales.vertical.domain.forEach((vDomainValue) => {
            smallMultiplesScales.horizontal.domain.forEach((hDomainValue) => {
                const id = getAnnotationRectPropsId(annotationSpecId, props.datum, i, vDomainValue, hDomainValue);
                const top = smallMultiplesScales.vertical.scale(vDomainValue);
                const left = smallMultiplesScales.horizontal.scale(hDomainValue);
                if (Number.isNaN(top + left))
                    return;
                const panel = { ...panelSize, top, left };
                duplicated.push({ ...props, panel, id });
            });
        });
        return [...acc, ...duplicated];
    }, []);
}
exports.computeRectAnnotationDimensions = computeRectAnnotationDimensions;
function scaleXonBandScale(xScale, x0, x1) {
    const padding = (xScale.step - xScale.originalBandwidth) / 2;
    let scaledX1 = xScale.scale(x1);
    let scaledX0 = xScale.scale(x0);
    if (Number.isNaN(scaledX1 + scaledX0)) {
        return null;
    }
    scaledX1 += xScale.originalBandwidth + padding;
    if (scaledX1 > xScale.range[1]) {
        scaledX1 = xScale.range[1];
    }
    scaledX0 -= padding;
    if (scaledX0 < xScale.range[0]) {
        scaledX0 = xScale.range[0];
    }
    const width = Math.abs(scaledX1 - scaledX0);
    return {
        x: scaledX0,
        width,
    };
}
function scaleXonContinuousScale(xScale, x0, x1, isHistogramModeEnabled = false) {
    if (typeof x1 !== 'number' || typeof x0 !== 'number') {
        return null;
    }
    const scaledX0 = xScale.scale(x0);
    const scaledX1 = xScale.totalBarsInCluster > 0 && !isHistogramModeEnabled ? xScale.scale(x1 + xScale.minInterval) : xScale.scale(x1);
    const width = Math.abs(scaledX1 - scaledX0);
    return Number.isNaN(width)
        ? null
        : { width, x: scaledX0 - (xScale.bandwidthPadding / 2) * xScale.totalBarsInCluster };
}
function limitValueToDomainRange(scale, minValue, maxValue, isHistogram = false) {
    if ((0, types_1.isContinuousScale)(scale)) {
        const [domainStartValue, domainEndValue] = scale.domain;
        const min = maxOf(domainStartValue, minValue);
        const max = minOf(isHistogram ? domainEndValue + scale.minInterval : domainEndValue, maxValue);
        return min !== null && max !== null && min > max ? [null, null] : [min, max];
    }
    else {
        const min = (0, common_1.isNil)(minValue) || !scale.domain.includes(minValue) ? scale.domain[0] : minValue;
        const max = (0, common_1.isNil)(maxValue) || !scale.domain.includes(maxValue) ? scale.domain.at(-1) : maxValue;
        return [min !== null && min !== void 0 ? min : null, max !== null && max !== void 0 ? max : null];
    }
}
function minOf(base, value) {
    return typeof value === 'number' ? Math.min(value, base) : typeof value === 'string' ? value : base;
}
function maxOf(base, value) {
    return typeof value === 'number' ? Math.max(value, base) : typeof value === 'string' ? value : base;
}
function getOutsideDimension({ tickLine: { visible, size } }) {
    return visible ? size : 0;
}
function getAnnotationRectPropsId(specId, datum, index, verticalValue, horizontalValue) {
    return [specId, verticalValue, horizontalValue, ...Object.values(datum.coordinates), datum.details, index].join('__');
}
exports.getAnnotationRectPropsId = getAnnotationRectPropsId;
//# sourceMappingURL=dimensions.js.map