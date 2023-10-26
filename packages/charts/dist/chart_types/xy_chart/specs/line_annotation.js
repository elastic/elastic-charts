"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineAnnotation = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
const merge_utils_1 = require("../../../utils/themes/merge_utils");
const specs_1 = require("../utils/specs");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.XYAxis,
    specType: constants_1.SpecType.Annotation,
}, {
    groupId: specs_1.DEFAULT_GLOBAL_ID,
    annotationType: specs_1.AnnotationType.Line,
    style: merge_utils_1.DEFAULT_ANNOTATION_LINE_STYLE,
    hideLines: false,
    hideTooltips: false,
    hideLinesTooltips: true,
    zIndex: 1,
});
const LineAnnotation = function (props) {
    const { defaults, overrides } = buildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.LineAnnotation = LineAnnotation;
//# sourceMappingURL=line_annotation.js.map