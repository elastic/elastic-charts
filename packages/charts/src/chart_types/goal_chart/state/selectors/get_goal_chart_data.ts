/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { geometries } from './geometries';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export type GoalChartData = {
  maximum: number;
  minimum: number;
  target?: number;
  value: number;
};

/** @internal */
export type GoalChartLabels = {
  minorLabel: string;
  majorLabel: string;
};

/** @internal */
export const getGoalChartDataSelector = createCustomCachedSelector([geometries], (geoms): GoalChartData => {
  const goalChartData: GoalChartData = {
    maximum: geoms.bulletViewModel.highestValue,
    minimum: geoms.bulletViewModel.lowestValue,
    target: geoms.bulletViewModel.target,
    value: geoms.bulletViewModel.actual,
  };
  return goalChartData;
});

/** @internal */
export const getGoalChartLabelsSelector = createCustomCachedSelector([geometries], (geoms) => {
  return { majorLabel: geoms.bulletViewModel.labelMajor, minorLabel: geoms.bulletViewModel.labelMinor };
});

/** @internal */
export const getGoalChartSemanticDataSelector = createCustomCachedSelector([geometries], (geoms) => {
  return geoms.bulletViewModel.bands ?? [];
});

/** @internal */
export const getFirstTickValueSelector = createCustomCachedSelector([geometries], (geoms) => {
  return geoms.bulletViewModel.lowestValue;
});
