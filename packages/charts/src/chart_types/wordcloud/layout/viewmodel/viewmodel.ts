/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { WordcloudSpec } from '../../specs';
import { Config } from '../types/config_types';
import { WordcloudViewModel, PickFunction, ShapeViewModel } from '../types/viewmodel_types';

/** @internal */
export function shapeViewModel(spec: WordcloudSpec, config: Config): ShapeViewModel {
  const { width, height, margin } = config;

  const innerWidth = width * (1 - Math.min(1, margin.left + margin.right));
  const innerHeight = height * (1 - Math.min(1, margin.top + margin.bottom));

  const chartCenter = {
    x: width * margin.left + innerWidth / 2,
    y: height * margin.top + innerHeight / 2,
  };

  const {
    id,
    startAngle,
    endAngle,
    angleCount,
    padding,
    fontWeight,
    fontFamily,
    fontStyle,
    minFontSize,
    maxFontSize,
    spiral,
    exponent,
    data,
    weightFn,
    outOfRoomCallback,
  } = spec;

  const wordcloudViewModel: WordcloudViewModel = {
    startAngle,
    endAngle,
    angleCount,
    padding,
    fontWeight,
    fontFamily,
    fontStyle,
    minFontSize,
    maxFontSize,
    spiral,
    exponent,
    data,
    weightFn,
    outOfRoomCallback,
  };

  const pickQuads: PickFunction = (x, y) =>
    -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
      ? [wordcloudViewModel]
      : [];

  // combined viewModel
  return {
    config,
    chartCenter,
    wordcloudViewModel,
    pickQuads,
    specId: id,
  };
}
