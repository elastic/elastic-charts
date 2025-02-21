/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  bindVertexArray,
  createCompiledShader,
  createLinkedProgram,
  getAttributes,
  getRenderer,
  resetState,
} from '../../../common/kingly';
import { GL } from '../../../common/webgl_constants';
import { attributeLocations, colorFrag, roundedRectFrag, roundedRectVert, simpleRectVert } from '../shaders';
import type { GLResources } from '../types';
import { NULL_GL_RESOURCES } from '../types';

/** @internal */
export function ensureWebgl(
  gl: WebGL2RenderingContext,
  instanceAttributes: Array<keyof typeof attributeLocations>,
): GLResources {
  resetState(gl);

  /**
   * Vertex array attributes
   */

  const vao = gl.createVertexArray();
  if (!vao) return NULL_GL_RESOURCES;

  bindVertexArray(gl, vao);

  // by how many instances should each attribute advance?
  instanceAttributes.forEach((name) => gl.vertexAttribDivisor(attributeLocations[name], 1));

  /**
   * Programs
   */

  const geomProgram = createLinkedProgram(
    gl,
    createCompiledShader(gl, GL.VERTEX_SHADER, roundedRectVert),
    createCompiledShader(gl, GL.FRAGMENT_SHADER, roundedRectFrag),
    attributeLocations,
  );

  const pickProgram = createLinkedProgram(
    gl,
    createCompiledShader(gl, GL.VERTEX_SHADER, simpleRectVert),
    createCompiledShader(gl, GL.FRAGMENT_SHADER, colorFrag),
    attributeLocations,
  );

  /**
   * Resource allocation: Render setup
   */

  // couple the program with the attribute input and global GL flags
  const roundedRectRenderer = getRenderer(gl, geomProgram, vao, { depthTest: false, blend: true });
  const pickTextureRenderer = getRenderer(gl, pickProgram, vao, { depthTest: false, blend: false });

  const attributes = getAttributes(gl, geomProgram, attributeLocations);

  return { roundedRectRenderer, pickTextureRenderer, attributes };
}
