"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToWebgl = void 0;
function uploadToWebgl(gl, attributes, columnarViewModel) {
    attributes.forEach((setValue, key) => {
        const value = columnarViewModel[key];
        if (value instanceof Float32Array)
            setValue(value);
    });
}
exports.uploadToWebgl = uploadToWebgl;
//# sourceMappingURL=upload_to_webgl.js.map