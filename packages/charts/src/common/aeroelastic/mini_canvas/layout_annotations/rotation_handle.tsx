/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';

import { TransformMatrix3d } from '../..';
import { matrixToCSS } from './dom';

interface Props {
  transformMatrix: TransformMatrix3d;
  zoomScale?: number;
}

/** @internal */
export const RotationHandle: FC<Props> = ({ transformMatrix, zoomScale = 1 }) => (
  <div
    className="canvasRotationHandle canvasLayoutAnnotation"
    style={{
      transform: matrixToCSS(transformMatrix),
    }}
  >
    <div
      className="canvasRotationHandle__handle"
      style={{ transform: `scale3d(${1 / zoomScale},${1 / zoomScale},1)` }}
    />
  </div>
);
