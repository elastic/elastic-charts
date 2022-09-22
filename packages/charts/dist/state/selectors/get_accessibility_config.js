"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getA11ySettingsSelector = exports.DEFAULT_A11Y_SETTINGS = void 0;
var constants_1 = require("../../specs/constants");
var common_1 = require("../../utils/common");
var create_selector_1 = require("../create_selector");
var get_chart_id_1 = require("./get_chart_id");
var get_settings_spec_1 = require("./get_settings_spec");
exports.DEFAULT_A11Y_SETTINGS = {
    labelHeadingLevel: constants_1.DEFAULT_SETTINGS_SPEC.ariaLabelHeadingLevel,
};
exports.getA11ySettingsSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_chart_id_1.getChartIdSelector], function (_a, chartId) {
    var ariaDescription = _a.ariaDescription, ariaDescribedBy = _a.ariaDescribedBy, ariaLabel = _a.ariaLabel, ariaLabelledBy = _a.ariaLabelledBy, ariaUseDefaultSummary = _a.ariaUseDefaultSummary, ariaLabelHeadingLevel = _a.ariaLabelHeadingLevel, ariaTableCaption = _a.ariaTableCaption;
    var defaultSummaryId = ariaUseDefaultSummary ? "".concat(chartId, "--defaultSummary") : undefined;
    var describeBy = [ariaDescribedBy !== null && ariaDescribedBy !== void 0 ? ariaDescribedBy : (ariaDescription && "".concat(chartId, "--desc")), defaultSummaryId].filter(common_1.isDefined);
    return {
        label: ariaLabelledBy ? undefined : ariaLabel,
        labelId: ariaLabelledBy !== null && ariaLabelledBy !== void 0 ? ariaLabelledBy : (ariaLabel && "".concat(chartId, "--label")),
        labelHeadingLevel: isValidHeadingLevel(ariaLabelHeadingLevel)
            ? ariaLabelHeadingLevel
            : exports.DEFAULT_A11Y_SETTINGS.labelHeadingLevel,
        description: ariaDescribedBy ? undefined : ariaDescription,
        descriptionId: describeBy.length > 0 ? describeBy.join(' ') : undefined,
        defaultSummaryId: defaultSummaryId,
        tableCaption: ariaTableCaption,
    };
});
function isValidHeadingLevel(ariaLabelHeadingLevel) {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(ariaLabelHeadingLevel);
}
//# sourceMappingURL=get_accessibility_config.js.map