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
exports.WeightFn = exports.Wordcloud = void 0;
var __1 = require("../..");
var constants_1 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var viewmodel_types_1 = require("../layout/types/viewmodel_types");
exports.Wordcloud = (0, spec_factory_1.specComponentFactory)()({
    chartType: __1.ChartType.Wordcloud,
    specType: constants_1.SpecType.Series,
}, __assign({}, viewmodel_types_1.defaultWordcloudSpec));
var viewmodel_types_2 = require("../layout/types/viewmodel_types");
Object.defineProperty(exports, "WeightFn", { enumerable: true, get: function () { return viewmodel_types_2.WeightFn; } });
//# sourceMappingURL=index.js.map