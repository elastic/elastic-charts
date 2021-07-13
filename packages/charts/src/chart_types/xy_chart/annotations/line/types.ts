/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Line } from '../../../../geoms/types';
import { Dimensions } from '../../../../utils/dimensions';
import { LineAnnotationDatum } from '../../utils/specs';
import { AnnotationMarker } from '../types';

/** @internal */
export interface AnnotationLineProps {
  specId: string;
  id: string;
  datum: LineAnnotationDatum;
  /**
   * The path points of a line annotation
   */
  linePathPoints: Line;
  markers: Array<AnnotationMarker>;
  panel: Dimensions;
}
