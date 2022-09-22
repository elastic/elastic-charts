"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecsParser = void 0;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var specs_1 = require("../state/actions/specs");
var SpecsParserComponent = function (props) {
    var injected = props;
    (0, react_1.useEffect)(function () {
        injected.specParsed();
    });
    (0, react_1.useEffect)(function () { return function () {
        injected.specUnmounted();
    }; }, []);
    return props.children ? props.children : null;
};
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        specParsed: specs_1.specParsed,
        specUnmounted: specs_1.specUnmounted,
    }, dispatch);
};
exports.SpecsParser = (0, react_redux_1.connect)(null, mapDispatchToProps)(SpecsParserComponent);
//# sourceMappingURL=specs_parser.js.map