/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Attributes } from '../../../common/kingly';
import type { ColumnarViewModel } from '../flame_api';

/** @internal */
export function uploadToWebgl(
  gl: WebGL2RenderingContext,
  attributes: Attributes,
  columnarViewModel: Partial<ColumnarViewModel>,
) {
  attributes.forEach((setValue, key) => {
    const value = columnarViewModel[key as keyof ColumnarViewModel];
    if (value instanceof Float32Array) setValue(value);
  });
}
