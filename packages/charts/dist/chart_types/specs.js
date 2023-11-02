"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricTrendShape = exports.Metric = exports.Heatmap = exports.Partition = exports.RectAnnotation = exports.LineSeries = exports.LineAnnotation = exports.HistogramBarSeries = exports.BubbleSeries = exports.BarSeries = exports.Axis = exports.AreaSeries = void 0;
var specs_1 = require("./xy_chart/specs");
Object.defineProperty(exports, "AreaSeries", { enumerable: true, get: function () { return specs_1.AreaSeries; } });
Object.defineProperty(exports, "Axis", { enumerable: true, get: function () { return specs_1.Axis; } });
Object.defineProperty(exports, "BarSeries", { enumerable: true, get: function () { return specs_1.BarSeries; } });
Object.defineProperty(exports, "BubbleSeries", { enumerable: true, get: function () { return specs_1.BubbleSeries; } });
Object.defineProperty(exports, "HistogramBarSeries", { enumerable: true, get: function () { return specs_1.HistogramBarSeries; } });
Object.defineProperty(exports, "LineAnnotation", { enumerable: true, get: function () { return specs_1.LineAnnotation; } });
Object.defineProperty(exports, "LineSeries", { enumerable: true, get: function () { return specs_1.LineSeries; } });
Object.defineProperty(exports, "RectAnnotation", { enumerable: true, get: function () { return specs_1.RectAnnotation; } });
__exportStar(require("./xy_chart/utils/specs"), exports);
__exportStar(require("./wordcloud/specs"), exports);
__exportStar(require("./goal_chart/specs"), exports);
var specs_2 = require("./partition_chart/specs");
Object.defineProperty(exports, "Partition", { enumerable: true, get: function () { return specs_2.Partition; } });
var specs_3 = require("./heatmap/specs");
Object.defineProperty(exports, "Heatmap", { enumerable: true, get: function () { return specs_3.Heatmap; } });
var specs_4 = require("./metric/specs");
Object.defineProperty(exports, "Metric", { enumerable: true, get: function () { return specs_4.Metric; } });
Object.defineProperty(exports, "MetricTrendShape", { enumerable: true, get: function () { return specs_4.MetricTrendShape; } });
//# sourceMappingURL=specs.js.map