/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Positionable } from '../positionable';
import { ElementContent } from '../element_content';

/** @internal */
export const ElementWrapper = (props) => {
  const { renderable, transformMatrix, width, height, state, handlers } = props;

  return (
    <Positionable transformMatrix={transformMatrix} width={width} height={height}>
      <ElementContent renderable={renderable} state={state} handlers={handlers} width={width} height={height} />
    </Positionable>
  );
};
