/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SharedGeometryStateStyle } from './theme';
import { Colors } from '../../common/colors';
import { Margins } from '../dimensions';

/** @internal */
export const DEFAULT_MISSING_COLOR = Colors.Red.keyword;

/** @internal */
export const DEFAULT_CHART_PADDING: Margins = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
/** @internal */
export const DEFAULT_CHART_MARGINS: Margins = {
  left: 10,
  right: 10,
  top: 10,
  bottom: 10,
};

/** @internal */
export const DEFAULT_GEOMETRY_STYLES: SharedGeometryStateStyle = {
  default: {
    opacity: 1,
  },
  highlighted: {
    opacity: 1,
  },
  unhighlighted: {
    opacity: 0.25,
  },
};
