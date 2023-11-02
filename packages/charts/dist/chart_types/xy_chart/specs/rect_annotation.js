"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RectAnnotation = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const merge_utils_1 = require("../../../utils/themes/merge_utils");
const specs_1 = require("../utils/specs");
exports.RectAnnotation = (0, spec_factory_1.specComponentFactory)()({
    chartType: __1.ChartType.XYAxis,
    specType: constants_1.SpecType.Annotation,
}, {
    groupId: specs_1.DEFAULT_GLOBAL_ID,
    annotationType: specs_1.AnnotationType.Rectangle,
    zIndex: -1,
    style: merge_utils_1.DEFAULT_ANNOTATION_RECT_STYLE,
    outside: false,
});
//# sourceMappingURL=rect_annotation.js.map