"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configMap = exports.Numeric = void 0;
class Type {
    constructor(dflt, reconfigurable, documentation) {
        this.dflt = dflt;
        this.reconfigurable = reconfigurable;
        this.documentation = documentation;
    }
}
class Numeric extends Type {
    constructor({ dflt, min, max, reconfigurable, documentation, }) {
        super(dflt, reconfigurable, documentation);
        this.type = 'number';
        this.min = min;
        this.max = max;
    }
}
exports.Numeric = Numeric;
function isGroupConfigItem(item) {
    return item.type === 'group';
}
function configMap(mapper, cfgMetadata) {
    return Object.assign({}, ...Object.entries(cfgMetadata).map(([k, v]) => {
        if (isGroupConfigItem(v)) {
            return { [k]: configMap(mapper, v.values) };
        }
        return { [k]: mapper(v) };
    }));
}
exports.configMap = configMap;
//# sourceMappingURL=config_objects.js.map