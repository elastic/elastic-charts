"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeYCustomDomainsByGroupId = void 0;
var axis_utils_1 = require("../../utils/axis_utils");
function mergeYCustomDomainsByGroupId(axesSpecs, chartRotation) {
    var domainsByGroupId = new Map();
    axesSpecs.forEach(function (spec) {
        var id = spec.id, groupId = spec.groupId, domain = spec.domain;
        if (!domain)
            return;
        if ((0, axis_utils_1.isXDomain)(spec.position, chartRotation)) {
            throw new Error("[Axis ".concat(id, "]: custom domain for xDomain should be defined in Settings"));
        }
        if (domain.min > domain.max) {
            throw new Error("[Axis ".concat(id, "]: custom domain is invalid, min is greater than max"));
        }
        var prevGroupDomain = domainsByGroupId.get(groupId);
        if (prevGroupDomain) {
            var mergedDomain = {
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