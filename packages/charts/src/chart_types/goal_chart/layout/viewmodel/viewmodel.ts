/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GoalSpec } from '../../specs';
import { Config } from '../types/config_types';
import { BulletViewModel, PickFunction, ShapeViewModel } from '../types/viewmodel_types';

/** @internal */
export function shapeViewModel(spec: GoalSpec, config: Config): ShapeViewModel {
  const { width, height, margin } = config;

  const innerWidth = width * (1 - Math.min(1, margin.left + margin.right));
  const innerHeight = height * (1 - Math.min(1, margin.top + margin.bottom));

  const chartCenter = {
    x: width * margin.left + innerWidth / 2,
    y: height * margin.top + innerHeight / 2,
  };

  const pickQuads: PickFunction = (x, y) =>
    -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
      ? [bulletViewModel]
      : [];

  const {
    subtype,
    base,
    target,
    actual,
    bands,
    ticks,
    bandFillColor,
    tickValueFormatter,
    labelMajor,
    labelMinor,
    centralMajor,
    centralMinor,
    bandLabels,
  } = spec;

  const [lowestValue, highestValue] = [base, ...(target ? [target] : []), actual, ...bands, ...ticks].reduce(
    ([min, max], value) => [Math.min(min, value), Math.max(max, value)],
    [Infinity, -Infinity],
  );

  const aboveBaseCount = bands.filter((b: number) => b > base).length;
  const belowBaseCount = bands.filter((b: number) => b <= base).length;

  const callbackArgs = {
    base,
    target,
    actual,
    highestValue,
    lowestValue,
    aboveBaseCount,
    belowBaseCount,
  };

  const bulletViewModel: BulletViewModel = {
    subtype,
    base,
    target,
    actual,
    bands: bands.map((value: number, index: number) => ({
      value,
      fillColor: bandFillColor({ value, index, ...callbackArgs }),
      text: bandLabels,
    })),
    ticks: ticks.map((value: number, index: number) => ({
      value,
      text: tickValueFormatter({ value, index, ...callbackArgs }),
    })),
    labelMajor: typeof labelMajor === 'string' ? labelMajor : labelMajor({ value: NaN, index: 0, ...callbackArgs }),
    labelMinor: typeof labelMinor === 'string' ? labelMinor : labelMinor({ value: NaN, index: 0, ...callbackArgs }),
    centralMajor:
      typeof centralMajor === 'string' ? centralMajor : centralMajor({ value: NaN, index: 0, ...callbackArgs }),
    centralMinor:
      typeof centralMinor === 'string' ? centralMinor : centralMinor({ value: NaN, index: 0, ...callbackArgs }),
    highestValue,
    lowestValue,
    aboveBaseCount,
    belowBaseCount,
  };

  // combined viewModel
  return {
    config,
    chartCenter,
    bulletViewModel,
    pickQuads,
  };
}
