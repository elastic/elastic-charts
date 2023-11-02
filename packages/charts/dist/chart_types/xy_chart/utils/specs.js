"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAreaSeriesSpec = exports.isLineSeriesSpec = exports.isBubbleSeriesSpec = exports.isBarSeriesSpec = exports.isRectAnnotation = exports.isLineAnnotation = exports.AnnotationAnimationTrigger = exports.AnnotationDomainType = exports.AnnotationType = exports.HistogramModeAlignments = exports.LabelOverflowConstraint = exports.DomainPaddingUnit = exports.Fit = exports.DEFAULT_GLOBAL_ID = exports.StackMode = exports.SeriesType = void 0;
exports.SeriesType = Object.freeze({
    Area: 'area',
    Bar: 'bar',
    Line: 'line',
    Bubble: 'bubble',
});
exports.StackMode = Object.freeze({
    Percentage: 'percentage',
    Wiggle: 'wiggle',
    Silhouette: 'silhouette',
});
exports.DEFAULT_GLOBAL_ID = '__global__';
exports.Fit = Object.freeze({
    None: 'none',
    Carry: 'carry',
    Lookahead: 'lookahead',
    Nearest: 'nearest',
    Average: 'average',
    Linear: 'linear',
    Zero: 'zero',
    Explicit: 'explicit',
});
exports.DomainPaddingUnit = Object.freeze({
    Domain: 'domain',
    Pixel: 'pixel',
    DomainRatio: 'domainRatio',
});
exports.LabelOverflowConstraint = Object.freeze({
    BarGeometry: 'barGeometry',
    ChartEdges: 'chartEdges',
});
exports.HistogramModeAlignments = Object.freeze({
    Start: 'start',
    Center: 'center',
    End: 'end',
});
exports.AnnotationType = Object.freeze({
    Line: 'line',
    Rectangle: 'rectangle',
    Text: 'text',
});
exports.AnnotationDomainType = Object.freeze({
    XDomain: 'xDomain',
    YDomain: 'yDomain',
});
exports.AnnotationAnimationTrigger = Object.freeze({
    FadeOnFocusingOthers: 'FadeOnFocusingOthers',
});
function isLineAnnotation(spec) {
    return spec.annotationType === exports.AnnotationType.Line;
}
exports.isLineAnnotation = isLineAnnotation;
function isRectAnnotation(spec) {
    return spec.annotationType === exports.AnnotationType.Rectangle;
}
exports.isRectAnnotation = isRectAnnotation;
function isBarSeriesSpec(spec) {
    return spec.seriesType === exports.SeriesType.Bar;
}
exports.isBarSeriesSpec = isBarSeriesSpec;
function isBubbleSeriesSpec(spec) {
    return spec.seriesType === exports.SeriesType.Bubble;
}
exports.isBubbleSeriesSpec = isBubbleSeriesSpec;
function isLineSeriesSpec(spec) {
    return spec.seriesType === exports.SeriesType.Line;
}
exports.isLineSeriesSpec = isLineSeriesSpec;
function isAreaSeriesSpec(spec) {
    return spec.seriesType === exports.SeriesType.Area;
}
exports.isAreaSeriesSpec = isAreaSeriesSpec;
//# sourceMappingURL=specs.js.map