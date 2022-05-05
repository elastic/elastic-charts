/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  bindFramebuffer,
  bindVertexArray,
  createCompiledShader,
  createLinkedProgram,
  getAttributes,
  getRenderer,
  GL_FRAGMENT_SHADER,
  GL_READ_FRAMEBUFFER,
  GL_VERTEX_SHADER,
  readPixel,
  Texture,
} from '../../../common/kingly';
import { colorFrag, GEOM_INDEX_OFFSET, rectVert, roundedRectFrag } from '../shaders';
import { ColumnarViewModel, GLResources, PickFunction } from '../types';

/** @internal */
export function ensureWebgl(
  gl: WebGL2RenderingContext,
  glResources: GLResources,
  columnarViewModel: ColumnarViewModel,
  textureTarget: Texture['target'],
): GLResources {
  const readPixelXY: PickFunction = (x, y) => {
    if (gl) {
      bindFramebuffer(gl, GL_READ_FRAMEBUFFER, textureTarget());
      const pixel = readPixel(gl, x, y);
      const found = pixel[0] + pixel[1] + pixel[2] + pixel[3] > 0;
      const datumIndex = found
        ? pixel[3] + 256 * (pixel[2] + 256 * (pixel[1] + 256 * pixel[0])) - GEOM_INDEX_OFFSET
        : NaN;
      return Number.isNaN(datumIndex) ? NaN : datumIndex;
    } else {
      return NaN;
    }
  };

  /**
   * Vertex array attributes
   */

  const columnarGeomData: ColumnarViewModel = columnarViewModel;

  const instanceAttributes = Object.keys(columnarGeomData);
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
    const value = columnarGeomData[key as keyof ColumnarViewModel];
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
    columnarGeomData,
    roundedRectRenderer,
    pickTextureRenderer,
    deallocateResources,
    vao,
    geomProgram,
    pickProgram,
    readPixelXY,
  };
}
