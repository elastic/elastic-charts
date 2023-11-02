"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getA11ySettingsSelector = exports.DEFAULT_A11Y_SETTINGS = void 0;
const get_chart_id_1 = require("./get_chart_id");
const get_settings_spec_1 = require("./get_settings_spec");
const constants_1 = require("../../specs/constants");
const common_1 = require("../../utils/common");
const create_selector_1 = require("../create_selector");
exports.DEFAULT_A11Y_SETTINGS = {
    labelHeadingLevel: constants_1.DEFAULT_SETTINGS_SPEC.ariaLabelHeadingLevel,
};
exports.getA11ySettingsSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_chart_id_1.getChartIdSelector], ({ ariaDescription, ariaDescribedBy, ariaLabel, ariaLabelledBy, ariaUseDefaultSummary, ariaLabelHeadingLevel, ariaTableCaption, }, chartId) => {
    const defaultSummaryId = ariaUseDefaultSummary ? `${chartId}--defaultSummary` : undefined;
    const describeBy = [ariaDescribedBy !== null && ariaDescribedBy !== void 0 ? ariaDescribedBy : (ariaDescription && `${chartId}--desc`), defaultSummaryId].filter(common_1.isDefined);
    return {
        label: ariaLabelledBy ? undefined : ariaLabel,
        labelId: ariaLabelledBy !== null && ariaLabelledBy !== void 0 ? ariaLabelledBy : (ariaLabel && `${chartId}--label`),
        labelHeadingLevel: isValidHeadingLevel(ariaLabelHeadingLevel)
            ? ariaLabelHeadingLevel
            : exports.DEFAULT_A11Y_SETTINGS.labelHeadingLevel,
        description: ariaDescribedBy ? undefined : ariaDescription,
        descriptionId: describeBy.length > 0 ? describeBy.join(' ') : undefined,
        defaultSummaryId,
        tableCaption: ariaTableCaption,
    };
});
function isValidHeadingLevel(ariaLabelHeadingLevel) {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(ariaLabelHeadingLevel);
}
//# sourceMappingURL=get_accessibility_config.js.map