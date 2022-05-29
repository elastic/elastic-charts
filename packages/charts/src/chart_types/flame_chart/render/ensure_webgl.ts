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
import { attributeLocations, colorFrag, roundedRectVert, roundedRectFrag, simpleRectVert } from '../shaders';
import { GLResources, NULL_GL_RESOURCES } from '../types';

function blockUniforms(
  gl: WebGL2RenderingContext,
  uboVariableNames: string[],
  [program, ...otherPrograms]: WebGLProgram[],
) {
  const blockIndex = gl.getUniformBlockIndex(program, 'Settings');
  const blockSize = gl.getActiveUniformBlockParameter(program, blockIndex, GL.UNIFORM_BLOCK_DATA_SIZE);
  const uboBuffer = gl.createBuffer();
  if (uboBuffer === null) throw new Error('Whoa, could not create uboBuffer');
  gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
  // gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uboBuffer);
  const uboVariableIndices = gl.getUniformIndices(program, uboVariableNames);
  if (uboVariableIndices === null) throw new Error('Whoa, could not get uboVariableIndices');
  const uboVariableOffsets = gl.getActiveUniforms(program, uboVariableIndices, gl.UNIFORM_OFFSET);
  const uniforms = new Map(
    uboVariableNames.map((name, i) => [name, { index: uboVariableIndices[i], offset: uboVariableOffsets[i] }]),
  );

  // per program part
  [program, ...otherPrograms].forEach((p) => gl.uniformBlockBinding(p, gl.getUniformBlockIndex(p, 'Settings'), 0));

  return { uboBuffer, uniforms };
}

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
   * Uniform blocks
   */

  const uboVariableNames = [
    'focus',
    'resolution',
    'gapPx',
    'minFillRatio',
    'rowHeight0',
    'rowHeight1',
    't',
    'cornerRadiusPx',
    'hoverIndex',
    'pickLayer',
  ];

  const { uboBuffer, uniforms } = blockUniforms(gl, uboVariableNames, [geomProgram, pickProgram]);

  /**
   * Resource allocation: Render setup
   */

  // couple the program with the attribute input and global GL flags
  const roundedRectRenderer = getRenderer(gl, geomProgram, uniforms, uboBuffer, vao, { depthTest: false, blend: true });
  const pickTextureRenderer = getRenderer(gl, pickProgram, uniforms, uboBuffer, vao, {
    depthTest: false,
    blend: false,
  });

  const attributes = getAttributes(gl, geomProgram, attributeLocations);

  return { roundedRectRenderer, pickTextureRenderer, attributes };
}
