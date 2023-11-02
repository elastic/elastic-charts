"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSFProps = exports.specComponentFactory = exports.useSpecFactory = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const specs_1 = require("./actions/specs");
const common_1 = require("../utils/common");
function useSpecFactory(props) {
    const dispatch = (0, react_redux_1.useDispatch)();
    const { upsertSpec, removeSpec } = (0, react_1.useMemo)(() => ({
        upsertSpec: (0, redux_1.bindActionCreators)(specs_1.upsertSpec, dispatch),
        removeSpec: (0, redux_1.bindActionCreators)(specs_1.removeSpec, dispatch),
    }), [dispatch]);
    (0, react_1.useEffect)(() => {
        upsertSpec(props);
    });
    (0, react_1.useEffect)(() => () => {
        removeSpec(props.id);
    }, []);
}
exports.useSpecFactory = useSpecFactory;
const specComponentFactory = () => (overrides, defaults) => {
    return (props) => {
        useSpecFactory({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
        return null;
    };
};
exports.specComponentFactory = specComponentFactory;
const buildSFProps = () => (overrides, defaults) => ({
    overrides,
    defaults,
    optionals: {},
    requires: {},
});
exports.buildSFProps = buildSFProps;
//# sourceMappingURL=spec_factory.js.map