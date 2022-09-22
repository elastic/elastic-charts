"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configMap = exports.Numeric = void 0;
var Type = (function () {
    function Type(dflt, reconfigurable, documentation) {
        this.dflt = dflt;
        this.reconfigurable = reconfigurable;
        this.documentation = documentation;
    }
    return Type;
}());
var Numeric = (function (_super) {
    __extends(Numeric, _super);
    function Numeric(_a) {
        var dflt = _a.dflt, min = _a.min, max = _a.max, reconfigurable = _a.reconfigurable, documentation = _a.documentation;
        var _this = _super.call(this, dflt, reconfigurable, documentation) || this;
        _this.type = 'number';
        _this.min = min;
        _this.max = max;
        return _this;
    }
    return Numeric;
}(Type));
exports.Numeric = Numeric;
function isGroupConfigItem(item) {
    return item.type === 'group';
}
function configMap(mapper, cfgMetadata) {
    return Object.assign.apply(Object, __spreadArray([{}], __read(Object.entries(cfgMetadata).map(function (_a) {
        var _b, _c;
        var _d = __read(_a, 2), k = _d[0], v = _d[1];
        if (isGroupConfigItem(v)) {
            return _b = {}, _b[k] = configMap(mapper, v.values), _b;
        }
        return _c = {}, _c[k] = mapper(v), _c;
    })), false));
}
exports.configMap = configMap;
//# sourceMappingURL=config_objects.js.map