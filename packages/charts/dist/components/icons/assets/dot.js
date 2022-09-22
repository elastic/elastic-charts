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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotIcon = void 0;
var react_1 = __importDefault(require("react"));
var fast_deep_equal_1 = require("../../../utils/fast_deep_equal");
var DotIcon = (function (_super) {
    __extends(DotIcon, _super);
    function DotIcon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DotIcon.prototype.shouldComponentUpdate = function (nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    };
    DotIcon.prototype.render = function () {
        return (react_1.default.createElement("svg", __assign({ width: 16, height: 16, viewBox: "0 0 16 16", xmlns: "http://www.w3.org/2000/svg" }, this.props),
            react_1.default.createElement("circle", { cx: 8, cy: 8, r: 4 })));
    };
    return DotIcon;
}(react_1.default.Component));
exports.DotIcon = DotIcon;
//# sourceMappingURL=dot.js.map