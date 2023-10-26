"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricSpecs = void 0;
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const get_specs_by_type_1 = require("../../../../state/selectors/get_specs_by_type");
exports.getMetricSpecs = (0, get_specs_by_type_1.getSpecsByType)(__1.ChartType.Metric, specs_1.SpecType.Series);
//# sourceMappingURL=data.js.map