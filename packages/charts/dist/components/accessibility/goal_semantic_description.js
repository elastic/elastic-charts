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
const react_1 = __importStar(require("react"));
const GoalSemanticDescription = ({ bandLabels, labelId, firstValue, }) => {
    return bandLabels[0] && bandLabels[0].text.length > 1 ? (react_1.default.createElement("dl", { className: "echScreenReaderOnly echGoalDescription", key: `goalChart--${labelId}` }, bandLabels.map(({ value, text }, index) => {
        var _a;
        if (firstValue === value)
            return;
        const prevValue = bandLabels[index - 1];
        return (react_1.default.createElement(react_1.Fragment, { key: `dtdd--${value}--${text[index]}` },
            react_1.default.createElement("dt", null, `${(_a = prevValue === null || prevValue === void 0 ? void 0 : prevValue.value) !== null && _a !== void 0 ? _a : firstValue} - ${value}`),
            react_1.default.createElement("dd", null, `${text[index]}`)));
    }))) : null;
};
exports.GoalSemanticDescription = GoalSemanticDescription;
//# sourceMappingURL=goal_semantic_description.js.map