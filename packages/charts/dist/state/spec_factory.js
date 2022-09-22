"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSFProps = exports.specComponentFactory = exports.useSpecFactory = void 0;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var common_1 = require("../utils/common");
var specs_1 = require("./actions/specs");
function useSpecFactory(props) {
    var dispatch = (0, react_redux_1.useDispatch)();
    var _a = (0, react_1.useMemo)(function () { return ({
        upsertSpec: (0, redux_1.bindActionCreators)(specs_1.upsertSpec, dispatch),
        removeSpec: (0, redux_1.bindActionCreators)(specs_1.removeSpec, dispatch),
    }); }, [dispatch]), upsertSpec = _a.upsertSpec, removeSpec = _a.removeSpec;
    (0, react_1.useEffect)(function () {
        upsertSpec(props);
    });
    (0, react_1.useEffect)(function () { return function () {
        removeSpec(props.id);
    }; }, []);
}
exports.useSpecFactory = useSpecFactory;
var specComponentFactory = function () {
    return function (overrides, defaults) {
        return function (props) {
            useSpecFactory(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
            return null;
        };
    };
};
exports.specComponentFactory = specComponentFactory;
var buildSFProps = function () {
    return function (overrides, defaults) { return ({
        overrides: overrides,
        defaults: defaults,
        optionals: {},
        requires: {},
    }); };
};
exports.buildSFProps = buildSFProps;
//# sourceMappingURL=spec_factory.js.map