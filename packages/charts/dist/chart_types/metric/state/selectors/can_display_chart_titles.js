"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canDisplayChartTitles = void 0;
const data_1 = require("./data");
const create_selector_1 = require("../../../../state/create_selector");
exports.canDisplayChartTitles = (0, create_selector_1.createCustomCachedSelector)([data_1.getMetricSpecs], ([spec]) => {
    var _a, _b, _c, _d, _e;
    return ((_b = (_a = spec === null || spec === void 0 ? void 0 : spec.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 1 || ((_e = (_d = (_c = spec === null || spec === void 0 ? void 0 : spec.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 1;
});
//# sourceMappingURL=can_display_chart_titles.js.map