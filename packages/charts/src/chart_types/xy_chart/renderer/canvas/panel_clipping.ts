/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
const CLIPPING_MARGINS = 0.5;

/** @internal */
export function getPanelClipping(panel: Dimensions, rotation: Rotation): Rect {
  const vertical = Math.abs(rotation) === 90;
  const width = (vertical ? panel.height : panel.width) + CLIPPING_MARGINS * 2;
  const height = (vertical ? panel.width : panel.height) + CLIPPING_MARGINS * 2;
  return {
    x: -CLIPPING_MARGINS,
    y: -CLIPPING_MARGINS,
    width,
    height,
  };
}
