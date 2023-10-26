"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testContextLoss = exports.getRenderer = exports.bindVertexArray = exports.getAttributes = exports.readPixel = exports.createTexture = exports.NullTexture = exports.bindFramebuffer = exports.clearRect = exports.createLinkedProgram = exports.createCompiledShader = exports.resetState = void 0;
const webgl_constants_1 = require("./webgl_constants");
const logger_1 = require("../utils/logger");
const GL_DEBUG = true;
const currentPrograms = new WeakMap();
const currentVertexArrayObjects = new WeakMap();
const currentDepthTests = new WeakMap();
const currentReadFrameBuffers = new WeakMap();
const currentDrawFrameBuffers = new WeakMap();
const currentViewport = new WeakMap();
const currentScissor = new WeakMap();
const currentClearColor = new WeakMap();
const currentClearDepth = new WeakMap();
const currentFlags = new WeakMap();
const programUniforms = new WeakMap();
const locationUniformValues = new WeakMap();
const setGlobalConstants = new WeakSet();
const resetState = (gl) => {
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
const setViewport = (gl, ...xyWidthHeight) => {
    const key = xyWidthHeight.join('|');
    if (currentViewport.get(gl) !== key) {
        gl.viewport(...xyWidthHeight);
        currentViewport.set(gl, key);
    }
};
const setScissor = (gl, ...xyWidthHeight) => {
    const key = xyWidthHeight.join('|');
    if (currentScissor.get(gl) !== key) {
        gl.scissor(...xyWidthHeight);
        currentScissor.set(gl, key);
    }
};
const clearColor = (gl, ...rgba) => {
    const key = rgba.join('|');
    if (currentClearColor.get(gl) !== key) {
        gl.clearColor(...rgba);
        currentClearColor.set(gl, key);
    }
};
const clearDepth = (gl, depth) => {
    if (currentClearDepth.get(gl) !== depth) {
        gl.clearDepth(depth);
        currentClearDepth.set(gl, depth);
    }
};
const flagSet = (gl, key, value) => {
    const flags = currentFlags.get(gl);
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
const createCompiledShader = (gl, shaderType, source) => {
    const shader = gl.createShader(shaderType);
    if (!shader)
        throw new Error(`kinGLy exception: shader could not be created`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (GL_DEBUG && !gl.getShaderParameter(shader, webgl_constants_1.GL.COMPILE_STATUS) && !gl.isContextLost()) {
        const shaderTypeName = shaderType === webgl_constants_1.GL.VERTEX_SHADER ? 'vertex' : 'fragment';
        logger_1.Logger.warn(`kinGLy exception: compilation error in a ${shaderTypeName} shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
};
exports.createCompiledShader = createCompiledShader;
const createLinkedProgram = (gl, vertexShader, fragmentShader, attributeLocations) => {
    const program = gl.createProgram();
    if (!program)
        throw new Error(`kinGLy exception: shader program could not be created`);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    if (GL_DEBUG && gl.getProgramParameter(program, webgl_constants_1.GL.ATTACHED_SHADERS) !== 2)
        logger_1.Logger.warn('kinGLy exception: did not manage to attach the two shaders');
    Object.entries(attributeLocations).forEach(([name, i]) => gl.bindAttribLocation(program, i, name));
    gl.linkProgram(program);
    if (GL_DEBUG) {
        if (!gl.getProgramParameter(program, webgl_constants_1.GL.LINK_STATUS) && !gl.isContextLost())
            logger_1.Logger.warn(`kinGLy exception: shader program failed to link: ${gl.getProgramInfoLog(program)}`);
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, webgl_constants_1.GL.LINK_STATUS) && !gl.isContextLost())
            logger_1.Logger.warn(`kinGLy exception: could not validate the shader program: ${gl.getProgramInfoLog(program)}`);
    }
    else {
        window.setTimeout(() => {
            gl.detachShader(program, vertexShader);
            gl.detachShader(program, fragmentShader);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
        });
    }
    return program;
};
exports.createLinkedProgram = createLinkedProgram;
const uniformSetterLookup = {
    [webgl_constants_1.GL.BOOL]: (gl, location) => (value) => {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1ui(location, value);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.INT]: (gl, location) => (value) => {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1i(location, value);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.FLOAT_VEC2]: (gl, location) => (values) => {
        const value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform2fv(location, values);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.FLOAT_VEC3]: (gl, location) => (values) => {
        const value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform3fv(location, values);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.INT_VEC2]: (gl, location) => (values) => {
        const value = values.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniform2iv(location, values);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.FLOAT]: (gl, location) => (value) => {
        if (locationUniformValues.get(location) !== value) {
            gl.uniform1f(location, value);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.FLOAT_MAT2]: (gl, location) => (array) => {
        const value = array.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniformMatrix2fv(location, false, array);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.FLOAT_MAT4]: (gl, location) => (array) => {
        const value = array.join('|');
        if (locationUniformValues.get(location) !== value) {
            gl.uniformMatrix4fv(location, false, array);
            locationUniformValues.set(location, value);
        }
    },
    [webgl_constants_1.GL.SAMPLER_2D]: (gl, location) => ({ setUniform }) => {
        if (locationUniformValues.get(location) !== setUniform) {
            setUniform(location);
            locationUniformValues.set(location, setUniform);
        }
    },
};
const getUniforms = (gl, program) => {
    if (programUniforms.has(program))
        return programUniforms.get(program);
    const uniforms = new Map([...new Array(gl.getProgramParameter(program, webgl_constants_1.GL.ACTIVE_UNIFORMS))].flatMap((_, index) => {
        var _a;
        const activeUniform = gl.getActiveUniform(program, index);
        if (!activeUniform) {
            logger_1.Logger.warn(`kinGLy exception: active uniform not found`);
            return [];
        }
        const { name, type } = activeUniform;
        const location = gl.getUniformLocation(program, name);
        if (location === null) {
            logger_1.Logger.warn(`kinGLy exception: uniform location ${location} (name: ${name}, type: ${type}) not found`);
            return [];
        }
        const setValue = location ? (_a = uniformSetterLookup[type]) === null || _a === void 0 ? void 0 : _a.call(uniformSetterLookup, gl, location) : () => { };
        if (!setValue) {
            logger_1.Logger.warn(`kinGLy exception: no setValue for uniform GL[${type}] (name: ${name}) implemented yet`);
            return [];
        }
        return [[name, setValue]];
    }));
    programUniforms.set(program, uniforms);
    return uniforms;
};
const clearRect = (gl, { rect, color, depth, stencilIndex }) => {
    if (rect) {
        flagSet(gl, webgl_constants_1.GL.SCISSOR_TEST, true);
        setScissor(gl, ...rect);
    }
    let flags = 0;
    if (color) {
        clearColor(gl, ...color);
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
const textureSrcFormatLookup = {
    [webgl_constants_1.GL.RGBA8]: webgl_constants_1.GL.RGBA,
    [webgl_constants_1.GL.RGBA32F]: webgl_constants_1.GL.RGBA,
};
const textureTypeLookup = {
    [webgl_constants_1.GL.RGBA8]: webgl_constants_1.GL.UNSIGNED_BYTE,
    [webgl_constants_1.GL.RGBA32F]: webgl_constants_1.GL.FLOAT,
};
const bindFramebuffer = (gl, target, targetFrameBuffer) => {
    const updateReadTarget = (target === webgl_constants_1.GL.READ_FRAMEBUFFER || target === webgl_constants_1.GL.FRAMEBUFFER) &&
        targetFrameBuffer !== currentReadFrameBuffers.get(gl);
    const updateWriteTarget = (target === webgl_constants_1.GL.DRAW_FRAMEBUFFER || target === webgl_constants_1.GL.FRAMEBUFFER) &&
        targetFrameBuffer !== currentDrawFrameBuffers.get(gl);
    if (updateReadTarget)
        currentReadFrameBuffers.set(gl, targetFrameBuffer);
    if (updateWriteTarget)
        currentDrawFrameBuffers.set(gl, targetFrameBuffer);
    if (updateReadTarget || updateWriteTarget) {
        const targetToUpdate = updateReadTarget && updateWriteTarget
            ? webgl_constants_1.GL.FRAMEBUFFER
            : updateReadTarget
                ? webgl_constants_1.GL.READ_FRAMEBUFFER
                : webgl_constants_1.GL.DRAW_FRAMEBUFFER;
        gl.bindFramebuffer(targetToUpdate, targetFrameBuffer);
    }
};
exports.bindFramebuffer = bindFramebuffer;
exports.NullTexture = {
    clear: () => { },
    setUniform: () => { },
    target: () => null,
    delete: () => { },
    width: 0,
    height: 0,
};
const createTexture = (gl, { textureIndex, internalFormat, width, height, data, min = webgl_constants_1.GL.NEAREST, mag = webgl_constants_1.GL.NEAREST }) => {
    var _a, _b;
    if (GL_DEBUG && !(0 <= textureIndex && textureIndex <= gl.getParameter(webgl_constants_1.GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS)))
        logger_1.Logger.warn('kinGLy exception: WebGL2 is guaranteed to support at least 32 textures but not necessarily more than that');
    const srcFormat = (_a = textureSrcFormatLookup[internalFormat]) !== null && _a !== void 0 ? _a : NaN;
    const type = (_b = textureTypeLookup[internalFormat]) !== null && _b !== void 0 ? _b : NaN;
    const texture = gl.createTexture();
    const setTextureContents = () => {
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
        const error = gl.getError();
        if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL)
            logger_1.Logger.warn(`kinGLy exception: failed to set the texture with texImage2D, code ${error}`);
    }
    let frameBuffer = null;
    const getTarget = () => {
        if (!frameBuffer) {
            frameBuffer = gl.createFramebuffer();
            (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, frameBuffer);
            gl.framebufferTexture2D(webgl_constants_1.GL.FRAMEBUFFER, webgl_constants_1.GL.COLOR_ATTACHMENT0, webgl_constants_1.GL.TEXTURE_2D, texture, 0);
            if (GL_DEBUG) {
                const framebufferStatus = gl.checkFramebufferStatus(webgl_constants_1.GL.DRAW_FRAMEBUFFER);
                if (framebufferStatus !== webgl_constants_1.GL.FRAMEBUFFER_COMPLETE) {
                    logger_1.Logger.warn(`kinGLy exception: target framebuffer is not complete`);
                }
            }
        }
        return frameBuffer;
    };
    return {
        clear: () => {
            (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, getTarget());
            (0, exports.clearRect)(gl, { color: [0, 0, 0, 0] });
        },
        setUniform: (location) => gl.uniform1i(location, textureIndex),
        target: getTarget,
        delete: () => {
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
        width,
        height,
    };
};
exports.createTexture = createTexture;
const pickPixel = new Uint8Array(4);
const readPixel = (gl, canvasX, canvasY) => {
    gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickPixel);
    return pickPixel;
};
exports.readPixel = readPixel;
const attribSizeLookup = { [webgl_constants_1.GL.FLOAT_VEC2]: 2, [webgl_constants_1.GL.FLOAT_VEC4]: 4, [webgl_constants_1.GL.FLOAT]: 1, [webgl_constants_1.GL.INT]: 1 };
const attribElementTypeLookup = {
    [webgl_constants_1.GL.FLOAT_VEC2]: webgl_constants_1.GL.FLOAT,
    [webgl_constants_1.GL.FLOAT_VEC4]: webgl_constants_1.GL.FLOAT,
    [webgl_constants_1.GL.FLOAT]: webgl_constants_1.GL.FLOAT,
    [webgl_constants_1.GL.INT]: webgl_constants_1.GL.INT,
};
const integerTypes = new Set([webgl_constants_1.GL.BYTE, webgl_constants_1.GL.SHORT, webgl_constants_1.GL.INT, webgl_constants_1.GL.UNSIGNED_BYTE, webgl_constants_1.GL.UNSIGNED_SHORT, webgl_constants_1.GL.UNSIGNED_INT]);
const getAttributes = (gl, program, attributeLocations) => new Map([...new Array(gl.getProgramParameter(program, webgl_constants_1.GL.ACTIVE_ATTRIBUTES))].map((_, index) => {
    var _a, _b, _c;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    const activeAttribInfo = gl.getActiveAttrib(program, index);
    if (!activeAttribInfo)
        throw new Error(`kinGLy exception: active attribute info could not be read`);
    const { name, type } = activeAttribInfo;
    if (name.startsWith('gl_'))
        return [name, () => { }];
    const location = (_a = attributeLocations[name]) !== null && _a !== void 0 ? _a : NaN;
    const buffer = gl.createBuffer();
    gl.bindBuffer(webgl_constants_1.GL.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    const attribSize = (_b = attribSizeLookup[type]) !== null && _b !== void 0 ? _b : NaN;
    const attribElementType = (_c = attribElementTypeLookup[type]) !== null && _c !== void 0 ? _c : NaN;
    if (GL_DEBUG && (attribSize === undefined || attribElementType === undefined))
        throw new Error(`Attribute type ${type} is not yet properly covered`);
    if (integerTypes.has(attribElementType)) {
        gl.vertexAttribIPointer(location, attribSize, webgl_constants_1.GL.INT, stride, offset);
    }
    else {
        gl.vertexAttribPointer(location, attribSize, webgl_constants_1.GL.FLOAT, normalize, stride, offset);
    }
    const setValue = (data) => {
        gl.bindBuffer(webgl_constants_1.GL.ARRAY_BUFFER, buffer);
        gl.bufferData(webgl_constants_1.GL.ARRAY_BUFFER, data, webgl_constants_1.GL.STATIC_DRAW);
    };
    return [name, setValue];
}));
exports.getAttributes = getAttributes;
const bindVertexArray = (gl, vertexArrayObject) => {
    if (vertexArrayObject !== currentVertexArrayObjects.get(gl)) {
        currentVertexArrayObjects.set(gl, vertexArrayObject);
        gl.bindVertexArray(vertexArrayObject);
    }
};
exports.bindVertexArray = bindVertexArray;
const getRenderer = (gl, program, vao, { depthTest = false, blend = true, frontFace = webgl_constants_1.GL.CCW }) => {
    const uniforms = getUniforms(gl, program);
    return ({ uniformValues, viewport, target, clear, scissor, draw }) => {
        if (!setGlobalConstants.has(gl)) {
            setGlobalConstants.add(gl);
            currentFlags.set(gl, { [webgl_constants_1.GL.DITHER]: true });
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
            uniforms.forEach((setValue, name) => uniformValues[name] && setValue(uniformValues[name]));
        }
        (0, exports.bindFramebuffer)(gl, webgl_constants_1.GL.DRAW_FRAMEBUFFER, target);
        if (clear)
            (0, exports.clearRect)(gl, clear);
        if (draw) {
            flagSet(gl, webgl_constants_1.GL.SCISSOR_TEST, scissor !== undefined);
            if (scissor) {
                setScissor(gl, ...scissor);
            }
            gl.drawArraysInstanced(draw.geom, draw.offset, draw.count, draw.instanceCount || 1);
        }
    };
};
exports.getRenderer = getRenderer;
const testContextLoss = (gl) => {
    const lossTimeMs = 5000;
    const regainTimeMs = 0;
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) {
        window.setInterval(() => {
            console.log('Context loss test triggered, the webgl rendering will freeze or disappear');
            ext.loseContext();
            window.setTimeout(() => ext.restoreContext(), regainTimeMs);
        }, lossTimeMs);
    }
};
exports.testContextLoss = testContextLoss;
//# sourceMappingURL=kingly.js.map