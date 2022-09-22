"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalSemanticDescription = void 0;
var react_1 = __importStar(require("react"));
var GoalSemanticDescription = function (_a) {
    var bandLabels = _a.bandLabels, labelId = _a.labelId, firstValue = _a.firstValue;
    return bandLabels[0] && bandLabels[0].text.length > 1 ? (react_1.default.createElement("dl", { className: "echScreenReaderOnly echGoalDescription", key: "goalChart--".concat(labelId) }, bandLabels.map(function (_a, index) {
        var _b;
        var value = _a.value, text = _a.text;
        if (firstValue === value)
            return;
        var prevValue = bandLabels[index - 1];
        return (react_1.default.createElement(react_1.Fragment, { key: "dtdd--".concat(value, "--").concat(text[index]) },
            react_1.default.createElement("dt", null, "".concat((_b = prevValue === null || prevValue === void 0 ? void 0 : prevValue.value) !== null && _b !== void 0 ? _b : firstValue, " - ").concat(value)),
            react_1.default.createElement("dd", null, "".concat(text[index]))));
    }))) : null;
};
exports.GoalSemanticDescription = GoalSemanticDescription;
//# sourceMappingURL=goal_semantic_description.js.map