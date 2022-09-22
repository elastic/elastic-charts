"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.testContextLoss = exports.getRenderer = exports.bindVertexArray = exports.getAttributes = exports.readPixel = exports.createTexture = exports.NullTexture = exports.bindFramebuffer = exports.clearRect = exports.blockUniforms = exports.createLinkedProgram = exports.createCompiledShader = exports.resetState = void 0;
var webgl_constants_1 = require("./webgl_constants");
var GL_DEBUG = true;
var currentPrograms = new WeakMap();
var currentVertexArrayObjects = new WeakMap();
var currentDepthTests = new WeakMap();
var currentReadFrameBuffers = new WeakMap();
var currentDrawFrameBuffers = new WeakMap();
var currentViewport = new WeakMap();
var currentScissor = new WeakMap();
var currentClearColor = new WeakMap();
var currentClearDepth = new WeakMap();
var currentFlags = new WeakMap();
var programUniforms = new WeakMap();
var locationUniformValues = new WeakMap();
var setGlobalConstants = new WeakSet();
var resetState = function (gl) {
    currentPrograms.delete(gl);
    currentVertexArrayObjects.delete(gl);
    currentDepthTests.delete(gl);
    currentReadFrameBuffers.delete(gl);
    currentDrawFrameBuffers.delete(gl);
    currentViewport.delete(gl);
    currentScissor.delete(gl);
    currentClearColor.delete(gl);
    currentClearDepth.delete(gl);
    currentFlags.delete(gl);
    setGlobalConstants.delete(gl);
};
exports.resetState = resetState;
var setViewport = function (gl) {
    var xyWidthHeight = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        xyWidthHeight[_i - 1] = arguments[_i];
    }
    var key = xyWidthHeight.join('|');
    if (currentViewport.get(gl) !== key) {
        gl.viewport.apply(gl, __spreadArray([], __read(xyWidthHeight), false));
        currentViewport.set(gl, key);
    }
};
var setScissor = function (gl) {
    var xyWidthHeight = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        xyWidthHeight[_i - 1] = arguments[_i];
    }
    var key = xyWidthHeight.join('|');
    if (currentScissor.get(gl) !== key) {
        gl.scissor.apply(gl, __spreadArray([], __read(xyWidthHeight), false));
        currentScissor.set(gl, key);
    }
};
var clearColor = function (gl) {
    var rgba = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rgba[_i - 1] = arguments[_i];
    }
    var key = rgba.join('|');
    if (currentClearColor.get(gl) !== key) {
        gl.clearColor.apply(gl, __spreadArray([], __read(rgba), false));
        currentClearColor.set(gl, key);
    }
};
var clearDepth = function (gl, depth) {
    if (currentClearDepth.get(gl) !== depth) {
        gl.clearDepth(depth);
        currentClearDepth.set(gl, depth);
    }
};
var flagSet = function (gl, key, value) {
    var flags = currentFlags.get(gl);
    if (flags[key] !== value) {
        if (value) {
            gl.enable(key);
        }
        else {
            gl.disable(key);
        }
        flags[key] = value;
    }
};
var createCompiledShader = function (gl, shaderType, source) {
    var shader = gl.createShader(shaderType);
    if (!shader)
        throw new Error("Whoa, shader could not be created");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (GL_DEBUG && !gl.getShaderParameter(shader, webgl_constants_1.GL.COMPILE_STATUS) && !gl.isContextLost()) {
        var shaderTypeName = shaderType === webgl_constants_1.GL.VERTEX_SHADER ? 'vertex' : 'fragment';
        throw new Error("Whoa, compilation error in a ".concat(shaderTypeName, " shader: ").concat(gl.getShaderInfoLog(shader)));
    }
    return shader;
};
exports.createCompiledShader = createCompiledShader;
var createLinkedProgram = function (gl, vertexShader, fragmentShader, attributeLocations) {
    var program = gl.createProgram();
    if (!program)
        throw new Error("Whoa, shader program could not be created");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    if (GL_DEBUG && gl.getProgramParameter(program, webgl_constants_1.GL.ATTACHED_SHADERS) !== 2)
        throw new Error('Did not manage to attach the two shaders');
    Object.entries(attributeLocations).forEach(function (_a) {
        var _b = __read(_a, 2), name = _b[0], i = _b[1];
        return gl.bindAttribLocation(program, i, name);
    });
    gl.linkProgram(program);
    if (GL_DEBUG) {
        if (!gl.getProgramParameter(program, webgl_constants_1.GL.LINK_STATUS) && !gl.isContextLost())
            throw new Error("Whoa, shader program failed to link: ".concat(gl.getProgramInfoLog(program)));
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, webgl_constants_1.GL.LINK_STATUS) && !gl.isContextLost())
            throw new Error("Whoa, could not validate the shader program: ".concat(gl.getProgramInfoLog(program)));
    }
    if (!GL_DEBUG) {
        window.setTimeout(function () {
            gl.detachShader(program, vertexShader);
            gl.detachShader(program, fragmentShader);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
        });
    }
    return program;
};
exports.createLinkedProgram = createLinkedProgram;
var uniformSetterLookup = (_a = {},
    _a[webgl_constants_1.GL.BOOL] = function (gl, location) { return function (value) {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1ui(location, value);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.INT] = function (gl, location) { return function (value) {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1i(location, value);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.FLOAT_VEC2] = function (gl, location) { return function (values) {
        var value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform2fv(location, values);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.FLOAT_VEC3] = function (gl, location) { return function (values) {
        var value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform3fv(location, values);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.INT_VEC2] = function (gl, location) { return function (values) {
        var value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform2iv(location, values);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.FLOAT] = function (gl, location) { return function (value) {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1f(location, value);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.FLOAT_MAT2] = function (gl, location) { return function (array) {
        var value = array.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniformMatrix2fv(location, false, array);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.FLOAT_MAT4] = function (gl, location) { return function (array) {
        var value = array.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniformMatrix4fv(location, false, array);
            locationUniformValues.set(location, value);
        }
    }; },
    _a[webgl_constants_1.GL.SAMPLER_2D] = function (gl, location) {
        return function (_a) {
            var setUniform = _a.setUniform;
            if (locationUniformValues.get(location) !== setUniform) {
                setUniform(location);
                locationUniformValues.set(location, setUniform);
            }
        };
    },
    _a);
var getUniforms = function (gl, program, uboInfo) {
    if (programUniforms.has(program))
        return programUniforms.get(program);
    var uniforms = new Map(__spreadArray([], __read(new Array(gl.getProgramParameter(program, webgl_constants_1.GL.ACTIVE_UNIFORMS))), false).map(function (_, index) {
        var activeUniform = gl.getActiveUniform(program, index);
        if (!activeUniform)
            throw new Error("Whoa, active uniform not found");
        var name = activeUniform.name, type = activeUniform.type;
        var location = gl.getUniformLocation(program, name);
        if (location === null && !uboInfo.has(name))
            throw new Error("Whoa, uniform location ".concat(location, " (name: ").concat(name, ", type: ").concat(type, ") not found"));
        var setValue = location ? uniformSetterLookup[type](gl, location) : function () { };
        if (GL_DEBUG && !setValue)
            throw new Error("No setValue for uniform GL[".concat(type, "] (name: ").concat(name, ") implemented yet"));
        return [name, setValue];
    }));
    programUniforms.set(program, uniforms);
    return uniforms;
};
function blockUniforms(gl, uniformBlockName, uboVariableNames, _a) {
    var _b = __read(_a), program = _b[0], otherPrograms = _b.slice(1);
    var blockIndex = gl.getUniformBlockIndex(program, uniformBlockName);
    var blockSize = gl.getActiveUniformBlockParameter(program, blockIndex, webgl_constants_1.GL.UNIFORM_BLOCK_DATA_SIZE);
    var uboBuffer = gl.createBuffer();
    if (uboBuffer === null)
        throw new Error('Whoa, could not create uboBuffer');
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uboBuffer);
    var uboVariableIndices = gl.getUniformIndices(program, uboVariableNames);
    if (uboVariableIndices === null)
        throw new Error('Whoa, could not get uboVariableIndices');
    var uboVariableOffsets = gl.getActiveUniforms(program, uboVariableIndices, gl.UNIFORM_OFFSET);
    var uniforms = new Map(uboVariableNames.map(function (name, i) { return [name, { index: uboVariableIndices[i], offset: uboVariableOffsets[i] }]; }));
    __spreadArray([program], __read(otherPrograms), false).forEach(function (p) {
        return gl.uniformBlockBinding(p, gl.getUniformBlockIndex(p, uniformBlockName), 0);
    });
    return { uboBuffer: uboBuffer, uniforms: uniforms };
}
exports.blockUniforms = blockUniforms;
var clearRect = function (gl, _a) {
    var rect = _a.rect, color = _a.color, depth = _a.depth, stencilIndex = _a.stencilIndex;
    if (rect) {
        flagSet(gl, webgl_constants_1.GL.SCISSOR_TEST, true);
        setScissor.apply(void 0, __spreadArray([gl], __read(rect), false));
    }
    var flags = 0;
    if (color) {
        clearColor.apply(void 0, __spreadArray([gl], __read(color), false));
        flags |= webgl_constants_1.GL.COLOR_BUFFER_BIT;
    }
    if (typeof depth === 'number') {
        clearDepth(gl, depth);
        flags |= webgl_constants_1.GL.DEPTH_BUFFER_BIT;
    }
    if (typeof stencilIndex === 'number') {
        gl.clearStencil(stencilIndex);
        flags |= webgl_constants_1.GL.STENCIL_BUFFER_BIT;
    }
    gl.clear(flags);
};
exports.clearRect = clearRect;
var textureSrcFormatLookup = (_b = {},
    _b[webgl_constants_1.GL.RGBA8] = webgl_constants_1.GL.RGBA,
    _b[webgl_constants_1.GL.RGBA32F] = webgl_constants_1.GL.RGBA,
    _b);
var textureTypeLookup = (_c = {},
    _c[webgl_constants_1.GL.RGBA8] = webgl_constants_1.GL.UNSIGNED_BYTE,
    _c[webgl_constants_1.GL.RGBA32F] = webgl_constants_1.GL.FLOAT,
    _c);
var bindFramebuffer = function (gl, target, targetFrameBuffer) {
    var updateReadTarget = (target === webgl_constants_1.GL.READ_FRAMEBUFFER || target === webgl_constants_1.GL.FRAMEBUFFER) &&
        targetFrameBuffer !== currentReadFrameBuffers.get(gl);
    var updateWriteTarget = (target === webgl_constants_1.GL.DRAW_FRAMEBUFFER || target === webgl_constants_1.GL.FRAMEBUFFER) &&
        targetFrameBuffer !== currentDrawFrameBuffers.get(gl);
    if (updateReadTarget)
        currentReadFrameBuffers.set(gl, targetFrameBuffer);
    if (updateWriteTarget)
        currentDrawFrameBuffers.set(gl, targetFrameBuffer);
    if (updateReadTarget || updateWriteTarget) {
        var targetToUpdate = updateReadTarget && updateWriteTarget
            ? webgl_constants_1.GL.FRAMEBUFFER
            : updateReadTarget
                ? webgl_constants_1.GL.READ_FRAMEBUFFER
                : webgl_constants_1.GL.DRAW_FRAMEBUFFER;
        gl.bindFramebuffer(targetToUpdate, targetFrameBuffer);
    }
};
exports.bindFramebuffer = bindFramebuffer;
exports.NullTexture = {
    clear: function () { },
    setUniform: function () { },
    target: function () { return null; },
    delete: function () { },
    width: 0,
    height: 0,
};
var createTexture = function (gl, _a) {
    var textureIndex = _a.textureIndex, internalFormat = _a.internalFormat, width = _a.width, height = _a.height, data = _a.data, _b = _a.min, min = _b === void 0 ? webgl_constants_1.GL.NEAREST : _b, _c = _a.mag, mag = _c === void 0 ? webgl_constants_1.GL.NEAREST : _c;
    if (GL_DEBUG && !(0 <= textureIndex && textureIndex <= gl.getParameter(webgl_constants_1.GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS)))
        throw new Error('WebGL2 is guaranteed to support at least 32 textures but not necessarily more than that');
    var srcFormat = textureSrcFormatLookup[internalFormat];
    var type = textureTypeLookup[internalFormat];
    var texture = gl.createTexture();
    var setTextureContents = function () {
        gl.activeTexture(webgl_constants_1.GL.TEXTURE0 + textureIndex);
        gl.bindTexture(webgl_constants_1.GL.TEXTURE_2D, texture);
        gl.texImage2D(webgl_constants_1.GL.TEXTURE_2D, 0, internalFormat, width, height, 0, srcFormat, type, data);
    };
    setTextureContents();
    gl.texParameteri(webgl_constants_1.GL.TEXTURE_2D, webgl_constants_1.GL.TEXTURE_MIN_FILTER, min);
    gl.texParameteri(webgl_constants_1.GL.TEXTURE_2D, webgl_constants_1.GL.TEXTURE_MAG_FILTER, mag);
    gl.texParameteri(webgl_constants_1.GL.TEXTURE_2D, webgl_constants_1.GL.TEXTURE_WRAP_S, webgl_constants_1.GL.CLAMP_TO_EDGE);
    gl.texParameteri(webgl_constants_1.GL.TEXTURE_2D, webgl_constants_1.GL.TEXTURE_WRAP_T, webgl_constants_1.GL.CLAMP_TO_EDGE);
    if (GL_DEBUG) {
        var error = gl.getError();
        if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL)
            throw new Error("Failed to set the texture with texImage2D, code ".concat(error));
    }
    var frameBuffer = null;
    var getTarget = function () {
        if (!frameBuffer) {
            frameBuffer = gl.createFramebuffer();
            (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, frameBuffer);
            gl.framebufferTexture2D(webgl_constants_1.GL.FRAMEBUFFER, webgl_constants_1.GL.COLOR_ATTACHMENT0, webgl_constants_1.GL.TEXTURE_2D, texture, 0);
            if (GL_DEBUG) {
                var framebufferStatus = gl.checkFramebufferStatus(webgl_constants_1.GL.DRAW_FRAMEBUFFER);
                if (framebufferStatus !== webgl_constants_1.GL.FRAMEBUFFER_COMPLETE) {
                    throw new Error("Target framebuffer is not complete");
                }
            }
        }
        return frameBuffer;
    };
    return {
        clear: function () {
            (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, getTarget());
            (0, exports.clearRect)(gl, { color: [0, 0, 0, 0] });
        },
        setUniform: function (location) { return gl.uniform1i(location, textureIndex); },
        target: getTarget,
        delete: function () {
            if (frameBuffer) {
                if (currentReadFrameBuffers.get(gl) === frameBuffer)
                    (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.READ_FRAMEBUFFER, null);
                if (currentDrawFrameBuffers.get(gl) === frameBuffer)
                    (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, null);
                gl.deleteFramebuffer(frameBuffer);
            }
            gl.deleteTexture(texture);
            return true;
        },
        width: width,
        height: height,
    };
};
exports.createTexture = createTexture;
var pickPixel = new Uint8Array(4);
var readPixel = function (gl, canvasX, canvasY) {
    gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickPixel);
    return pickPixel;
};
exports.readPixel = readPixel;
var attribSizeLookup = (_d = {}, _d[webgl_constants_1.GL.FLOAT_VEC2] = 2, _d[webgl_constants_1.GL.FLOAT_VEC4] = 4, _d[webgl_constants_1.GL.FLOAT] = 1, _d[webgl_constants_1.GL.INT] = 1, _d);
var attribElementTypeLookup = (_e = {},
    _e[webgl_constants_1.GL.FLOAT_VEC2] = webgl_constants_1.GL.FLOAT,
    _e[webgl_constants_1.GL.FLOAT_VEC4] = webgl_constants_1.GL.FLOAT,
    _e[webgl_constants_1.GL.FLOAT] = webgl_constants_1.GL.FLOAT,
    _e[webgl_constants_1.GL.INT] = webgl_constants_1.GL.INT,
    _e);
var integerTypes = new Set([webgl_constants_1.GL.BYTE, webgl_constants_1.GL.SHORT, webgl_constants_1.GL.INT, webgl_constants_1.GL.UNSIGNED_BYTE, webgl_constants_1.GL.UNSIGNED_SHORT, webgl_constants_1.GL.UNSIGNED_INT]);
var getAttributes = function (gl, program, attributeLocations) {
    return new Map(__spreadArray([], __read(new Array(gl.getProgramParameter(program, webgl_constants_1.GL.ACTIVE_ATTRIBUTES))), false).map(function (_, index) {
        var normalize = false;
        var stride = 0;
        var offset = 0;
        var activeAttribInfo = gl.getActiveAttrib(program, index);
        if (!activeAttribInfo)
            throw new Error("Whoa, active attribute info could not be read");
        var name = activeAttribInfo.name, type = activeAttribInfo.type;
        if (name.startsWith('gl_'))
            return [name, function () { }];
        var location = attributeLocations[name];
        var buffer = gl.createBuffer();
        gl.bindBuffer(webgl_constants_1.GL.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        var attribSize = attribSizeLookup[type];
        var attribElementType = attribElementTypeLookup[type];
        if (GL_DEBUG && (attribSize === undefined || attribElementType === undefined))
            throw new Error("Attribute type ".concat(type, " is not yet properly covered"));
        if (integerTypes.has(attribElementType)) {
            gl.vertexAttribIPointer(location, attribSize, webgl_constants_1.GL.INT, stride, offset);
        }
        else {
            gl.vertexAttribPointer(location, attribSize, webgl_constants_1.GL.FLOAT, normalize, stride, offset);
        }
        var setValue = function (data) {
            gl.bindBuffer(webgl_constants_1.GL.ARRAY_BUFFER, buffer);
            gl.bufferData(webgl_constants_1.GL.ARRAY_BUFFER, data, webgl_constants_1.GL.STATIC_DRAW);
        };
        return [name, setValue];
    }));
};
exports.getAttributes = getAttributes;
var bindVertexArray = function (gl, vertexArrayObject) {
    if (vertexArrayObject !== currentVertexArrayObjects.get(gl)) {
        currentVertexArrayObjects.set(gl, vertexArrayObject);
        gl.bindVertexArray(vertexArrayObject);
    }
};
exports.bindVertexArray = bindVertexArray;
var getRenderer = function (gl, program, _a, vao, _b) {
    var uniforms = _a.uniforms, uboBuffer = _a.uboBuffer;
    var _c = _b.depthTest, depthTest = _c === void 0 ? false : _c, _d = _b.blend, blend = _d === void 0 ? true : _d, _e = _b.frontFace, frontFace = _e === void 0 ? webgl_constants_1.GL.CCW : _e;
    var allUniforms = getUniforms(gl, program, uniforms);
    return function (_a) {
        var _b;
        var uniformValues = _a.uniformValues, viewport = _a.viewport, target = _a.target, clear = _a.clear, scissor = _a.scissor, draw = _a.draw;
        if (!setGlobalConstants.has(gl)) {
            setGlobalConstants.add(gl);
            currentFlags.set(gl, (_b = {}, _b[webgl_constants_1.GL.DITHER] = true, _b));
            gl.blendFuncSeparate(webgl_constants_1.GL.SRC_ALPHA, webgl_constants_1.GL.ONE_MINUS_SRC_ALPHA, 1, 1);
            gl.blendEquation(webgl_constants_1.GL.FUNC_ADD);
            flagSet(gl, webgl_constants_1.GL.DITHER, false);
            gl.depthMask(true);
            gl.depthFunc(webgl_constants_1.GL.LESS);
            gl.depthRange(0, 1);
            gl.frontFace(frontFace);
            flagSet(gl, webgl_constants_1.GL.CULL_FACE, true);
            gl.cullFace(webgl_constants_1.GL.BACK);
            gl.hint(webgl_constants_1.GL.FRAGMENT_SHADER_DERIVATIVE_HINT, webgl_constants_1.GL.NICEST);
        }
        if (depthTest !== currentDepthTests.get(gl)) {
            currentDepthTests.set(gl, depthTest);
            flagSet(gl, webgl_constants_1.GL.DEPTH_TEST, depthTest);
        }
        flagSet(gl, webgl_constants_1.GL.BLEND, blend);
        if (program !== currentPrograms.get(gl)) {
            currentPrograms.set(gl, program);
            gl.useProgram(program);
        }
        if (vao)
            (0, exports.bindVertexArray)(gl, vao);
        if (viewport)
            setViewport(gl, viewport.x, viewport.y, viewport.width, viewport.height);
        if (uniformValues) {
            allUniforms.forEach(function (setValue, name) { return uniformValues[name] && !uniforms.has(name) && setValue(uniformValues[name]); });
            gl.bindBuffer(webgl_constants_1.GL.UNIFORM_BUFFER, uboBuffer);
            uniforms.forEach(function (_a, name) {
                var offset = _a.offset;
                var value = new Float32Array([uniformValues[name]].flat());
                gl.bufferSubData(webgl_constants_1.GL.UNIFORM_BUFFER, offset, value, 0);
            });
        }
        (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, target);
        if (clear)
            (0, exports.clearRect)(gl, clear);
        if (draw) {
            flagSet(gl, webgl_constants_1.GL.SCISSOR_TEST, scissor !== undefined);
            if (scissor) {
                setScissor.apply(void 0, __spreadArray([gl], __read(scissor), false));
            }
            gl.drawArraysInstanced(draw.geom, draw.offset, draw.count, draw.instanceCount || 1);
        }
    };
};
exports.getRenderer = getRenderer;
var testContextLoss = function (gl) {
    var lossTimeMs = 5000;
    var regainTimeMs = 0;
    var ext = gl.getExtension('WEBGL_lose_context');
    if (ext) {
        window.setInterval(function () {
            console.log('Context loss test triggered, the webgl rendering will freeze or disappear');
            ext.loseContext();
            window.setTimeout(function () { return ext.restoreContext(); }, regainTimeMs);
        }, lossTimeMs);
    }
};
exports.testContextLoss = testContextLoss;
//# sourceMappingURL=kingly.js.map