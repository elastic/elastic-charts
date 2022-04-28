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
  height: number;
  transformMatrix: TransformMatrix3d;
  width: number;
}

/** @internal */
export const DragBoxAnnotation: FC<Props> = ({ transformMatrix, width, height }) => (
  <div
    className="canvasDragBoxAnnotation canvasLayoutAnnotation"
    style={{
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);
