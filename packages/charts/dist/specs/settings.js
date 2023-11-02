"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointerOverEvent = exports.isPointerOutEvent = exports.Settings = exports.isMetricElementEvent = void 0;
const constants_1 = require("./constants");
const spec_factory_1 = require("../state/spec_factory");
const common_1 = require("../utils/common");
function isMetricElementEvent(e) {
    return 'type' in e && e.type === 'metricElementEvent';
}
exports.isMetricElementEvent = isMetricElementEvent;
const Settings = function (props) {
    const { defaults, overrides } = constants_1.settingsBuildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.Settings = Settings;
function isPointerOutEvent(event) {
    return (event === null || event === void 0 ? void 0 : event.type) === constants_1.PointerEventType.Out;
}
exports.isPointerOutEvent = isPointerOutEvent;
function isPointerOverEvent(event) {
    return (event === null || event === void 0 ? void 0 : event.type) === constants_1.PointerEventType.Over;
}
exports.isPointerOverEvent = isPointerOverEvent;
//# sourceMappingURL=settings.js.map