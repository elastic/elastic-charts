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
var react_1 = __importStar(require("react"));
var tooltip_1 = require("../../../state/actions/tooltip");
var light_theme_1 = require("../../../utils/themes/light_theme");
var TooltipContext = react_1.default.createContext({
    backgroundColor: '#fff',
    dir: 'ltr',
    pinned: false,
    selected: [],
    onTooltipPinned: tooltip_1.onTooltipPinned,
    theme: light_theme_1.LIGHT_THEME.tooltip,
});
var useTooltipContext = function () {
    return (0, react_1.useContext)(TooltipContext);
};
exports.useTooltipContext = useTooltipContext;
var TooltipProvider = function (_a) {
    var backgroundColor = _a.backgroundColor, dir = _a.dir, pinned = _a.pinned, selected = _a.selected, onTooltipPinned = _a.onTooltipPinned, children = _a.children, theme = _a.theme;
    return (react_1.default.createElement(TooltipContext.Provider, { value: {
            backgroundColor: backgroundColor,
            dir: dir,
            pinned: pinned,
            selected: selected,
            onTooltipPinned: onTooltipPinned,
            theme: theme,
        } }, children));
};
exports.TooltipProvider = TooltipProvider;
//# sourceMappingURL=tooltip_provider.js.map