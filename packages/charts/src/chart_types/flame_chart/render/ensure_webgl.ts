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
import { colorFrag, rectVert, roundedRectFrag } from '../shaders';
import { ColumnarViewModel, GLResources } from '../types';

/** @internal */
export function ensureWebgl(
  gl: WebGL2RenderingContext,
  glResources: GLResources,
  columnarViewModel: ColumnarViewModel,
): GLResources {
  /**
   * Vertex array attributes
   */

  const instanceAttributes = Object.keys(columnarViewModel);
  const attributeLocations = new Map(instanceAttributes.map((name, i: GLuint) => [name, i]));

  const vao = glResources.vao || gl.createVertexArray();
  if (!vao) return glResources;

  bindVertexArray(gl, vao);

  // by how many instances should each attribute advance?
  instanceAttributes.forEach((name) => {
    const attributeLocation = attributeLocations.get(name);
    if (typeof attributeLocation === 'number') gl.vertexAttribDivisor(attributeLocation, 1);
  });

  /**
   * Programs
   */

  const geomProgram =
    glResources.geomProgram ||
    createLinkedProgram(
      gl,
      createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
      createCompiledShader(gl, GL_FRAGMENT_SHADER, roundedRectFrag),
      attributeLocations,
    );

  const pickProgram =
    glResources.pickProgram ||
    createLinkedProgram(
      gl,
      createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
      createCompiledShader(gl, GL_FRAGMENT_SHADER, colorFrag),
      attributeLocations,
    );

  /**
   * Resource allocation: Render setup
   */

  // fill attribute values
  getAttributes(gl, geomProgram, attributeLocations).forEach((setValue, key) => {
    const value = columnarViewModel[key as keyof ColumnarViewModel];
    if (value instanceof Float32Array) setValue(value);
  });

  // couple the program with the attribute input and global GL flags
  const roundedRectRenderer = getRenderer(gl, geomProgram, vao, { depthTest: false, blend: true });
  const pickTextureRenderer = getRenderer(gl, pickProgram, vao, { depthTest: false, blend: false }); // must not blend the texture, else the pick color thus datumIndex will be wrong

  /**
   * Resource allocation: Texture
   */

  // eslint-disable-next-line no-shadow
  const deallocateResources = ({ vao, geomProgram, pickProgram }: GLResources) => {
    if (gl) {
      if (geomProgram) {
        getAttributes(gl, geomProgram, attributeLocations).forEach((setValue) => setValue(new Float32Array())); // set buffers to zero length
      }

      gl.deleteVertexArray(vao);
      gl.deleteProgram(geomProgram);
      gl.deleteProgram(pickProgram);
    }
  };

  return {
    roundedRectRenderer,
    pickTextureRenderer,
    deallocateResources,
    vao,
    geomProgram,
    pickProgram,
  };
}
