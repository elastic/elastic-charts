"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecDomainGroupId = exports.getAxesSpecForSpecId = exports.getSpecsById = void 0;
const specs_1 = require("../../../../specs");
const axis_utils_1 = require("../../utils/axis_utils");
function getSpecsById(specs, id) {
    return specs.find((spec) => spec.id === id);
}
exports.getSpecsById = getSpecsById;
function getAxesSpecForSpecId(axesSpecs, groupId, chartRotation = 0) {
    return axesSpecs.reduce((result, spec) => {
        if (spec.groupId === groupId && (0, axis_utils_1.isXDomain)(spec.position, chartRotation))
            result.xAxis = spec;
        else if (spec.groupId === groupId && !(0, axis_utils_1.isXDomain)(spec.position, chartRotation))
            result.yAxis = spec;
        return result;
    }, {});
}
exports.getAxesSpecForSpecId = getAxesSpecForSpecId;
function getSpecDomainGroupId(spec) {
    if (!spec.useDefaultGroupDomain) {
        return spec.groupId;
    }
    return typeof spec.useDefaultGroupDomain === 'boolean' ? specs_1.DEFAULT_GLOBAL_ID : spec.useDefaultGroupDomain;
}
exports.getSpecDomainGroupId = getSpecDomainGroupId;
//# sourceMappingURL=spec.js.map