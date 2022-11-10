/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Logger } from '../utils/logger';
import { GL } from './webgl_constants';

const GL_DEBUG = true; // to be set to false once GL charts are in non-alpha and broad use for 6-12 months or earlier if perf constrained

/**************
 * Types
 *************/

// there are two shader types
type ShaderType = typeof GL.FRAGMENT_SHADER | typeof GL.VERTEX_SHADER;

// a data structure that maps each uniform name (string) to a value setter for that uniform
type UniformsMap = Map<string, (...args: any[]) => void>;

// we can use a frame buffer (the Canvas itself, or a texture) for reading, writing or both
type FrameBufferTarget = typeof GL.READ_FRAMEBUFFER | typeof GL.DRAW_FRAMEBUFFER | typeof GL.FRAMEBUFFER;

// samplers (texture samplers) act as uniforms; `setUniform` sets the desired texture for the shader code to read (sample) from
interface Sampler {
  setUniform: (location: WebGLUniformLocation) => void;
}

/**
 * Clearing can be constrained to a rectangle; not just the color buffer but the depth buffer may also be cleared
 * One role of the depth buffer (z-buffer) is to keep track of the Z coordinate closest to the viewer for each pixel on the screen
 * as it can be used to reject future pixel (fragment) shading that would be beneath this and would be invisible anyway
 * The stencil buffer may also be cleared simultaneously https://en.wikipedia.org/wiki/Stencil_buffer
 */
interface ClearInfo {
  rect?: [number, number, number, number];
  color?: [number, number, number, number];
  depth?: number;
  stencilIndex?: number;
}

// A tuple of texture data for functions like `gl.texImage2D` and `gl.texParameteri` - metadata of a texture
interface TextureSpecification {
  textureIndex: GLuint; // used for identifying the specific texture in a `gl.activeTexture` setter call
  internalFormat: GLuint; // colors and bits per color https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
  width: GLuint; // texture width in pixels
  height: GLuint; // texture height in pixels
  data: ArrayBufferView | null; // the buffer containing the actual pixel grid
  min?: GLuint; // when using texture for data lookup, we usually want the nearest exact value, rather than interpolated or aggregated
  mag?: GLuint; // when using texture for data lookup, we usually want the nearest exact value, rather than interpolated or aggregated
}

/** @internal */
export interface Texture {
  clear: () => void;
  setUniform: (location: WebGLUniformLocation) => void;
  target: () => WebGLFramebuffer | null;
  delete: () => void;
  width: number;
  height: number;
}

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
export type Attributes = Map<string, (data: ArrayBufferView) => void>;

/** @internal */
export type Render = (u: UseInfo) => void;

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
export const createCompiledShader = (
  gl: WebGL2RenderingContext,
  shaderType: ShaderType,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(shaderType);
  if (!shader) throw new Error(`kinGLy exception: shader could not be created`); // just appeasing the TS linter
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (GL_DEBUG && !gl.getShaderParameter(shader, GL.COMPILE_STATUS) && !gl.isContextLost()) {
    const shaderTypeName = shaderType === GL.VERTEX_SHADER ? 'vertex' : 'fragment';
    Logger.warn(`kinGLy exception: compilation error in a ${shaderTypeName} shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
};

/** @internal */
export const createLinkedProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  attributeLocations: Record<string, number>,
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) throw new Error(`kinGLy exception: shader program could not be created`); // just appeasing the TS linter https://www.khronos.org/webgl/wiki/HandlingContextLost
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  if (GL_DEBUG && gl.getProgramParameter(program, GL.ATTACHED_SHADERS) !== 2)
    Logger.warn('kinGLy exception: did not manage to attach the two shaders');

  Object.entries(attributeLocations).forEach(([name, i]) => gl.bindAttribLocation(program, i, name));

  gl.linkProgram(program); // todo consider bulk gl.compileShader iteration, followed by bulk gl.linkProgram iteration https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/

  if (GL_DEBUG) {
    if (!gl.getProgramParameter(program, GL.LINK_STATUS) && !gl.isContextLost())
      Logger.warn(`kinGLy exception: shader program failed to link: ${gl.getProgramInfoLog(program)}`);
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, GL.LINK_STATUS) && !gl.isContextLost())
      Logger.warn(`kinGLy exception: could not validate the shader program: ${gl.getProgramInfoLog(program)}`);
  } else {
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

/*********************
 * Singular uniforms
 ********************/

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
  [GL.SAMPLER_2D]:
    (gl: WebGL2RenderingContext, location: WebGLUniformLocation) =>
    ({ setUniform }: Sampler) => {
      if (locationUniformValues.get(location) !== setUniform) {
        setUniform(location);
        locationUniformValues.set(location, setUniform);
      }
    },
};

const getUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram): UniformsMap => {
  if (programUniforms.has(program)) return programUniforms.get(program);
  const uniforms = new Map(
    [...new Array(gl.getProgramParameter(program, GL.ACTIVE_UNIFORMS /* uniform count */))].flatMap((_, index) => {
      const activeUniform = gl.getActiveUniform(program, index);
      if (!activeUniform) {
        Logger.warn(`kinGLy exception: active uniform not found`);
        return [];
      }
      const { name, type } = activeUniform;
      const location = gl.getUniformLocation(program, name);
      if (location === null) {
        Logger.warn(`kinGLy exception: uniform location ${location} (name: ${name}, type: ${type}) not found`); // just appeasing the TS linter
        return [];
      }
      const setValue = location ? uniformSetterLookup[type](gl, location) : () => {};
      if (GL_DEBUG && !setValue) {
        Logger.warn(`kinGLy exception: no setValue for uniform GL[${type}] (name: ${name}) implemented yet`);
        return [];
      }
      return [[name, setValue]];
    }),
  );
  programUniforms.set(program, uniforms);
  return uniforms;
};

/**************
 * Clearing
 *
 * Clears the color, depth and/or stencil index of the canvas or a rectangular area
 * @internal
 *************/
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
export const bindFramebuffer = (
  gl: WebGL2RenderingContext,
  target: FrameBufferTarget,
  targetFrameBuffer: WebGLFramebuffer | null,
) => {
  const updateReadTarget =
    (target === GL.READ_FRAMEBUFFER || target === GL.FRAMEBUFFER) &&
    targetFrameBuffer !== currentReadFrameBuffers.get(gl);
  const updateWriteTarget =
    (target === GL.DRAW_FRAMEBUFFER || target === GL.FRAMEBUFFER) &&
    targetFrameBuffer !== currentDrawFrameBuffers.get(gl);

  if (updateReadTarget) currentReadFrameBuffers.set(gl, targetFrameBuffer);
  if (updateWriteTarget) currentDrawFrameBuffers.set(gl, targetFrameBuffer);

  if (updateReadTarget || updateWriteTarget) {
    const targetToUpdate =
      updateReadTarget && updateWriteTarget
        ? GL.FRAMEBUFFER
        : updateReadTarget
        ? GL.READ_FRAMEBUFFER
        : GL.DRAW_FRAMEBUFFER;
    gl.bindFramebuffer(targetToUpdate, targetFrameBuffer);
  }
};

/** @internal */
export const NullTexture: Texture = {
  clear: () => {},
  setUniform: () => {},
  target: () => null,
  delete: () => {},
  width: 0,
  height: 0,
};

/** @internal */
export const createTexture = (
  gl: WebGL2RenderingContext,
  { textureIndex, internalFormat, width, height, data, min = GL.NEAREST, mag = GL.NEAREST }: TextureSpecification,
): Texture => {
  if (GL_DEBUG && !(0 <= textureIndex && textureIndex <= gl.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS)))
    Logger.warn(
      'kinGLy exception: WebGL2 is guaranteed to support at least 32 textures but not necessarily more than that',
    );

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
      Logger.warn(`kinGLy exception: failed to set the texture with texImage2D, code ${error}`);
  }

  let frameBuffer: WebGLFramebuffer | null = null; // caching the target framebuffer

  const getTarget = () => {
    if (!frameBuffer) {
      frameBuffer = gl.createFramebuffer();
      bindFramebuffer(gl, GL.DRAW_FRAMEBUFFER, frameBuffer);
      gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
      if (GL_DEBUG) {
        const framebufferStatus = gl.checkFramebufferStatus(GL.DRAW_FRAMEBUFFER);
        if (framebufferStatus !== GL.FRAMEBUFFER_COMPLETE) {
          Logger.warn(`kinGLy exception: target framebuffer is not complete`);
        }
      }
    }
    return frameBuffer;
  };

  return {
    clear: () => {
      bindFramebuffer(gl, GL.DRAW_FRAMEBUFFER, getTarget());
      clearRect(gl, { color: [0, 0, 0, 0] }); // alternatives: texImage2D/texSubImage2D/render
    },
    setUniform: (location: WebGLUniformLocation) => gl.uniform1i(location, textureIndex),
    target: getTarget,
    delete: (): true => {
      if (frameBuffer) {
        if (currentReadFrameBuffers.get(gl) === frameBuffer) bindFramebuffer(gl, GL.READ_FRAMEBUFFER, null);
        if (currentDrawFrameBuffers.get(gl) === frameBuffer) bindFramebuffer(gl, GL.DRAW_FRAMEBUFFER, null);
        gl.deleteFramebuffer(frameBuffer);
      }
      gl.deleteTexture(texture);
      return true; // success
    },
    width,
    height,
  };
};

const pickPixel = new Uint8Array(4);

/** @internal */
export const readPixel = (gl: WebGL2RenderingContext, canvasX: GLint, canvasY: GLint) => {
  gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickPixel); // todo use bound FB/texture values to determine the 5th and 6th args
  return pickPixel;
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
  attributeLocations: Record<string, GLuint>,
): Attributes =>
  new Map(
    [...new Array(gl.getProgramParameter(program, GL.ACTIVE_ATTRIBUTES) /* attributesCount */)].map((_, index) => {
      const normalize = false; // don't normalize the data
      const stride = 0; // default 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset = 0; // start at the beginning of the buffer

      const activeAttribInfo = gl.getActiveAttrib(program, index);
      if (!activeAttribInfo) throw new Error(`kinGLy exception: active attribute info could not be read`); // just appeasing the TS linter
      const { name, type } = activeAttribInfo;
      if (name.startsWith('gl_')) return [name, () => {}]; // only populate expressly supplied attributes, NOT gl_VertexID or gl_InstanceID

      const location = attributeLocations[name];
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
export const getRenderer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vao: WebGLVertexArrayObject | null,
  { depthTest = false, blend = true, frontFace = GL.CCW },
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
      gl.frontFace(frontFace);

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
    if (uniformValues) {
      uniforms.forEach((setValue, name) => uniformValues[name] && setValue(uniformValues[name]));
    }

    bindFramebuffer(gl, GL.DRAW_FRAMEBUFFER, target);

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

/***********************
 *
 * Handle context loss
 *
 **********************/

/*
const flushErrors = (gl: WebGL2RenderingContext, text: string) => {
  let hasError;
  let hasShownError = false;
  do {
    const error = gl.getError();
    hasError = error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL;
    if (hasError) {
      if (!hasShownError) {
        // eslint-disable-next-line no-console
        console.warn(`GL error(s) shown before ${text}`);
        hasShownError = true;
      }
      // eslint-disable-next-line no-console
      console.warn(`GL error: ${error}`);
    }
  } while (hasError); // clear the error code
};
*/

/** @internal */
export const testContextLoss = (gl: WebGL2RenderingContext) => {
  // simulates a context loss at `lossTimeMs` and context recovery at `regainTimeMs` after that
  const lossTimeMs = 5000;
  const regainTimeMs = 0;
  const ext = gl.getExtension('WEBGL_lose_context');
  if (ext) {
    window.setInterval(() => {
      // eslint-disable-next-line no-console
      console.log('Context loss test triggered, the webgl rendering will freeze or disappear');
      ext.loseContext();
      window.setTimeout(() => ext.restoreContext(), regainTimeMs);
    }, lossTimeMs);
  }
};
