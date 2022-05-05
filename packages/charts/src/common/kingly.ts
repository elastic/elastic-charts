/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const GL_DEBUG = true;

const GL = WebGL2RenderingContext; // just a shorthand, otherwise it's so long, and static number access has benefits

/****************
 * Minimize calls
 *
 * these can be, and should be global like this
 * still doesn't cause memory leak due to weak keys
 *
 ***************/

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
const locationUniformValues = new WeakMap(); // not sure if this saves significant time; hit rate is high though
const setGlobalConstants = new WeakSet();

/** @internal */
export const resetState = (gl: WebGL2RenderingContext) => {
  // all the gl keyed stores need to be erased; other dependent keys go away on their own
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

const setViewport = (gl: WebGL2RenderingContext, ...xyWidthHeight: [number, number, number, number]) => {
  const key = xyWidthHeight.join('|');
  if (currentViewport.get(gl) !== key) {
    gl.viewport(...xyWidthHeight);
    currentViewport.set(gl, key);
  }
};

const setScissor = (gl: WebGL2RenderingContext, ...xyWidthHeight: [number, number, number, number]) => {
  const key = xyWidthHeight.join('|');
  if (currentScissor.get(gl) !== key) {
    gl.scissor(...xyWidthHeight);
    currentScissor.set(gl, key);
  }
};

const clearColor = (gl: WebGL2RenderingContext, ...rgba: [number, number, number, number]) => {
  const key = rgba.join('|');
  if (currentClearColor.get(gl) !== key) {
    gl.clearColor(...rgba);
    currentClearColor.set(gl, key);
  }
};

const clearDepth = (gl: WebGL2RenderingContext, depth: number) => {
  if (currentClearDepth.get(gl) !== depth) {
    gl.clearDepth(depth);
    currentClearDepth.set(gl, depth);
  }
};

const flagSet = (gl: WebGL2RenderingContext, key: number, value: boolean) => {
  const flags = currentFlags.get(gl);
  if (flags[key] !== value) {
    if (value) {
      gl.enable(key);
    } else {
      gl.disable(key);
    }
    flags[key] = value;
  }
};

/****************
 * Programs
 ***************/

/** @internal */
export const GL_FRAGMENT_SHADER = 0x8b30;
/** @internal */
export const GL_VERTEX_SHADER = 0x8b31;

type ShaderType = typeof GL_FRAGMENT_SHADER | typeof GL_VERTEX_SHADER;

/** @internal */
export const createCompiledShader = (
  gl: WebGL2RenderingContext,
  shaderType: ShaderType,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(shaderType);
  if (!shader) throw new Error(`Whoa, shader could not be created`); // just appeasing the TS linter
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (GL_DEBUG && !gl.getShaderParameter(shader, GL.COMPILE_STATUS)) {
    const shaderTypeName = shaderType === GL_VERTEX_SHADER ? 'vertex' : 'fragment';
    throw new Error(`Whoa, compilation error in a ${shaderTypeName} shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
};

/** @internal */
export const createLinkedProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  attributeLocations: Map<string, number> = new Map(),
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) throw new Error(`Whoa, shader program could not be created`); // just appeasing the TS linter
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  if (GL_DEBUG && gl.getProgramParameter(program, GL.ATTACHED_SHADERS) !== 2)
    throw new Error('Did not manage to attach the two shaders');

  attributeLocations.forEach((i, name) => gl.bindAttribLocation(program, i, name));

  gl.linkProgram(program); // todo consider bulk gl.compileShader iteration, followed by bulk gl.linkProgram iteration https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/

  if (GL_DEBUG) {
    if (!gl.getProgramParameter(program, GL.LINK_STATUS))
      throw new Error(`Whoa, shader program failed to link: ${gl.getProgramInfoLog(program)}`);
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, GL.LINK_STATUS))
      throw new Error(`Whoa, could not validate the shader program: ${gl.getProgramInfoLog(program)}`);
  }

  if (!GL_DEBUG) {
    // no rush with the deletion; avoid adding workload to the synchronous preparation
    window.setTimeout(() => {
      gl.detachShader(program, vertexShader);
      gl.detachShader(program, fragmentShader);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    });
  }

  return program;
};

/****************
 * Uniforms
 ***************/

interface Sampler {
  setUniform: (location: WebGLUniformLocation) => void;
}

const uniformSetterLookup = {
  [GL.BOOL]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (value: GLuint) => {
    if (locationUniformValues.get(location) !== value) {
      gl.uniform1ui(location, value);
      locationUniformValues.set(location, value);
    }
  },
  [GL.INT]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (value: GLint) => {
    if (locationUniformValues.get(location) !== value) {
      gl.uniform1i(location, value);
      locationUniformValues.set(location, value);
    }
  },
  [GL.FLOAT_VEC2]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (values: Float32List) => {
    const value = values.join('|');
    if (locationUniformValues.get(location) !== value) {
      gl.uniform2fv(location, values);
      locationUniformValues.set(location, value);
    }
  },
  [GL.FLOAT_VEC3]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (values: Float32List) => {
    const value = values.join('|');
    if (locationUniformValues.get(location) !== value) {
      gl.uniform3fv(location, values);
      locationUniformValues.set(location, value);
    }
  },
  [GL.INT_VEC2]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (values: Int32List) => {
    const value = values.join('|');
    if (locationUniformValues.get(location) !== value) {
      gl.uniform2iv(location, values);
      locationUniformValues.set(location, value);
    }
  },
  [GL.FLOAT]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (value: GLfloat) => {
    if (locationUniformValues.get(location) !== value) {
      gl.uniform1f(location, value);
      locationUniformValues.set(location, value);
    }
  },
  [GL.FLOAT_MAT2]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (array: Float32List) => {
    const value = array.join('|');
    if (locationUniformValues.get(location) !== value) {
      gl.uniformMatrix2fv(location, false, array);
      locationUniformValues.set(location, value);
    }
  },
  [GL.FLOAT_MAT4]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => (array: Float32List) => {
    const value = array.join('|');
    if (locationUniformValues.get(location) !== value) {
      gl.uniformMatrix4fv(location, false, array);
      locationUniformValues.set(location, value);
    }
  },
  [GL.SAMPLER_2D]: (gl: WebGL2RenderingContext, location: WebGLUniformLocation) => ({ setUniform }: Sampler) => {
    if (locationUniformValues.get(location) !== setUniform) {
      setUniform(location);
      locationUniformValues.set(location, setUniform);
    }
  },
};

type UniformsMap = Map<string, (...args: any[]) => void>;

const getUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram): UniformsMap => {
  if (programUniforms.has(program)) return programUniforms.get(program);
  const uniforms = new Map(
    [...new Array(gl.getProgramParameter(program, GL.ACTIVE_UNIFORMS /* uniform count */))].map((_, index) => {
      const activeUniform = gl.getActiveUniform(program, index);
      if (!activeUniform) throw new Error(`Whoa, active uniform not found`); // just appeasing the TS linter
      const { name, type } = activeUniform;
      const location = gl.getUniformLocation(program, name);
      if (!location) throw new Error(`Whoa, uniform location not found`); // just appeasing the TS linter
      const setValue = uniformSetterLookup[type](gl, location);
      if (GL_DEBUG && !setValue) throw new Error(`No setValue for uniform GL[${type}] implemented yet`);
      return [name, setValue];
    }),
  );
  programUniforms.set(program, uniforms);
  return uniforms;
};

/************
 * Clearing
 ***********/

interface ClearInfo {
  rect?: [number, number, number, number];
  color?: [number, number, number, number];
  depth?: number;
  stencilIndex?: number;
}

/**
 * Clears the color, depth and/or stencil index of the canvas or a rectangular area
 * @internal
 */
export const clearRect = (gl: WebGL2RenderingContext, { rect, color, depth, stencilIndex }: ClearInfo) => {
  // constrain clearing to a rectangle if needed
  if (rect) {
    flagSet(gl, GL.SCISSOR_TEST, true); // allow operation in a specific rectangle
    setScissor(gl, ...rect); // only operate in this rectangle
  }

  let flags = 0;
  if (color) {
    clearColor(gl, ...color); // set the color for clearing
    flags |= GL.COLOR_BUFFER_BIT; // include color in the clearing task
  }
  if (typeof depth === 'number') {
    clearDepth(gl, depth); // set the depth for clearing
    flags |= GL.DEPTH_BUFFER_BIT; // include depth in the clearing task
  }
  if (typeof stencilIndex === 'number') {
    gl.clearStencil(stencilIndex); // set the depth for clearing
    flags |= GL.STENCIL_BUFFER_BIT; // include stencil in the clearing task
  }

  // actual clearing
  gl.clear(flags); // actually do the clearing with the above color, depth and/or stencil index
};

/****************
 * Textures
 ***************/

// todo add more
const textureSrcFormatLookup = {
  [GL.RGBA8]: GL.RGBA,
  [GL.RGBA32F]: GL.RGBA,
};

// todo add more
const textureTypeLookup = {
  [GL.RGBA8]: GL.UNSIGNED_BYTE,
  [GL.RGBA32F]: GL.FLOAT,
};

/** @internal */
export const GL_READ_FRAMEBUFFER = 0x8ca8;
/** @internal */
export const GL_DRAW_FRAMEBUFFER = 0x8ca9;
/** @internal */
export const GL_FRAMEBUFFER = 0x8d40;

type FrameBufferTarget = typeof GL_READ_FRAMEBUFFER | typeof GL_DRAW_FRAMEBUFFER | typeof GL_FRAMEBUFFER;

/** @internal */
export const bindFramebuffer = (
  gl: WebGL2RenderingContext,
  target: FrameBufferTarget,
  targetFrameBuffer: WebGLFramebuffer | null,
) => {
  const updateReadTarget =
    (target === GL_READ_FRAMEBUFFER || target === GL_FRAMEBUFFER) &&
    targetFrameBuffer !== currentReadFrameBuffers.get(gl);
  const updateWriteTarget =
    (target === GL_DRAW_FRAMEBUFFER || target === GL_FRAMEBUFFER) &&
    targetFrameBuffer !== currentDrawFrameBuffers.get(gl);

  if (updateReadTarget) currentReadFrameBuffers.set(gl, targetFrameBuffer);
  if (updateWriteTarget) currentDrawFrameBuffers.set(gl, targetFrameBuffer);

  if (updateReadTarget || updateWriteTarget) {
    const targetToUpdate =
      updateReadTarget && updateWriteTarget
        ? GL_FRAMEBUFFER
        : updateReadTarget
        ? GL_READ_FRAMEBUFFER
        : GL_DRAW_FRAMEBUFFER;
    gl.bindFramebuffer(targetToUpdate, targetFrameBuffer);
  }
};

interface TextureSpecification {
  textureIndex: GLuint;
  internalFormat: GLuint;
  width: GLuint;
  height: GLuint;
  data: ArrayBufferView | null;
  min?: GLuint;
  mag?: GLuint;
}

/** @internal */
export interface Texture {
  clear: () => void;
  setUniform: (location: WebGLUniformLocation) => void;
  target: () => WebGLFramebuffer | null;
  delete: () => void;
}

/** @internal */
export const NullTexture = {
  clear: () => {},
  setUniform: () => {},
  target: () => null,
  delete: () => {},
};

/** @internal */
export const createTexture = (
  gl: WebGL2RenderingContext,
  { textureIndex, internalFormat, width, height, data, min = GL.NEAREST, mag = GL.NEAREST }: TextureSpecification,
): Texture => {
  if (GL_DEBUG && !(0 <= textureIndex && textureIndex <= gl.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS)))
    throw new Error('WebGL2 is guaranteed to support at least 32 textures but not necessarily more than that');

  const srcFormat = textureSrcFormatLookup[internalFormat];
  const type = textureTypeLookup[internalFormat];
  const texture = gl.createTexture();

  const setTextureContents = () => {
    gl.activeTexture(GL.TEXTURE0 + textureIndex); // this causes that the `gl.texParameteri`, relying on the notion of "active texture", applies to the texture
    gl.bindTexture(GL.TEXTURE_2D, texture); // this causes that the below `gl.activeTexture` knows which texture we associate to the textureIndex
    gl.texImage2D(GL.TEXTURE_2D, 0, internalFormat, width, height, 0, srcFormat, type, data); // setting `data` and some other props on the texture
  };

  setTextureContents();

  // for precise texture pixel reading, even the use of `texelFetch` requires that these be set to `nearest`
  // also when using float textures, a mandatory part of WebGL2, are not texture filterable by default (without possibly unavailable extensions)
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

  if (GL_DEBUG) {
    const error = gl.getError(); // todo add getErrors to more places
    if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL)
      throw new Error(`Failed to set the texture with texImage2D, code ${error}`);
  }

  let frameBuffer: WebGLFramebuffer | null = null; // caching the target framebuffer

  const getTarget = () => {
    if (!frameBuffer) {
      frameBuffer = gl.createFramebuffer();
      bindFramebuffer(gl, GL_DRAW_FRAMEBUFFER, frameBuffer);
      gl.framebufferTexture2D(GL_FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
      if (GL_DEBUG && gl.checkFramebufferStatus(GL_DRAW_FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
        throw new Error(`Target framebuffer is not complete`);
      }
    }
    return frameBuffer;
  };

  return {
    clear: () => {
      bindFramebuffer(gl, GL_DRAW_FRAMEBUFFER, getTarget());
      clearRect(gl, { color: [0, 0, 0, 0] }); // alternatives: texImage2D/texSubImage2D/render
    },
    setUniform: (location: WebGLUniformLocation) => gl.uniform1i(location, textureIndex),
    target: getTarget,
    delete: (): true => {
      if (frameBuffer) {
        if (currentReadFrameBuffers.get(gl) === frameBuffer) bindFramebuffer(gl, GL_READ_FRAMEBUFFER, null);
        if (currentDrawFrameBuffers.get(gl) === frameBuffer) bindFramebuffer(gl, GL_DRAW_FRAMEBUFFER, null);
        gl.deleteFramebuffer(frameBuffer);
      }
      gl.deleteTexture(texture);
      return true; // success
    },
  };
};

/****************
 * Attributes
 ***************/

// todo extend these with other attrib types, though we only ever use vec4 atm
const attribSizeLookup = { [GL.FLOAT_VEC2]: 2, [GL.FLOAT_VEC4]: 4, [GL.FLOAT]: 1, [GL.INT]: 1 };
const attribElementTypeLookup = {
  [GL.FLOAT_VEC2]: GL.FLOAT,
  [GL.FLOAT_VEC4]: GL.FLOAT,
  [GL.FLOAT]: GL.FLOAT,
  [GL.INT]: GL.INT,
};

const integerTypes = new Set([GL.BYTE, GL.SHORT, GL.INT, GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT, GL.UNSIGNED_INT]);

/** @internal */
export const getAttributes = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  attributeLocations: Map<string, GLuint>,
) =>
  new Map(
    [...new Array(gl.getProgramParameter(program, GL.ACTIVE_ATTRIBUTES) /* attributesCount */)].map((_, index) => {
      const normalize = false; // don't normalize the data
      const stride = 0; // default 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset = 0; // start at the beginning of the buffer

      const activeAttribInfo = gl.getActiveAttrib(program, index);
      if (!activeAttribInfo) throw new Error(`Whoa, active attribute info could not be read`); // just appeasing the TS linter
      const { name, type } = activeAttribInfo;
      if (name.startsWith('gl_')) return [name, () => {}]; // only populate expressly supplied attributes, NOT gl_VertexID or gl_InstanceID

      const location = attributeLocations.get(name);
      if (typeof location !== 'number') throw new Error(`Whoa, attribute location was not found in the cache`); // just appeasing the TS linter
      const buffer = gl.createBuffer();
      gl.bindBuffer(GL.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      const attribSize = attribSizeLookup[type];
      const attribElementType = attribElementTypeLookup[type];
      if (GL_DEBUG && (attribSize === undefined || attribElementType === undefined))
        throw new Error(`Attribute type ${type} is not yet properly covered`);
      if (integerTypes.has(attribElementType)) {
        gl.vertexAttribIPointer(location, attribSize, GL.INT, stride, offset);
      } else {
        gl.vertexAttribPointer(location, attribSize, GL.FLOAT, normalize, stride, offset);
      }

      const setValue = (data: ArrayBufferView) => {
        gl.bindBuffer(GL.ARRAY_BUFFER, buffer);
        gl.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
      };

      return [name, setValue];
    }),
  );

/** @internal */
export const bindVertexArray = (gl: WebGL2RenderingContext, vertexArrayObject: WebGLVertexArrayObject | null) => {
  if (vertexArrayObject !== currentVertexArrayObjects.get(gl)) {
    currentVertexArrayObjects.set(gl, vertexArrayObject);
    gl.bindVertexArray(vertexArrayObject);
  }
};

/****************
 * Rendering
 ***************/

/**
 * Ensures that the draw calls will operate under the desired state (context flags, bound attribs)
 * @internal
 */

/** @internal */
export interface UseInfo {
  uniformValues: any;
  viewport: { x: number; y: number; width: number; height: number };
  target: WebGLFramebuffer | null;
  clear?: ClearInfo;
  scissor?: [number, number, number, number];
  draw?: { geom: GLuint; offset: GLuint; count: GLuint; instanceCount?: GLuint };
}

/** @internal */
export type Render = (u: UseInfo) => void;

/** @internal */
export const getRenderer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vao: WebGLVertexArrayObject | null,
  { depthTest = false, blend = true },
): Render => {
  const uniforms = getUniforms(gl, program);
  return ({ uniformValues, viewport, target, clear, scissor, draw }: UseInfo): void => {
    if (!setGlobalConstants.has(gl)) {
      setGlobalConstants.add(gl);
      currentFlags.set(gl, { [GL.DITHER]: true }); // upon context initialization, only the dither flag is enabled by WebGL
      // blending controls how semitransparent pixels compose with previously painted pixels; it's the "normal" CSS default like blending, can be tweaked like in CSS
      gl.blendFuncSeparate(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, 1, 1);
      gl.blendEquation(GL.FUNC_ADD);

      // dither off means, don't slow down and alter colors for an illusion of a broader palette (the only GL state variable that's ON by default)
      flagSet(gl, GL.DITHER, false);

      // depth defaults for when GL.DEPTH_TEST is enabled
      gl.depthMask(true);
      gl.depthFunc(GL.LESS);
      gl.depthRange(0, 1);

      // set polygon vertex order convention
      // gl.frontFace(GL.CW) // webgl defaults to a counterclockwise vertex order, consider switching to it

      // don't render both sides of a triangle (it's dependent on the cw/ccw convention set above)
      flagSet(gl, GL.CULL_FACE, true);
      gl.cullFace(GL.BACK);

      // hints
      gl.hint(GL.FRAGMENT_SHADER_DERIVATIVE_HINT, GL.NICEST); // doesn't seem to make a difference on OS X
    }

    // depth test means that pixels from a triangle do not paint over preexisting pixels coming from triangles that are closer to the viewer
    if (depthTest !== currentDepthTests.get(gl)) {
      currentDepthTests.set(gl, depthTest);
      flagSet(gl, GL.DEPTH_TEST, depthTest);
    }

    flagSet(gl, GL.BLEND, blend);

    if (program !== currentPrograms.get(gl)) {
      currentPrograms.set(gl, program);
      gl.useProgram(program);
    }

    if (vao) bindVertexArray(gl, vao);

    if (viewport) setViewport(gl, viewport.x, viewport.y, viewport.width, viewport.height);
    if (uniformValues) uniforms.forEach((setValue, name) => uniformValues[name] && setValue(uniformValues[name]));

    bindFramebuffer(gl, GL_DRAW_FRAMEBUFFER, target);

    if (clear) clearRect(gl, clear);

    if (draw) {
      // constrain clearing to a rectangle if needed
      flagSet(gl, GL.SCISSOR_TEST, scissor !== undefined); // allow operation in a specific rectangular area
      if (scissor) {
        setScissor(gl, ...scissor); // only operate in this rectangle
      }

      gl.drawArraysInstanced(draw.geom, draw.offset, draw.count, draw.instanceCount || 1);
    }
  };
};

/****************
 * Misc
 ***************/

const pickPixel = new Uint8Array(4);

/** @internal */
export const readPixel = (gl: WebGL2RenderingContext, canvasX: GLint, canvasY: GLint) => {
  gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickPixel); // todo use bound FB/texture values to determine the 5th and 6th args
  return pickPixel;
};

const templateConcat = (strings: TemplateStringsArray, ...args: unknown[]) =>
  strings
    .map((s, i) => `${s}${args[i] ?? ''}`)
    .join('')
    .trim();

/** @internal */
export const vert = (strings: TemplateStringsArray, ...args: unknown[]) => `#version 300 es
#pragma STDGL invariant(all)
precision highp int;
precision highp float;
${templateConcat(strings, ...args)}`;

/** @internal */
export const frag = (strings: TemplateStringsArray, ...args: unknown[]) => `#version 300 es
precision highp int;
precision highp float;
${templateConcat(strings, ...args)}`;
