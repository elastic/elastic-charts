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
exports.Goal = void 0;
var __1 = require("../..");
var constants_1 = require("../../../common/constants");
var constants_2 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var common_1 = require("../../../utils/common");
var logger_1 = require("../../../utils/logger");
var viewmodel_types_1 = require("../layout/types/viewmodel_types");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    specType: constants_2.SpecType.Series,
    chartType: __1.ChartType.Goal,
}, __assign({}, viewmodel_types_1.defaultGoalSpec));
var Goal = function (props) {
    var _a, _b;
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    var angleStart = (_a = props.angleStart) !== null && _a !== void 0 ? _a : defaults.angleStart;
    var angleEnd = (_b = props.angleEnd) !== null && _b !== void 0 ? _b : defaults.angleEnd;
    var constraints = {};
    if (Math.abs(angleEnd - angleStart) > constants_1.TAU) {
        constraints.angleEnd = angleStart + constants_1.TAU * Math.sign(angleEnd - angleStart);
        logger_1.Logger.warn("The total angle of the goal chart must not exceed 2\u03C0 radians.To prevent overlapping, the value of `angleEnd` will be replaced.\n\n  original: ".concat(angleEnd, " (~").concat((0, common_1.round)(angleEnd / Math.PI, 3), "\u03C0)\n  replaced: ").concat(constraints.angleEnd, " (~").concat((0, common_1.round)(constraints.angleEnd / Math.PI, 3), "\u03C0)\n"));
    }
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides), constraints));
    return null;
};
exports.Goal = Goal;
//# sourceMappingURL=index.js.map