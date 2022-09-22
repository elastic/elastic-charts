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
exports.TooltipContent = void 0;
var react_1 = __importStar(require("react"));
var tooltip_1 = require("../../../../../components/tooltip");
var specs_1 = require("../../../../specs");
var TooltipContent = function (_a) {
    var annotationType = _a.annotationType, datum = _a.datum, CustomTooltip = _a.customTooltip, customTooltipDetails = _a.customTooltipDetails;
    var renderLine = (0, react_1.useCallback)(function () {
        var _a = datum, details = _a.details, dataValue = _a.dataValue, _b = _a.header, header = _b === void 0 ? dataValue.toString() : _b;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_1.TooltipHeader, null, header),
            react_1.default.createElement("div", { className: "echAnnotation__details" }, customTooltipDetails ? customTooltipDetails(details) : details)));
    }, [datum, customTooltipDetails]);
    var renderRect = (0, react_1.useCallback)(function () {
        var details = datum.details;
        var tooltipContent = customTooltipDetails ? customTooltipDetails(details) : details;
        if (!tooltipContent) {
            return null;
        }
        return react_1.default.createElement("div", { className: "echAnnotation__details" }, tooltipContent);
    }, [datum, customTooltipDetails]);
    if (CustomTooltip) {
        var details = datum.details;
        if ('header' in datum) {
            return react_1.default.createElement(CustomTooltip, { details: details, header: datum.header, datum: datum });
        }
        return react_1.default.createElement(CustomTooltip, { details: details, datum: datum });
    }
    switch (annotationType) {
        case specs_1.AnnotationType.Line: {
            return renderLine();
        }
        case specs_1.AnnotationType.Rectangle: {
            return renderRect();
        }
        default:
            return null;
    }
};
exports.TooltipContent = TooltipContent;
//# sourceMappingURL=tooltip_content.js.map