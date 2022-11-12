/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const attributeLocations = {
  v0: 0,
  v1: 1,
  v2: 2,
  v3: 3,
  v4: 4,
  v5: 5,
  v6: 6,
  v7: 7,
  v8: 8,
  v9: 9,
  va: 10,
  vb: 11,
  vc: 12,
  vd: 13,
  ve: 14,
  vf: 15,
};

const vertTop = /* language=GLSL */ `#version 300 es
  #pragma STDGL invariant(all)
  precision highp int;
  precision highp float;
`;

const fragTop = /* language=GLSL */ `#version 300 es
  precision highp int;
  precision highp float;
`;

/**
 * Vertex shader for crossfiltering data points and projecting it to a Cartesian plane
 * @internal
 */

export const vertPlom = /* language=GLSL */ `${vertTop}

uniform float scatter; // 0.0: lines; needs gl.LINES; 1.0: scatter; needs gl.POINTS

uniform vec2 resolution;
uniform vec2 viewBoxPosition;
uniform vec2 viewBoxSize;

uniform mat4 loA, hiA, loB, hiB, loC, hiC, loD, hiD;
uniform mat4 dim1A, dim2A, dim1B, dim2B, dim1C, dim2C, dim1D, dim2D;
uniform vec2 zoomScale, zoomOffset;
uniform float contextPointRadius;

uniform sampler2D palette;
uniform vec3 hoverIdentifier;

uniform float pointSize;

// 16 * 4 == 64 dimensions
layout(location=${attributeLocations.v0}) in vec4 v0;
layout(location=${attributeLocations.v1}) in vec4 v1;
layout(location=${attributeLocations.v2}) in vec4 v2;
layout(location=${attributeLocations.v3}) in vec4 v3;
layout(location=${attributeLocations.v4}) in vec4 v4;
layout(location=${attributeLocations.v5}) in vec4 v5;
layout(location=${attributeLocations.v6}) in vec4 v6;
layout(location=${attributeLocations.v7}) in vec4 v7;
layout(location=${attributeLocations.v8}) in vec4 v8;
layout(location=${attributeLocations.v9}) in vec4 v9;
layout(location=${attributeLocations.va}) in vec4 va;
layout(location=${attributeLocations.vb}) in vec4 vb;
layout(location=${attributeLocations.vc}) in vec4 vc;
layout(location=${attributeLocations.vd}) in vec4 vd;
layout(location=${attributeLocations.ve}) in vec4 ve;
layout(location=${attributeLocations.vf}) in vec4 vf;

out vec4 fragColor;
flat out vec4 pickColor;
flat out float side; // 0: left, 1: right
flat out float filteredPointSize;

const vec4 UNIT = vec4(1, 1, 1, 1);
const float OUTSIDE_FRUSTUM_Z = 2.0; // setting the frustum properly will ensure that this will be outside

float mulSum(mat4 p, mat4 v) {
  return dot(matrixCompMult(p, v) * UNIT, UNIT); // elementwise multiply the two matrices, then sum all values
}

mat4 matrixClamp(mat4 m, mat4 lo, mat4 hi) {
  return mat4(
    clamp(m[0], lo[0], hi[0]),
    clamp(m[1], lo[1], hi[1]),
    clamp(m[2], lo[2], hi[2]),
    clamp(m[3], lo[3], hi[3])
  );
}

bool matrixShow(mat4 v, mat4 lo, mat4 hi) {
  return matrixClamp(v, lo, hi) == v;
}

float axisY(float x, mat4 v[4]) {
  float y1 = mulSum(v[0], dim1A) + mulSum(v[1], dim1B) + mulSum(v[2], dim1C) + mulSum(v[3], dim1D);
  float y2 = mulSum(v[0], dim2A) + mulSum(v[1], dim2B) + mulSum(v[2], dim2C) + mulSum(v[3], dim2D);
  return y1 * (1.0 - x) + y2 * x;
}

bool insideLoHi(mat4 v[4]) {
  return matrixShow(v[0], loA, hiA)
      && matrixShow(v[1], loB, hiB)
      && matrixShow(v[2], loC, hiC)
      && matrixShow(v[3], loD, hiD);
}

void main() {
  vec4 abs_vf = abs(vf);
  float proximity = abs_vf[3]; // the higher the value, the more proximal (closer) to the user, in Z order
  mat4 values[4] = mat4[4](mat4(v0, v1, v2, v3), mat4(v4, v5, v6, v7), mat4(v8, v9, va, vb), mat4(vc, vd, ve, abs_vf));
  float leftOrRightVertex = sign(vf[3]);
  float x = scatter * axisY(1.0, values) + (1.0 - scatter) * (0.5 * leftOrRightVertex + 0.5);
  float y = axisY((1.0 - scatter) * x, values);
  vec2 baseBase = viewBoxSize * vec2(x, y);
  vec2 baseViewBoxXY = (baseBase - zoomOffset) * zoomScale + zoomOffset;
  vec2 viewBoxXY = viewBoxPosition + baseViewBoxXY;
  bool show = insideLoHi(values);

  vec3 hoverMatchDiff = abs(hoverIdentifier - abs_vf.rgb);
  bool isHighlight = hoverMatchDiff == clamp(hoverMatchDiff, vec3(-1./256.), vec3(1./256.)); // diff less than 1/255th

  float depth = isHighlight ? 0.0 : 1.0 - proximity;
  gl_Position = vec4(2.0 * viewBoxXY / resolution - 1.0, show ? depth - 1.: depth, 1.);

  pickColor = vec4(abs_vf.rgb, 1.0);

  // color: ternary hell, fixme
  fragColor = isHighlight
              ? vec4(1, 0, 1, 1)
              : show
              ? texelFetch(palette, ivec2(proximity * 255.0, 0), 0)
              : contextPointRadius == 0.
              ? vec4(0.)
              : vec4(119., 119., 119., scatter == 1. ? 1. : .1);

  // for when gl.drawArrays is called with gl.POINTS
  filteredPointSize = show ? pointSize : contextPointRadius; // parcoords discards too on zero "point" size
  gl_PointSize = isHighlight ? 3.0 * filteredPointSize : filteredPointSize;
  side = round(scatter) * leftOrRightVertex;
}`;

/**
 * Fragment shader for splatting a point as scatter points
 * @internal
 */

export const fragPlom = /* language=GLSL */ `${fragTop}

uniform float pointSize;
in vec4 fragColor;
flat in float side;
flat in float filteredPointSize;
out vec4 theFragColor;
// Only one of the 4 channels (rgba) is used; for count. The others may gain sum, sum of suqares etc.

void main() {
  if(side > 0.0 || filteredPointSize == 0.0) discard;

  if(side < 0.0) {
    float R = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    float delta = fwidth(r);
    float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    if (r > R) discard;
    theFragColor = vec4(fragColor.rgb, alpha * fragColor.a);
  } else {
    theFragColor = fragColor;
  }
}`;

/** @internal */
export const fragPlomPick = /* language=GLSL */ `${fragTop}

out vec4 theFragColor;
uniform float pointSize;
flat in float side;
flat in float filteredPointSize;
flat in vec4 pickColor;
const float R = 1.0;

void main() {
  if(side > 0.0 || filteredPointSize == 0.0) discard;

  if(side < 0.0) {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > R) discard;
  }
  theFragColor = pickColor;
}`;

/** @internal */
export const fragBinGrid = /* language=GLSL */ `${fragTop}

out vec4 theFragColor;
void main() {
  theFragColor = vec4(0, 0, 0, 1);
}`;

/** @internal */
export const fragNormalSplat = /* language=GLSL */ `${fragTop}

uniform float kernelExponent;
in vec4 fragColor;
flat in float side;
out vec4 theFragColor;
// Only one of the 4 channels (rgba) is used; for count. The others may gain sum, sum of suqares etc.

void main() {
  if(side >= 0.0) discard;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;
  float delta = fwidth(r);
  float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  theFragColor = vec4(fragColor.rgb, alpha * fragColor.a * pow(1.0 - r, kernelExponent));
}`;

/**
 * Fragment shader: determine the value domain on a binCount.xy grid area
 * @internal
 */

export const fragBinRange = /* language=GLSL */ `${fragTop}

uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows
uniform sampler2D binningRaster;
flat in ivec2 textureOffset;
out vec4 theFragColor;

void main() {
  float lo = 0.0;
  float hi = 0.0;
  for(int i = 0; i < binCount.x; i++) {
    for(int j = 0; j < binCount.y; j++) {
      ivec2 binCoord = ivec2(i, j);
      float val = texelFetch(binningRaster, textureOffset + binCoord, 0).a;
      lo = min(lo, val);
      hi = max(hi, val);
    }
  }

  theFragColor = vec4(lo, 1.0 / (hi - lo), hi, 1);
}`;

/** @internal */
export const vertHeatmap = /* language=GLSL */ `${vertTop}

uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows

uniform vec2 resolution;
uniform vec2 viewBoxPosition;
uniform vec2 viewBoxSize;

layout(location=${attributeLocations.v0}) in vec4 v0;
out vec2 xy;
out vec2 viewBoxXY;
flat out ivec2 textureOffset;

void main() {
  xy = v0.xy;

  viewBoxXY = viewBoxPosition + viewBoxSize * xy;
  gl_Position = vec4(2.0 * viewBoxXY / resolution - 1.0, 0, 1);

  textureOffset = ivec2(viewBoxPosition / (viewBoxSize + vec2(0, 0))) * binCount;
}`;

/** @internal */
export const fragHeatmap = /* language=GLSL */ `${fragTop}

uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows
uniform vec2 viewBoxSize;
uniform sampler2D binningRaster;
uniform sampler2D binRanges;
uniform sampler2D heatmapPalette;

in vec2 xy;
flat in ivec2 textureOffset;

out vec4 theFragColor;

const float colorFudgeForWhite = 0.0; // -0.02;

void main() {
  vec2 cellCount = vec2(binCount);
  vec2 maxCellIndex = cellCount - 1.0;
  vec3 binColorScale = texelFetch(binRanges, ivec2(xy), 0).rgb;
  vec2 binLookupWithinPanel = vec2(min(xy * cellCount, maxCellIndex));
  vec2 binLookup = vec2(textureOffset) + binLookupWithinPanel;
  float unitValue = texture(binningRaster, binLookup / vec2(textureSize(binningRaster, 0))).a * binColorScale.g;
  bool zeroDomain = binColorScale.r == binColorScale.b;
  float tamperedUnitValue = zeroDomain ? colorFudgeForWhite : sqrt(unitValue) + colorFudgeForWhite;
  // subtraction to make yellow starting color white
  theFragColor = texelFetch(heatmapPalette, ivec2(255.0 - min(tamperedUnitValue, 1.0) * 255.0, 0), 0);
}`;

/** @internal */
export const fragHexHeatmap = /* language=GLSL */ `${fragTop}

  uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows
  uniform vec2 resolution;
  uniform vec2 viewBoxSize;
  uniform vec2 viewBoxPosition;
  uniform sampler2D binningRaster;
  uniform sampler2D binRanges;
  uniform sampler2D heatmapPalette;

  in vec2 xy;
  in vec2 viewBoxXY;
  flat in ivec2 textureOffset;

  out vec4 theFragColor;

  const float colorFudgeForWhite = -0.02;
  const vec2 normalizedHexVector = normalize(vec2(1, 1.732)); // 1.732 is the square root of 3
  const float hexWidthFudge = 1.1; // otherwise the hexagon is too wide; todo look into it

  void main() {
    float alpha = 1.0;
    vec2 cellCount = vec2(binCount);
    vec2 maxCellIndex = cellCount - 1.0;
    vec3 binColorScale = texelFetch(binRanges, ivec2(xy), 0).rgb;
    vec2 cellXY = xy * cellCount;
    bool hexOffsetRow = int(cellXY.y) % 2 == 1;
    vec2 hexXY = hexOffsetRow ? xy : vec2(xy.x + 0.5 / cellCount.x, xy.y);

    vec2 binLookupWithinPanel = vec2(min(hexXY * cellCount, maxCellIndex));
    vec2 binLookup = vec2(textureOffset) + binLookupWithinPanel;

    vec2 cellSize = viewBoxSize / cellCount;

    vec2 hexOffset = hexOffsetRow ? vec2(0, 0) : vec2(0.5 * cellSize.x, 0);
    vec2 unitDistanceFromCorner0 = fract((viewBoxXY - viewBoxPosition - hexOffset) / cellSize);
    vec2 cxy0 = 2.0 * unitDistanceFromCorner0 - 1.0;

    // per cell hexagon:
    vec2 uv = abs(cxy0);
    float d = max(dot(uv, normalizedHexVector), hexWidthFudge * uv.x);
    float delta = fwidth(d); // not sure if d is rock solid here but looks good enough
    alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, d);

    // ... or circle:
    // float r0 = dot(cxy0, cxy0);
    // if (r0 > 1.) discard;

    // per panel circle
    vec2 unitDistanceFromCorner1 = xy;
    vec2 cxy1 = 2.0 * unitDistanceFromCorner1 - vec2(1);
    float r1 = dot(cxy1, cxy1);
    //if (r1 > 1.0) discard;

    // per entire SPLOM circle
    vec2 unitDistanceFromCorner2 = viewBoxXY / resolution;
    vec2 cxy2 = 2.0 * unitDistanceFromCorner2 - vec2(1);
    float r2 = dot(cxy2, cxy2);
    //if (r2 > 1.0) discard;

    float unitValue = texture(binningRaster, binLookup / vec2(textureSize(binningRaster, 0))).a * binColorScale.g;
    bool zeroDomain = binColorScale.r == binColorScale.b;
    float tamperedUnitValue = zeroDomain ? colorFudgeForWhite : sqrt(unitValue) + colorFudgeForWhite;
    // subtraction to make yellow starting color white
    theFragColor = texelFetch(
      heatmapPalette,
      ivec2(255.0 - min(tamperedUnitValue, 1.0) * 255.0, 0), 0
    ) * vec4(1, 1, 1, alpha);
  }`;

/** @internal */
export const fragAreaChart = /* language=GLSL */ `${fragTop}

uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows
uniform vec2 viewBoxSize;
uniform sampler2D binningRaster;
uniform sampler2D binRanges;

in vec2 xy;
flat in ivec2 textureOffset;

out vec4 theFragColor;

const float colorFudgeForWhite = 0.0; // -0.02;

void main() {
  vec2 cellCount = vec2(binCount);
  vec2 maxCellIndex = cellCount - 1.0;
  vec3 binColorScale = texelFetch(binRanges, ivec2(xy), 0).rgb;
  vec2 binLookupWithinPanel = vec2(min(xy * cellCount, maxCellIndex));
  vec2 binLookup = vec2(textureOffset) + binLookupWithinPanel;
  float unitValue = texture(binningRaster, binLookup / vec2(textureSize(binningRaster, 0))).a * binColorScale.g;

  float ratio = 0.9; // from \`const s = yIndex === 0 ? 1 : 0.9\` - todo unify eg. via a uniform
  float top = 300.0; // this is the panel height in px - todo put it in a uniform
  float bottom = 93.0; // todo check where it's coming from
  float span = top - bottom;
  float valueRatio = unitValue * .8 * .5;
  // todo the unitValue isn't exactly 0..1, there's clipping,
  // solve with \`texelFetch(binRanges, ivec2(0, 0), 0).rgb\`; also, don't use the top 10%, to make place for text
  float limit = bottom + valueRatio * span;

  float inPanelHeight = gl_FragCoord.y - float(textureOffset.y) / ratio * viewBoxSize.y;
  bool predicate = inPanelHeight >= limit;

  if (predicate) discard;

  float solidPartOfArea = 0.9; // todo consider \`fwidth\` derivative
  float alpha = 1.0  - smoothstep(
    0.0,
    1.0,
    clamp((inPanelHeight - solidPartOfArea * limit) / (limit - solidPartOfArea * limit), 0.0, 1.0)
  );

  theFragColor = vec4(1, 0, 1, 0.5 * alpha);
}`;

/** @internal */
export const fragContours = /* language=GLSL */ `${fragTop}

uniform highp ivec2 binCount; // eg. [32, 16] means a raster of 32 columns, 16 rows
uniform sampler2D binningRaster;
uniform sampler2D binRanges;

in vec2 xy;
flat in ivec2 textureOffset;

out vec4 theFragColor;

const float modCycle = 2.0;

void main() {
  vec2 cellCount = vec2(binCount);
  vec2 maxCellIndex = cellCount - 1.0;
  vec3 binColorScale = texelFetch(binRanges, ivec2(xy), 0).rgb;
  ivec2 binLookupWithinPanel = ivec2(min(floor(xy * cellCount), maxCellIndex));
  ivec2 binLookup = textureOffset + binLookupWithinPanel;
  float unitValue = texture(
           binningRaster,
           (vec2(textureOffset) + min(xy * cellCount, maxCellIndex)) / vec2(textureSize(binningRaster, 0))
  ).a * binColorScale.g;

  float logUnitValue = log(0.001 + unitValue); // subtraction to make yellow starting color white

  float z = logUnitValue;
  float d = fract(z);
  if(mod(z, modCycle) > 1.0) d = 1.0 - d;
  float val = 1.0 - 0.7 * d / fwidth(z);
  theFragColor = vec4(val);
}`;

/**
 * Rectangle (border around the panels)
 * @internal
 */
export const vertBorder = /* language=GLSL */ `${vertTop}

uniform vec2 resolution;
uniform vec2 viewBoxPosition;
uniform vec2 viewBoxSize;

const vec2 fudge = vec2(0, 0.5); // otherwise bottom border line is thinner :shrug:

layout(location=${attributeLocations.v0}) in vec4 v0;

void main() {
  vec2 viewBoxXY = viewBoxPosition + viewBoxSize * v0.xy;
  gl_Position = vec4(2.0 * (viewBoxXY + fudge) / resolution - 1.0, -0.1, 1);
}`;

/** @internal */
export const fragBorder = /* language=GLSL */ `${fragTop}

out vec4 theFragColor;
void main() {
  theFragColor = vec4(0.5, 0.5, 0.5, 1);
}`;
