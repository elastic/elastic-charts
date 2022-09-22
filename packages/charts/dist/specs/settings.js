"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointerOverEvent = exports.isPointerOutEvent = exports.Settings = exports.isMetricElementEvent = void 0;
var spec_factory_1 = require("../state/spec_factory");
var common_1 = require("../utils/common");
var constants_1 = require("./constants");
function isMetricElementEvent(e) {
    return 'type' in e && e.type === 'metricElementEvent';
}
exports.isMetricElementEvent = isMetricElementEvent;
var Settings = function (props) {
    var defaults = constants_1.settingsBuildProps.defaults, overrides = constants_1.settingsBuildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
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