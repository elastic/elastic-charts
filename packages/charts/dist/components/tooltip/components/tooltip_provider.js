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
exports.TooltipProvider = exports.useTooltipContext = void 0;
const react_1 = __importStar(require("react"));
const tooltip_1 = require("../../../state/actions/tooltip");
const light_theme_1 = require("../../../utils/themes/light_theme");
const TooltipContext = react_1.default.createContext({
    backgroundColor: '#fff',
    dir: 'ltr',
    maxItems: 5,
    pinned: false,
    actionable: false,
    canPinTooltip: false,
    selected: [],
    toggleSelected: () => { },
    setSelection: () => { },
    values: [],
    pinTooltip: tooltip_1.pinTooltip,
    theme: light_theme_1.LIGHT_THEME.tooltip,
});
const useTooltipContext = () => (0, react_1.useContext)(TooltipContext);
exports.useTooltipContext = useTooltipContext;
const TooltipProvider = ({ children, ...rest }) => {
    return react_1.default.createElement(TooltipContext.Provider, { value: rest }, children);
};
exports.TooltipProvider = TooltipProvider;
//# sourceMappingURL=tooltip_provider.js.map