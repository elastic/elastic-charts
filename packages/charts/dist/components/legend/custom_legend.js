"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLegend = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const get_pointer_value_1 = require("../../state/selectors/get_pointer_value");
const CustomLegendComponent = ({ component: Component, ...props }) => react_1.default.createElement(Component, { ...props });
const mapStateToProps = (state) => ({
    pointerValue: (0, get_pointer_value_1.getPointerValueSelector)(state),
});
exports.CustomLegend = (0, react_redux_1.connect)(mapStateToProps)(CustomLegendComponent);
//# sourceMappingURL=custom_legend.js.map