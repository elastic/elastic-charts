/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  Attributes,
  bindVertexArray,
  createCompiledShader,
  createLinkedProgram,
  getAttributes,
  getRenderer,
  GL_FRAGMENT_SHADER,
  GL_VERTEX_SHADER,
} from '../../../common/kingly';
import { ColumnarViewModel } from '../flame_api';
import { colorFrag, rectVert, roundedRectFrag } from '../shaders';
import { GLResources, NULL_GL_RESOURCES } from '../types';

/** @internal */
export function ensureWebgl(gl: WebGL2RenderingContext, instanceAttributes: string[]): GLResources {
  /**
   * Vertex array attributes
   */

  const vao = gl.createVertexArray();
  if (!vao) return NULL_GL_RESOURCES;

  bindVertexArray(gl, vao);

  const attributeLocations = new Map(instanceAttributes.map((name, i: GLuint) => [name, i]));

  // by how many instances should each attribute advance?
  instanceAttributes.forEach((name) => {
    const attributeLocation = attributeLocations.get(name);
    if (typeof attributeLocation === 'number') gl.vertexAttribDivisor(attributeLocation, 1);
  });

  /**
   * Programs
   */

  const geomProgram = createLinkedProgram(
    gl,
    createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
    createCompiledShader(gl, GL_FRAGMENT_SHADER, roundedRectFrag),
    attributeLocations,
  );

  const pickProgram = createLinkedProgram(
    gl,
    createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
    createCompiledShader(gl, GL_FRAGMENT_SHADER, colorFrag),
    attributeLocations,
  );

  /**
   * Resource allocation: Render setup
   */

  // couple the program with the attribute input and global GL flags
  const roundedRectRenderer = getRenderer(gl, geomProgram, vao, { depthTest: false, blend: true });
  const pickTextureRenderer = getRenderer(gl, pickProgram, vao, { depthTest: false, blend: false }); // must not blend the texture, else the pick color thus datumIndex will be wrong

  const attributes = getAttributes(gl, geomProgram, attributeLocations);

  return { roundedRectRenderer, pickTextureRenderer, attributes };
}

/** @internal */
export function uploadToWebgl(
  gl: WebGL2RenderingContext,
  attributes: Attributes,
  columnarViewModel: ColumnarViewModel,
) {
  attributes.forEach((setValue, key) => {
    const value = columnarViewModel[key as keyof ColumnarViewModel];
    if (value instanceof Float32Array) setValue(value);
  });
}
