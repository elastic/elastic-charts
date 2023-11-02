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
const react_1 = __importStar(require("react"));
const tooltip_1 = require("../../../../../components/tooltip");
const common_1 = require("../../../../../utils/common");
const specs_1 = require("../../../../specs");
const TooltipContent = ({ annotationType, datum, customTooltip: CustomTooltip, customTooltipDetails, }) => {
    const renderLine = (0, react_1.useCallback)(() => {
        const { details, dataValue, header = dataValue.toString() } = datum;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_1.TooltipHeader, null, header),
            react_1.default.createElement(tooltip_1.TooltipDivider, null),
            react_1.default.createElement("div", { className: "echAnnotation__details" }, customTooltipDetails ? (0, common_1.renderWithProps)(customTooltipDetails, { details }) : details)));
    }, [datum, customTooltipDetails]);
    const renderRect = (0, react_1.useCallback)(() => {
        const { details } = datum;
        const tooltipContent = customTooltipDetails ? (0, common_1.renderWithProps)(customTooltipDetails, { details }) : details;
        if (!tooltipContent) {
            return null;
        }
        return react_1.default.createElement("div", { className: "echAnnotation__details" }, tooltipContent);
    }, [datum, customTooltipDetails]);
    if (CustomTooltip) {
        const { details } = datum;
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