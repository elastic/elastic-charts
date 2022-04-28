/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';

import { TransformMatrix3d } from '..';

// converts a transform matrix to a CSS string
const matrixToCSS = (transformMatrix: TransformMatrix3d): string =>
  transformMatrix ? `matrix3d(${transformMatrix.join(',')})` : 'translate3d(0,0,0)';

interface SharedAnnotationProps {
  id: string;
  transformMatrix: TransformMatrix3d;
}

interface AlignmentGuideProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const AlignmentGuide: FC<AlignmentGuideProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasAlignmentGuide canvasInteractable canvasLayoutAnnotation"
    key={id}
    style={{
      background: 'magenta',
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      position: 'absolute',
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface BorderConnectionProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const BorderConnection: FC<BorderConnectionProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasBorderConnection canvasLayoutAnnotation"
    key={id}
    style={{
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      position: 'absolute',
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface BorderResizeHandleProps extends SharedAnnotationProps {
  zoomScale?: number;
}

/** @internal */
export const BorderResizeHandle: FC<BorderResizeHandleProps> = ({ id, transformMatrix, zoomScale = 1 }) => (
  <div
    className="canvasBorderResizeHandle canvasLayoutAnnotation"
    key={id}
    style={{
      transform: `${matrixToCSS(transformMatrix)} scale3d(${1 / zoomScale},${1 / zoomScale}, 1)`,
    }}
  />
);

interface DragBoxAnnotationProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const DragBoxAnnotation: FC<DragBoxAnnotationProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasDragBoxAnnotation canvasLayoutAnnotation"
    key={id}
    style={{
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface HoverAnnotationProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const HoverAnnotation: FC<HoverAnnotationProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasHoverAnnotation canvasLayoutAnnotation"
    key={id}
    style={{
      width,
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transform: matrixToCSS(transformMatrix),
    }}
  />
);

interface RotationHandleProps extends SharedAnnotationProps {
  zoomScale?: number;
}

/** @internal */
export const RotationHandle: FC<RotationHandleProps> = ({ id, transformMatrix, zoomScale = 1 }) => (
  <div className="canvasRotationHandle canvasLayoutAnnotation" style={{ transform: matrixToCSS(transformMatrix) }}>
    <div
      className="canvasRotationHandle__handle"
      key={id}
      style={{ transform: `scale3d(${1 / zoomScale},${1 / zoomScale},1)` }}
    />
  </div>
);

interface TooltipAnnotationProps extends SharedAnnotationProps {
  text: string;
}

/** @internal */
export const TooltipAnnotation: FC<TooltipAnnotationProps> = ({ id, transformMatrix, text }) => {
  return (
    <div
      className="tooltipAnnotation canvasLayoutAnnotation"
      key={id}
      style={{ transform: `${matrixToCSS(transformMatrix)} translate(1em, -1em)` }}
    >
      <p>{text}°</p>
    </div>
  );
};
