/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Radian } from '../../../../common/geometry';
import { ScaleContinuous } from '../../../../scales';
import { Dimensions } from '../../../../utils/dimensions';
import { Theme } from '../../../../utils/themes/theme';
import { GoalSpec } from '../../specs';
import { BulletViewModel, PickFunction, ShapeViewModel } from '../types/viewmodel_types';

/** @internal */
export function shapeViewModel(spec: GoalSpec, theme: Theme, chartDimensions: Dimensions): ShapeViewModel {
  const { width, height } = chartDimensions;
  const { chartMargins: margin } = theme;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const chartCenter = {
    x: margin.left + innerWidth / 2,
    y: margin.top + innerHeight / 2,
  };

  const {
    subtype,
    base,
    target,
    actual,
    bands,
    bandFillColor,
    tickValueFormatter,
    labelMajor,
    labelMinor,
    centralMajor,
    centralMinor,
    bandLabels,
    angleStart,
    angleEnd,
  } = spec;
  const [lowestValue, highestValue] = [
    base,
    ...(target ? [target] : []),
    actual,
    ...bands,
    ...(spec.ticks ?? []),
  ].reduce(([min, max], value) => [Math.min(min, value), Math.max(max, value)], [Infinity, -Infinity]);

  const ticks =
    spec.ticks ??
    new ScaleContinuous(
      {
        type: 'linear',
        domain: [lowestValue, highestValue],
        range: [0, 1],
      },
      {
        desiredTickCount: getDesiredTicks(angleStart, angleEnd),
      },
    ).ticks();

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
    angleStart,
    angleEnd,
    tooltipValueFormatter: () => '',
  };

  const pickQuads: PickFunction = (x, y) =>
    -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
      ? [bulletViewModel]
      : [];

  return {
    theme: theme.goal,
    chartCenter,
    bulletViewModel,
    pickQuads,
  };
}

function getDesiredTicks(angleStart: Radian, angleEnd: Radian) {
  const arc = Math.abs(angleStart - angleEnd);
  return Math.ceil(arc / (Math.PI / 4));
}
