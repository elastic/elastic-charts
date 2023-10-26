"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeYCustomDomainsByGroupId = void 0;
const axis_utils_1 = require("../../utils/axis_utils");
function mergeYCustomDomainsByGroupId(axesSpecs, chartRotation) {
    const domainsByGroupId = new Map();
    axesSpecs.forEach((spec) => {
        const { id, groupId, domain } = spec;
        if (!domain)
            return;
        if ((0, axis_utils_1.isXDomain)(spec.position, chartRotation)) {
            throw new Error(`[Axis ${id}]: custom domain for xDomain should be defined in Settings`);
        }
        if (domain.min > domain.max) {
            throw new Error(`[Axis ${id}]: custom domain is invalid, min is greater than max`);
        }
        const prevGroupDomain = domainsByGroupId.get(groupId);
        if (prevGroupDomain) {
            const mergedDomain = {
                min: Math.min(Number.isFinite(domain.min) ? domain.min : Infinity, prevGroupDomain && Number.isFinite(prevGroupDomain.min) ? prevGroupDomain.min : Infinity),
                max: Math.max(Number.isFinite(domain.max) ? domain.max : -Infinity, prevGroupDomain && Number.isFinite(prevGroupDomain.max) ? prevGroupDomain.max : -Infinity),
            };
            if (Number.isFinite(mergedDomain.min) || Number.isFinite(mergedDomain.max)) {
                domainsByGroupId.set(groupId, mergedDomain);
            }
        }
        else {
            domainsByGroupId.set(groupId, domain);
        }
    });
    return domainsByGroupId;
}
exports.mergeYCustomDomainsByGroupId = mergeYCustomDomainsByGroupId;
//# sourceMappingURL=merge_y_custom_domains.js.map