/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { frag, vert } from '../../common/kingly';

/** @internal */
export const GEOM_INDEX_OFFSET = 1; // zero color means, empty area (no rectangle) so the rectangles are base 1 indexed for pick coloring

/** @internal */
export const rectVert = /* language=GLSL */ vert`
  in vec2 position0, position1;
  in float size0, size1;
  in vec4 color;

  uniform bool pickLayer;
  uniform float t; // 0: start position; 1: end position
  uniform vec2 resolution;
  uniform vec2 gapPx;
  // at least this ratio of the rectangle's full width/height must be filled, else the pixel gap eats small rectangles:
  uniform vec2 minFillRatio;
  uniform float cornerRadiusPx;
  uniform float rowHeight0, rowHeight1;
  uniform mat2 focus; // [[focusLoX, focusHiX], [focusLoY, focusHiY]]
  uniform int hoverIndex;

  out vec4 fragmentColor;
  out vec2 corners[4];
  out float radiusPx;

  const vec4 UNIT4 = vec4(1.0);
  const uvec4 BIT_SHIFTERS = uvec4(24, 16, 8, 0); // helps pack a 32bit unsigned integer into the RGBA bytes
  const float HOVER_OPACITY = 0.382; // arbitrary; set to the smaller part of the golden ratio
  const int GEOM_INDEX_OFFSET = ${GEOM_INDEX_OFFSET};

  void main() {
    // calculate the basic geometry invariant of gaps, rounding or zoom levels
    int x = gl_VertexID & 1;        // x yields 0, 1, 0, 1 for gl_VertexID 0, 1, 2, 3
    int y = (gl_VertexID >> 1) & 1; // y yields 0, 0, 1, 1 for gl_VertexID 0, 1, 2, 3
    int datumIndex = gl_VertexID >> 2; // integer division by 2^2, as each geom is represented with 4 vertices
    vec2 unitSquareCoord = vec2(x, y);
    vec2 position = mix(position0, position1, t);
    vec2 size = mix(vec2(size0, rowHeight0), vec2(size1, rowHeight1), t);
    vec2 withGapXY = size * unitSquareCoord;

    // determine what we're zooming/panning into
    vec2 focusX = focus[0];
    vec2 focusY = focus[1];
    float viewableX = focusX[1] - focusX[0];
    float viewableY = focusY[1] - focusY[0];
    vec2 viewable = vec2(viewableX, viewableY);
    vec2 zoomedResolution = resolution / viewable;

    // calculate the gap-aware geometry
    vec2 gapRatio = gapPx / zoomedResolution;
    // gl_VertexID iterates as an integer index 0, 1, 2, ..., (offset + 0, offset + 1, ..., offset + count - 1)
    // these four coordinates form a rectangle, set up as two counterclockwise triangles with gl.TRIANGLE_STRIP
    // clip coordinate x/y goes from -1 to 1 of the viewport, so we center with this 0.5 subtraction
    vec2 xy = withGapXY - min(gapRatio, (1.0 - minFillRatio) * withGapXY) * sign(unitSquareCoord) + position;
    vec2 pan = vec2(focusX[0], focusY[0]);
    vec2 zoomPannedXY = (xy - pan) / viewable;

    // output the position and color values (approx. return values of our vertex shader)
    // project [0, 1] normalized values to [-1, 1] homogeneous clip space values
    gl_Position = vec4(2.0 * zoomPannedXY - 1.0, 0, 1);
    fragmentColor = pickLayer
      ? vec4((uvec4(gl_InstanceID + GEOM_INDEX_OFFSET) >> BIT_SHIFTERS) % uvec4(256)) / 255.0
      : vec4(color.rgb / (gl_InstanceID == hoverIndex - GEOM_INDEX_OFFSET ? HOVER_OPACITY : 1.0),  color.a);

    // calculate rounded corner metrics for interpolation
    vec2 pixelSize = size * zoomedResolution;
    radiusPx = min(cornerRadiusPx, 0.5 * min(pixelSize.x, pixelSize.y));

    // output the corner helper values  (approx. return values of our vertex shader)
    corners[0] = vec2(x, y) * size * zoomedResolution - radiusPx;
    corners[1] = vec2(1 - x, y) * size * zoomedResolution - radiusPx;
    corners[2] = vec2(x, 1 - y) * size * zoomedResolution - radiusPx;
    corners[3] = vec2(1 - x, 1 - y) * size * zoomedResolution - radiusPx;
  }`;

/** @internal */
export const roundedRectFrag = /* language=GLSL */ frag`
  in vec4 fragmentColor;
  in vec2 corners[4];
  in float radiusPx;

  out vec4 fragColor;

  void main() {
    // rounded corners: discard pixels that lie beyond each corner "circle" in the quadrant beyond its respective corner
    for(int i = 0; i < 4; i++) {
      vec2 corner = corners[i];
      if(corner.x < 0.0 && corner.y < 0.0 && length(corner) > radiusPx) discard;
    }
    fragColor = fragmentColor;
  }`;

/** @internal */
export const colorFrag = /* language=GLSL */ frag`
  in vec4 fragmentColor;
  out vec4 fragColor;
  void main() { fragColor = fragmentColor; }`;
