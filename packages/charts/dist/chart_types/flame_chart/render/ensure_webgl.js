"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWebgl = void 0;
var kingly_1 = require("../../../common/kingly");
var webgl_constants_1 = require("../../../common/webgl_constants");
var shaders_1 = require("../shaders");
var types_1 = require("../types");
function ensureWebgl(gl, instanceAttributes) {
    (0, kingly_1.resetState)(gl);
    var vao = gl.createVertexArray();
    if (!vao)
        return types_1.NULL_GL_RESOURCES;
    (0, kingly_1.bindVertexArray)(gl, vao);
    instanceAttributes.forEach(function (name) { return gl.vertexAttribDivisor(shaders_1.attributeLocations[name], 1); });
    var geomProgram = (0, kingly_1.createLinkedProgram)(gl, (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.VERTEX_SHADER, shaders_1.roundedRectVert), (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.FRAGMENT_SHADER, shaders_1.roundedRectFrag), shaders_1.attributeLocations);
    var pickProgram = (0, kingly_1.createLinkedProgram)(gl, (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.VERTEX_SHADER, shaders_1.simpleRectVert), (0, kingly_1.createCompiledShader)(gl, webgl_constants_1.GL.FRAGMENT_SHADER, shaders_1.colorFrag), shaders_1.attributeLocations);
    var blockUniformsData = (0, kingly_1.blockUniforms)(gl, 'Settings', [
        'focus',
        'resolution',
        'gapPx',
        'minFillRatio',
        'rowHeight0',
        'rowHeight1',
        't',
        'cornerRadiusPx',
        'hoverIndex',
        'wobbleIndex',
        'wobble',
        'pickLayer',
    ], [geomProgram, pickProgram]);
    var roundedRectRenderer = (0, kingly_1.getRenderer)(gl, geomProgram, blockUniformsData, vao, { depthTest: false, blend: true });
    var pickTextureRenderer = (0, kingly_1.getRenderer)(gl, pickProgram, blockUniformsData, vao, { depthTest: false, blend: false });
    var attributes = (0, kingly_1.getAttributes)(gl, geomProgram, shaders_1.attributeLocations);
    return { roundedRectRenderer: roundedRectRenderer, pickTextureRenderer: pickTextureRenderer, attributes: attributes };
}
exports.ensureWebgl = ensureWebgl;
//# sourceMappingURL=ensure_webgl.js.map