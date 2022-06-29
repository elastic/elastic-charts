/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { Dimensions } from '../../../../utils/dimensions';
import { RectAnnotationDatum } from '../../utils/specs';

/** @internal */
export interface AnnotationRectProps {
  specId: string;
  id: string;
  datum: RectAnnotationDatum;
  rect: Rect;
  panel: Dimensions;
}
