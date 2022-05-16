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
  GL_FRAGMENT_SHADER,
  GL_VERTEX_SHADER,
} from '../../../common/kingly';
import { ColumnarViewModel } from '../flame_api';
import { colorFrag, rectVert, roundedRectFrag } from '../shaders';
import { GLResources } from '../types';

/** @internal */
export function ensureWebgl(gl: WebGL2RenderingContext, columnarViewModel: ColumnarViewModel): GLResources {
  /**
   * Vertex array attributes
   */

  const vao = gl.createVertexArray();
  if (!vao) return { roundedRectRenderer: () => {}, pickTextureRenderer: () => {} };

  bindVertexArray(gl, vao);

  const instanceAttributes = Object.keys(columnarViewModel);
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

  // fill attribute values
  getAttributes(gl, geomProgram, attributeLocations).forEach((setValue, key) => {
    const value = columnarViewModel[key as keyof ColumnarViewModel];
    if (value instanceof Float32Array) setValue(value);
  });

  return { roundedRectRenderer, pickTextureRenderer };
}
