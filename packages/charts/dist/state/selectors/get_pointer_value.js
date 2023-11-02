"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerValueSelector = void 0;
const getPointerValueSelector = (state) => {
    var _a, _b;
    const header = (_b = (_a = state.internalChartState) === null || _a === void 0 ? void 0 : _a.getTooltipInfo(state)) === null || _b === void 0 ? void 0 : _b.header;
    if (header) {
        const { value, formattedValue, valueAccessor } = header;
        return { value, formattedValue, valueAccessor };
    }
};
exports.getPointerValueSelector = getPointerValueSelector;
//# sourceMappingURL=get_pointer_value.js.map