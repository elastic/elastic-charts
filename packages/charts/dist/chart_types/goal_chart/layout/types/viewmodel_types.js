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
exports.nullShapeViewModel = exports.nullGoalViewModel = exports.defaultGoalSpec = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var constants_1 = require("../../../../specs/constants");
var light_theme_1 = require("../../../../utils/themes/light_theme");
var constants_2 = require("../../specs/constants");
var commonDefaults = {
    base: 0,
    actual: 50,
};
exports.defaultGoalSpec = __assign(__assign({}, commonDefaults), { bandFillColor: function (_a) {
        var value = _a.value, highestValue = _a.highestValue, lowestValue = _a.lowestValue;
        return (0, color_library_wrappers_1.getGreensColorScale)(0.5, [highestValue, lowestValue])(value);
    }, tickValueFormatter: function (_a) {
        var value = _a.value;
        return String(value);
    }, labelMajor: function (_a) {
        var base = _a.base;
        return String(base);
    }, labelMinor: function () { return 'unit'; }, centralMajor: function (_a) {
        var base = _a.base;
        return String(base);
    }, centralMinor: function (_a) {
        var target = _a.target;
        return (target ? String(target) : '');
    }, bandLabels: [], angleStart: Math.PI + Math.PI / 4, angleEnd: -Math.PI / 4, tooltipValueFormatter: function (value) { return String(value); } });
exports.nullGoalViewModel = __assign(__assign({}, commonDefaults), { specType: constants_1.SpecType.Series, subtype: constants_2.GoalSubtype.Goal, bands: [], ticks: [], labelMajor: '', labelMinor: '', centralMajor: '', centralMinor: '', highestValue: 100, lowestValue: 0, aboveBaseCount: 0, belowBaseCount: 0, angleStart: 0, angleEnd: 0, tooltipValueFormatter: function () { return ''; } });
var nullShapeViewModel = function (_a) {
    var _b = _a === void 0 ? light_theme_1.LIGHT_THEME : _a, goal = _b.goal;
    return ({
        theme: goal,
        bulletViewModel: exports.nullGoalViewModel,
        chartCenter: { x: 0, y: 0 },
        pickQuads: function () { return []; },
    });
};
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map