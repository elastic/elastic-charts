"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasExternalEventSelector = void 0;
const specs_1 = require("../../specs");
const hasExternalEventSelector = ({ externalEvents: { pointer } }) => pointer !== null && pointer.type !== specs_1.PointerEventType.Out;
exports.hasExternalEventSelector = hasExternalEventSelector;
//# sourceMappingURL=has_external_pointer_event.js.map