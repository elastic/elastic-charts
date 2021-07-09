/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Pixels, SizeRatio } from '../../../../common/geometry';
import { FontFamily } from '../../../../common/text_utils';
import { Color } from '../../../../utils/common';

// todo switch to `io-ts` style, generic way of combining static and runtime type info
/** @public */
export interface Config {
  angleStart: number;
  angleEnd: number;

  // shape geometry
  width: number;
  height: number;
  margin: { left: SizeRatio; right: SizeRatio; top: SizeRatio; bottom: SizeRatio };

  // general text config
  fontFamily: FontFamily;

  // fill text config
  minFontSize: Pixels;
  maxFontSize: Pixels;

  // other
  backgroundColor: Color;
  sectorLineWidth: Pixels;
}
