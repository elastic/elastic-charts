"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorFrag = exports.roundedRectFrag = exports.roundedRectVert = exports.simpleRectVert = exports.GEOM_INDEX_OFFSET = exports.attributeLocations = void 0;
exports.attributeLocations = {
    position0: 0,
    position1: 1,
    size0: 2,
    size1: 3,
    color: 4,
};
exports.GEOM_INDEX_OFFSET = 1;
const vertTop = `#version 300 es
  #pragma STDGL invariant(all)
  precision highp int;
  precision highp float;
`;
const fragTop = `#version 300 es
  precision highp int;
  precision highp float;
`;
const attribDefs = `
  layout(location=${exports.attributeLocations.position0}) in vec2 position0;
  layout(location=${exports.attributeLocations.position1}) in vec2 position1;
  layout(location=${exports.attributeLocations.size0}) in float size0;
  layout(location=${exports.attributeLocations.size1}) in float size1;
  layout(location=${exports.attributeLocations.color}) in vec4 color;
`;
const uniformDefs = `
  uniform mat4 focus; // [[focusLoX, focusHiX], [focusLoY, focusHiY]]
  uniform vec2 resolution;
  uniform vec2 gapPx;
  uniform vec2 minFillRatio; // at least this ratio of the rectangle's full width/height must be filled
  uniform float rowHeight0;
  uniform float rowHeight1;
  uniform float nodeTweenTime; // 0: start position; 1: end position
  uniform float cornerRadiusPx;
  uniform float hoverIndex;
  uniform float wobbleIndex;
  uniform float wobble;
  uniform bool pickLayer;
`;
const constants = `
  const vec4 UNIT4 = vec4(1.0);
  const uvec4 BIT_SHIFTERS = uvec4(24, 16, 8, 0); // helps pack a 32bit unsigned integer into the RGBA bytes
  const float HOVER_OPACITY = 0.382; // arbitrary; set to the smaller part of the golden ratio
  const int GEOM_INDEX_OFFSET = ${exports.GEOM_INDEX_OFFSET};
`;
const structGeom = `
  struct Geom {
    vec2 unitSquareCoord;
    vec2 size;
    vec4 glPosition;
    vec4 fragmentColor;
  };
`;
const getViewable = `
  vec2 getViewable() {
    float viewableX = focus[0][1] - focus[0][0];
    float viewableY = focus[1][1] - focus[1][0];
    return vec2(viewableX, viewableY);
  }
`;
const getGeom = `
  Geom getGeom(vec2 viewable, vec2 gap, vec2 maxGapRatio) {
    // calculate the basic geometry invariant of gaps, rounding or zoom levels
    int x = gl_VertexID & 1;        // x yields 0, 1, 0, 1 for gl_VertexID 0, 1, 2, 3
    int y = (gl_VertexID >> 1) & 1; // y yields 0, 0, 1, 1 for gl_VertexID 0, 1, 2, 3
    vec2 unitSquareCoord = vec2(x, y);
    vec2 position = mix(position0, position1, nodeTweenTime);
    vec2 size = mix(vec2(size0, rowHeight0), vec2(size1, rowHeight1), nodeTweenTime);
    vec2 fullSizeXY = size * unitSquareCoord;

    // determine what we're zooming/panning into
    vec2 baseXY = fullSizeXY + position;
    vec2 pan = vec2(focus[0][0], focus[1][0]);

    // gl_VertexID iterates as an integer index 0, 1, 2, ..., (offset + 0, offset + 1, ..., offset + count - 1)
    // these four coordinates form a rectangle, set up as two counterclockwise triangles with gl.TRIANGLE_STRIP
    // clip coordinate x/y goes from -1 to 1 of the viewport, so we center with this 0.5 subtraction
    vec2 gr = min(gap, maxGapRatio * fullSizeXY);
    vec2 xy = baseXY - unitSquareCoord * gr;
    vec2 zoomPannedXY = (xy - pan) / viewable;

    // output the position and color values (approx. return values of our vertex shader)
    // project [0, 1] normalized values to [-1, 1] homogeneous clip space values
    vec4 glPosition = vec4(2.0 * zoomPannedXY - 1.0, 0, 1);

    vec4 fragmentColor = pickLayer
      ? vec4((uvec4(gl_InstanceID + GEOM_INDEX_OFFSET) >> BIT_SHIFTERS) % uvec4(256)) / 255.0
      : vec4(
          color.rgb,
          color.a
            * (gl_InstanceID == int(hoverIndex) - GEOM_INDEX_OFFSET ? HOVER_OPACITY : 1.0)
            * (gl_InstanceID == int(wobbleIndex) - GEOM_INDEX_OFFSET && wobble > 0.0 ? 1.0 - wobble : 1.0)
        );

    return Geom(
      unitSquareCoord,
      size,
      glPosition,
      fragmentColor
    );
  }
`;
exports.simpleRectVert = `${vertTop}
  ${attribDefs}
  ${uniformDefs}

  out vec4 fragmentColor;

  ${constants}
  ${structGeom}
  ${getViewable}
  ${getGeom}

  void main() {
    Geom g = getGeom(getViewable(), vec2(0), vec2(0));
    gl_Position = g.glPosition;
    fragmentColor = g.fragmentColor;
  }
`;
exports.roundedRectVert = `${vertTop}
  ${attribDefs}
  ${uniformDefs}

  out vec4 fragmentColor;
  out vec2 corners[4];
  out float radiusPx;

  ${constants}
  ${structGeom}
  ${getViewable}
  ${getGeom}

  void main() {
    vec2 viewable = getViewable();

    // calculate the gap-aware geometry
    vec2 zoomedResolution = resolution / viewable;
    vec2 gap = gapPx / zoomedResolution;

    vec2 maxGapRatio = 1.0 - minFillRatio;
    Geom g = getGeom(viewable, gap, maxGapRatio);

    gl_Position = g.glPosition;
    fragmentColor = g.fragmentColor;

    // calculate rounded corner metrics for interpolation
    vec2 pixelSize = g.size * zoomedResolution;
    radiusPx = min(cornerRadiusPx, 0.5 * min(pixelSize.x, pixelSize.y));

    // output the corner helper values  (approx. return values of our vertex shader)
    corners[0] = g.unitSquareCoord * g.size * zoomedResolution - radiusPx;
    corners[1] = (g.unitSquareCoord * vec2(-1, 1) + vec2(1, 0)) * g.size * zoomedResolution - radiusPx;
    corners[2] = (g.unitSquareCoord * vec2(1, -1) + vec2(0, 1)) * g.size * zoomedResolution - radiusPx;
    corners[3] = (1.0 - g.unitSquareCoord) * g.size * zoomedResolution - radiusPx;
  }
`;
exports.roundedRectFrag = `${fragTop}
  in vec4 fragmentColor;
  in vec2 corners[4];
  in float radiusPx;

  out vec4 fragColor;

  void main() {
    if((   min(0.0, sign(corners[0].x) + sign(corners[0].y) + sign(radiusPx - length(corners[0])) + 2.0)
         + min(0.0, sign(corners[1].x) + sign(corners[1].y) + sign(radiusPx - length(corners[1])) + 2.0)
         + min(0.0, sign(corners[2].x) + sign(corners[2].y) + sign(radiusPx - length(corners[2])) + 2.0)
         + min(0.0, sign(corners[3].x) + sign(corners[3].y) + sign(radiusPx - length(corners[3])) + 2.0)
       ) < 0.0) discard;
    fragColor = fragmentColor;
  }
`;
exports.colorFrag = `${fragTop}
  in vec4 fragmentColor;
  out vec4 fragColor;
  void main() { fragColor = fragmentColor; }
`;
//# sourceMappingURL=shaders.js.map