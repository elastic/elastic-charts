"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWebgl = void 0;
const kingly_1 = require("../../../common/kingly");
const webgl_constants_1 = require("../../../common/webgl_constants");
const shaders_1 = require("../shaders");
const types_1 = require("../types");
function ensureWebgl(gl, instanceAttributes) {
    (0, kingly_1.resetState)(gl);
    const vao = gl.createVertexArray();
    if (!vao)
        return types_1.NULL_GL_RESOURCES;
    (0, kingly_1.bindVertexArray)(gl, vao);
    instanceAttributes.forEach((name) => gl.vertexAttribDivisor(shaders_1.attributeLocations[name], 1));
    const geomProgram = (0, kingly_1.createLinkedProgram)(gl, (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.VERTEX_SHADER, shaders_1.roundedRectVert), (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.FRAGMENT_SHADER, shaders_1.roundedRectFrag), shaders_1.attributeLocations);
    const pickProgram = (0, kingly_1.createLinkedProgram)(gl, (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.VERTEX_SHADER, shaders_1.simpleRectVert), (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.FRAGMENT_SHADER, shaders_1.colorFrag), shaders_1.attributeLocations);
    const roundedRectRenderer = (0, kingly_1.getRenderer)(gl, geomProgram, vao, { depthTest: false, blend: true });
    const pickTextureRenderer = (0, kingly_1.getRenderer)(gl, pickProgram, vao, { depthTest: false, blend: false });
    const attributes = (0, kingly_1.getAttributes)(gl, geomProgram, shaders_1.attributeLocations);
    return { roundedRectRenderer, pickTextureRenderer, attributes };
}
exports.ensureWebgl = ensureWebgl;
//# sourceMappingURL=ensure_webgl.js.map