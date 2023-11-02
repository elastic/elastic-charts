"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecsParser = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const specs_1 = require("../state/actions/specs");
const SpecsParserComponent = (props) => {
    const injected = props;
    (0, react_1.useEffect)(() => {
        injected.specParsed();
    });
    (0, react_1.useEffect)(() => () => {
        injected.specUnmounted();
    }, []);
    return props.children ? props.children : null;
};
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    specParsed: specs_1.specParsed,
    specUnmounted: specs_1.specUnmounted,
}, dispatch);
exports.SpecsParser = (0, react_redux_1.connect)(null, mapDispatchToProps)(SpecsParserComponent);
//# sourceMappingURL=specs_parser.js.map